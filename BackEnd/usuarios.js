import express from "express";
import { execute } from "./db.js";
import { validarId, verificarValidaciones } from "./validaciones.js";
import { body } from "express-validator";
import bcrypt from "bcrypt";
import { verificarAutenticacion, verificarAutorizacion } from "./auth.js";

const router = express.Router();

// GET /usuarios - Listar todos (Requiere Autenticación)
router.get("/", verificarAutenticacion, async (req, res) => {
    const [rows] = await execute("SELECT id_usuario, username, nombre, apellido FROM usuarios");
    res.json({ success: true, usuarios: rows });
});

// GET /usuarios/:id - Obtener por ID (Requiere Autenticación)
router.get(
    "/:id",
    verificarAutenticacion,
    validarId,
    verificarValidaciones,
    async (req, res) => {
        const id = Number(req.params.id);
        const [rows] = await execute(
        "SELECT id_usuario, username, nombre, apellido, activo FROM usuarios WHERE id_usuario=?",
        [id]
    );

    if (rows.length === 0) {
        return res.status(404).json({ success: false, message: "Usuario no encontrado" });
    }
    res.json({ success: true, usuario: rows[0] });
}
);

// POST /usuarios - Crear usuario (Requiere rol 'admin' y Hashing de Contraseña)
router.post(
    "/",
    verificarAutenticacion,
    verificarAutorizacion("admin"), // Solo admin puede crear
    body("username", "Nombre de usuario inválido").isLength({ max: 20 }),
    body("nombre", "Nombre inválido").isLength({ max: 50 }),
    body("password", "Contraseña inválida").isStrongPassword({ minLength: 8 }),
    verificarValidaciones,
    async (req, res) => {
        const { username, apellido, nombre, password } = req.body;

    // Crear Hash de la contraseña con bcrypt
    const hashedPassword = await bcrypt.hash(password, 12);

    const [result] = await execute(
        "INSERT INTO usuarios (username, apellido, nombre, password_hash) VALUES (?,?,?,?)",
        [username, apellido, nombre, hashedPassword]
    );

    res.status(201).json({
        success: true,
        data: { id: result.insertId, username, apellido, nombre },
    });
}
);

// DELETE /usuarios/:id - Eliminar usuario (Requiere rol 'admin')
router.delete(
    "/:id",
    verificarAutenticacion,
    verificarAutorizacion("admin"), // Solo admin puede eliminar
    validarId,
    verificarValidaciones,
    async (req, res) => {
        const id = Number(req.params.id);
        await execute("DELETE FROM usuarios WHERE id_usuario=?", [id]);
        res.json({ success: true, data: id });
    }
);

export default router;