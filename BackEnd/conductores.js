import express from "express";
import { db } from "./db.js";
import { validarId, verificarValidaciones } from "./validaciones.js";
import { body } from "express-validator";
import { verificarAutenticacion, verificarAutorizacion } from "./auth.js";

const router = express.Router();

// Validaciones para Conductor
const validarConductor = [
    body("nombre", "Nombre es obligatorio").isLength({ min: 1, max: 50 }),
    body("apellido", "Apellido es obligatorio").isLength({ min: 1, max: 50 }),
    body("dni", "DNI es obligatorio y numérico").isNumeric().isLength({ min: 7, max: 10 }),
    body("licencia", "Licencia es obligatoria").isLength({ min: 1, max: 50 }),
    body("fecha_vencimiento_licencia", "Fecha de vencimiento inválida").isDate(),
];

// GET /conductores - Listar todos (Auth Requerida)
router.get("/", verificarAutenticacion, async (req, res) => {
    const [rows] = await db.execute(
        "SELECT id_conductor, nombre, apellido, dni, licencia, fecha_vencimiento_licencia FROM conductores"
    );
    res.json({ success: true, conductores: rows });
});

// POST /conductores - Crear (Auth y Rol Admin Requerido)
router.post(
    "/",
    verificarAutenticacion,
    verificarAutorizacion("admin"),
    validarConductor,
    verificarValidaciones,
    async (req, res) => {
        const { nombre, apellido, dni, licencia, fecha_vencimiento_licencia } = req.body;

        try {
            const [result] = await db.execute(
                "INSERT INTO conductores (nombre, apellido, dni, licencia, fecha_vencimiento_licencia) VALUES (?,?,?,?,?)",
                [nombre, apellido, dni, licencia, fecha_vencimiento_licencia]
            );

            res.status(201).json({
                success: true,
                data: { id: result.insertId, nombre, apellido },
            });
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                 return res.status(400).json({ success: false, message: "El DNI o Licencia ya se encuentra registrada." });
            }
            throw error; 
        }
    }
);
// Nota: Puedes agregar GET/:id, PUT/:id, DELETE/:id copiando la lógica de vehiculos.js.
export default router;