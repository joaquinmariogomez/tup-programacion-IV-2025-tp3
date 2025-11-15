import express from "express";
import { db } from "./db.js";
import { validarId, verificarValidaciones } from "./validaciones.js";
import { body } from "express-validator";
import { verificarAutenticacion, verificarAutorizacion } from "./auth.js";

const router = express.Router();

// Validaciones para Viaje
const validarViaje = [
    body("vehiculo_id", "ID de vehículo inválido").isInt({ min: 1 }),
    body("conductor_id", "ID de conductor inválido").isInt({ min: 1 }),
    body("fecha_salida", "Fecha de salida inválida").isDate(),
    body("fecha_llegada", "Fecha de llegada inválida").isDate(),
    body("origen", "Origen es obligatorio").isLength({ min: 1, max: 100 }),
    body("destino", "Destino es obligatorio").isLength({ min: 1, max: 100 }),
];

// GET /viajes - Listar todos (Auth Requerida)
router.get("/", verificarAutenticacion, async (req, res) => {
    // Consulta JOIN para obtener nombres y patentes
    const [rows] = await db.execute(
        "SELECT v.id_viaje, v.fecha_salida, v.origen, veh.patente, cond.nombre, cond.apellido \
         FROM viajes v \
         JOIN vehiculos veh ON v.vehiculo_id = veh.id_vehiculo \
         JOIN conductores cond ON v.conductor_id = cond.id_conductor"
    );
    res.json({ success: true, viajes: rows });
});

// POST /viajes - Crear (Auth y Rol Admin Requerido)
router.post(
    "/",
    verificarAutenticacion,
    verificarAutorizacion("admin"),
    validarViaje,
    verificarValidaciones,
    async (req, res) => {
        const { vehiculo_id, conductor_id, fecha_salida, fecha_llegada, origen, destino, observaciones } = req.body;

        const [result] = await db.execute(
            "INSERT INTO viajes (vehiculo_id, conductor_id, fecha_salida, fecha_llegada, origen, destino, observaciones) VALUES (?,?,?,?,?,?,?)",
            [vehiculo_id, conductor_id, fecha_salida, fecha_llegada, origen, destino, observaciones]
        );

        res.status(201).json({
            success: true,
            data: { id: result.insertId, origen, destino },
        });
    }
);
// Nota: Puedes agregar GET/:id, PUT/:id, DELETE/:id copiando la lógica de vehiculos.js.
export default router;