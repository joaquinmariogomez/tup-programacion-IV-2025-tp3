import express from "express";
import { db } from "./db.js";
import { body } from "express-validator";
import { verificarAutenticacion, verificarAutorizacion } from "./auth.js";
import { validarId, verificarValidaciones } from "./validaciones.js";

const router = express.Router();

const handleRoleCreationSecurity = async (req, res, next) => {
    try {
        // Consultar cuántos roles existen.
        const [[{ count }]] = await db.execute("SELECT COUNT(*) as count FROM roles");
        
        if (count > 0) {
            // Si ya hay roles, se requiere autenticación y rol 'admin'.
            verificarAutenticacion(req, res, () => verificarAutorizacion("admin")(req, res, next));
        } else {
            // Si es el primer rol, permitimos la creación sin Auth/Auth.
            req.isFirstRole = true;
            next();
        }
    } catch (error) {
        res.status(500).json({ success: false, message: "Error de base de datos al verificar roles." });
    }
};

// Listar todos (Requiere Autenticación)
router.get("/", verificarAutenticacion, async (req, res) => {
    const [rows] = await db.execute("SELECT id_rol, rol FROM roles");
    res.json({ success: true, roles: rows });
});

// Crear rol (Requiere rol 'admin', pero permite el primero si la tabla está vacía)
router.post(
    "/",
    handleRoleCreationSecurity, 
    body("rol", "El nombre del rol es obligatorio").isLength({ min: 1, max: 50 }),
    verificarValidaciones,
    async (req, res) => {
        const { rol } = req.body;
        
        if (req.isFirstRole && rol.toLowerCase() !== 'admin') {
            return res.status(400).json({ success: false, message: "El primer rol creado debe ser 'admin'." });
        }

        const [result] = await db.execute("INSERT INTO roles (rol) VALUES (?)", [rol]);

    res.status(201).json({
        success: true,
        data: { id: result.insertId, rol },
    });
}
);

// Eliminar rol 
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