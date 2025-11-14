import express from "express";
import { db } from "./db.js";
import { body } from "express-validator";
import { verificarAutenticacion, verificarAutorizacion } from "./auth.js";
import { validarId, verificarValidaciones } from "./validaciones.js";

const router = express.Router();

// Listar todos (Requiere Autenticación)
router.get("/", verificarAutenticacion, async (req, res) => {
    const [rows] = await db.execute("SELECT id_rol, rol FROM roles");
    res.json({ success: true, roles: rows });
});

// Crear rol (Requiere rol 'admin')
router.post(
    "/",
    verificarAutenticacion,
    verificarAutorizacion("admin"),
    body("rol", "El nombre del rol es obligatorio").isLength({ min: 1, max: 50 }),
    verificarValidaciones,
    async (req, res) => {
        const { rol } = req.body;
        const [result] = await db.execute("INSERT INTO roles (rol) VALUES (?)", [rol]);

    res.status(201).json({
        success: true,
        data: { id: result.insertId, rol },
    });
}
);

// Eliminar rol (Requiere rol 'admin')
router.delete(
    "/:id",
    verificarAutenticacion,
    verificarAutorizacion("admin"),
    validarId,
    verificarValidaciones,
    async (req, res) => {
        const id = Number(req.params.id);
        await db.execute("DELETE FROM roles WHERE id_rol=?", [id]);
        res.json({ success: true, data: id });
    }
);

export default router;