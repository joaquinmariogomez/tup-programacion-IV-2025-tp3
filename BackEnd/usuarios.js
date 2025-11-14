import express from "express";
import { db } from "./db.js";
import { validarId, verificarValidaciones } from "./validaciones.js";
import { body } from "express-validator";
import bcrypt from "bcrypt";
import { verificarAutenticacion, verificarAutorizacion } from "./auth.js";

const router = express.Router();

// GET /usuarios - Listar todos (Requiere Autenticación)
router.get("/", verificarAutenticacion, async (req, res) => {
    const [rows] = await db.execute("SELECT id_usuario, username, nombre, apellido FROM usuarios");
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
        const [rows] = await db.execute(
        "SELECT id_usuario, username, nombre, apellido, activo FROM usuarios WHERE id_usuario=?",
        [id]
    );

    if (rows.length === 0) {
        return res.status(404).json({ success: false, message: "Usuario no encontrado" });
    }
    res.json({ success: true, usuario: rows[0] });
}
);

// Middleware inteligente para la creación de usuarios
const handleUserCreationSecurity = async (req, res, next) => {
    try {
        const [[{ count }]] = await db.execute("SELECT COUNT(*) as count FROM usuarios");
        if (count > 0) {
            // Si ya hay usuarios, aplicar seguridad normal
            verificarAutenticacion(req, res, () => verificarAutorizacion("admin")(req, res, next));
        } else {
            // Si es el primer usuario, marcarlo y permitir la creación
            req.isFirstUser = true;
            next();
        }
    } catch (error) {
        res.status(500).json({ success: false, message: "Error de base de datos al verificar usuarios." });
    }
};

// POST /usuarios - Crear usuario (Requiere rol 'admin' y Hashing de Contraseña)
router.post(
    "/",
    handleUserCreationSecurity, // Usamos el nuevo middleware inteligente
    body("username", "Nombre de usuario inválido").isLength({ max: 20 }),
    body("nombre", "Nombre inválido").isLength({ max: 50 }),
    body("password", "Contraseña inválida").isStrongPassword({ minLength: 8 }),
    verificarValidaciones,
    async (req, res) => {
        const { username, apellido, nombre, password } = req.body;

    // Crear Hash de la contraseña con bcrypt
    const hashedPassword = await bcrypt.hash(password, 12);

    const [result] = await db.execute(
        "INSERT INTO usuarios (username, apellido, nombre, password_hash) VALUES (?,?,?,?)",
        [username, apellido, nombre, hashedPassword]
    );

    const nuevoUsuarioId = result.insertId;

    // Si es el primer usuario, forzar el rol de admin (ID 1).
    // Si no, se podrían asignar otros roles o ninguno por defecto.
    if (req.isFirstUser) {
        try {
            await db.execute("INSERT INTO usuarios_roles (id_usuario, id_rol) VALUES (?, ?)", [nuevoUsuarioId, 1]);
        } catch (error) {
            // Manejar el caso en que el rol con ID 1 no exista
        }
    }

    res.status(201).json({
        success: true,
        data: { id: nuevoUsuarioId, username, apellido, nombre },
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
        await db.execute("DELETE FROM usuarios WHERE id_usuario=?", [id]);
        res.json({ success: true, data: id });
    }
);

export default router;