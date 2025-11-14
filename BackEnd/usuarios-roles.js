// backend/usuarios-roles.js
import express from "express";
import { db } from "./db.js";
import { verificarValidaciones } from "./validaciones.js";
import { verificarAutenticacion, verificarAutorizacion } from "./auth.js";
import { param, body } from "express-validator";

const router = express.Router();

// Validaciones 
const validarUsuarioId = param("usuarioId").isInt({ min: 1 });
const validarRolId = param("rolId").isInt({ min: 1 });
const validarRolIdBody = body("id_rol", "El ID del rol es obligatorio").isInt({ min: 1 });

// Metodos
// GET /usuarios-roles/usuarios/1/roles/2
router.get(
    "/usuarios/:usuarioId/roles/:rolId",
    validarUsuarioId,
    validarRolId,
    verificarValidaciones,
    getUsuariosRoles
);

// GET /usuarios-roles/roles/2/usuarios/1
router.get(
    "/roles/:rolId/usuarios/:usuarioId",
    // verificarAutenticacion,
    validarRolId,
    validarUsuarioId,
    verificarValidaciones,
    getUsuariosRoles
);

async function getUsuariosRoles(req, res) {
    const usuarioId = Number(req.params.usuarioId);
    const rolId = Number(req.params.rolId);

    let sql =
        "SELECT ur.id_usuario, ur.id_rol, u.username, r.rol AS rolNombre " +
        "FROM usuarios_roles ur " +
        "JOIN usuarios u ON ur.id_usuario=u.id_usuario " +
        "JOIN roles r ON ur.id_rol=r.id_rol " +
        "WHERE ur.id_usuario=? AND ur.id_rol=?";

    const [rows] = await db.execute(sql, [usuarioId, rolId]);

    if (rows.length === 0) {
        return res
            .status(404)
            .json({ success: false, message: "Usuario/rol no encontrado" });
    }

    res.json({ success: true, data: rows[0] });
}

// POST /usuarios-roles/usuarios/:usuarioId/roles - Asignar un rol (Requiere 'admin')
router.post(
    "/usuarios/:usuarioId/roles",
    verificarAutenticacion,
    verificarAutorizacion("admin"),
    validarUsuarioId,
    validarRolIdBody,
    verificarValidaciones,
    async (req, res) => {
        const usuarioId = Number(req.params.usuarioId);
        const rolId = req.body.id_rol;

        const sql = "INSERT INTO usuarios_roles (id_usuario, id_rol) VALUES (?,?)";

        try {
            await db.execute(sql, [usuarioId, rolId]);
            res.status(201).json({ success: true, message: "Rol asignado correctamente" });
        } catch (error) {
            // Manejo de error si la relación ya existe (UNIQUE KEY violation)
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ success: false, message: "El rol ya está asignado a este usuario." });
            }
            throw error;
        }
    }
);

// DELETE /usuarios-roles/usuarios/:usuarioId/roles/:rolId - Quitar un rol (Requiere 'admin')
router.delete(
    "/usuarios/:usuarioId/roles/:rolId",
    verificarAutenticacion,
    verificarAutorizacion("admin"),
    validarUsuarioId,
    validarRolId,
    verificarValidaciones,
    async (req, res) => {
        const usuarioId = Number(req.params.usuarioId);
        const rolId = Number(req.params.rolId);

        const sql = "DELETE FROM usuarios_roles WHERE id_usuario=? AND id_rol=?";
        await db.execute(sql, [usuarioId, rolId]);

        res.json({ success: true, message: "Rol quitado correctamente" });
    }
);

export default router;