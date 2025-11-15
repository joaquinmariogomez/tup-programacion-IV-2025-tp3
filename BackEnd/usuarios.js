import express from "express";
import { db } from "./db.js";
import { validarId, verificarValidaciones } from "./validaciones.js";
import { body } from "express-validator";
import bcrypt from "bcrypt";
import { verificarAutenticacion, verificarAutorizacion } from "./auth.js";

const router = express.Router();

// RUTA PÚBLICA: GET /usuarios/public - Listar información básica sin Autenticación
router.get("/public", async (req, res) => {
    // Es recomendable devolver solo datos no sensibles en rutas públicas
    const [rows] = await db.execute("SELECT id_usuario, username, nombre, apellido FROM usuarios");
    res.json({ success: true, usuarios: rows });
});


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

// GET /usuarios/:id/roles - Obtener los roles de un usuario (Requiere Autenticación)
router.get(
    "/:id/roles",
    verificarAutenticacion,
    validarId,
    verificarValidaciones,
    async (req, res) => {
        const id = Number(req.params.id);

        const [rows] = await db.execute(
            "SELECT r.id_rol, r.rol " +
            "FROM roles r " +
            "JOIN usuarios_roles ur ON r.id_rol = ur.id_rol " +
            "WHERE ur.id_usuario = ?",
            [id]
        );

        res.json({ success: true, roles: rows });
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

// POST /usuarios - Crear usuario (Con lógica para asignar rol 'admin' al primero)
router.post(
    "/",
    handleUserCreationSecurity, 
    body("username", "Nombre de usuario inválido").isLength({ max: 20 }),
    body("nombre", "Nombre inválido").isLength({ max: 50 }),
    body("password", "Contraseña inválida").isStrongPassword({ minLength: 8 }),
    verificarValidaciones,
    async (req, res) => {
        const { username, apellido, nombre, password } = req.body;

    // Crear Hash de la contraseña con bcrypt
    const hashedPassword = await bcrypt.hash(password, 12);

    // 1. Crear el usuario
    const [result] = await db.execute(
        "INSERT INTO usuarios (username, apellido, nombre, password_hash) VALUES (?,?,?,?)",
        [username, apellido, nombre, hashedPassword]
    );

    const nuevoUsuarioId = result.insertId;

    // Asignar rol de admin al primer usuario para el setup inicial
    if (req.isFirstUser) {
        try {
            // 2. Intentar asignar el rol de administrador (ID 1)
            await db.execute("INSERT INTO usuarios_roles (id_usuario, id_rol) VALUES (?, ?)", [nuevoUsuarioId, 1]);
        } catch (error) {
            // Si falla la asignación de rol (ej. el rol ID 1 no existe - Foreign Key)
            
            // 3. Eliminar el usuario recién creado para evitar inconsistencias
            await db.execute("DELETE FROM usuarios WHERE id_usuario=?", [nuevoUsuarioId]);

            // Devolver un error explícito al cliente
            return res.status(500).json({ 
                success: false, 
                message: "Error al crear el primer usuario y asignar el rol de administrador. Verifique que el rol con ID 1 exista en su tabla 'roles'.", 
            });
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
    verificarAutorizacion("admin"), 
    validarId,
    verificarValidaciones,
    async (req, res) => {
        const id = Number(req.params.id);
        await db.execute("DELETE FROM usuarios WHERE id_usuario=?", [id]);
        res.json({ success: true, data: id });
    }
);

export default router;