import express from "express";
import { db } from "./db.js";
import { validarId, verificarValidaciones } from "./validaciones.js";
import { body } from "express-validator";
import { verificarAutenticacion, verificarAutorizacion } from "./auth.js";

const router = express.Router();

// Validaciones para Vehículo
const validarVehiculo = [
    body("marca", "Marca es obligatoria y máx 50").isLength({ min: 1, max: 50 }),
    body("modelo", "Modelo es obligatorio y máx 50").isLength({ min: 1, max: 50 }),
    body("patente", "Patente es obligatoria").isLength({ min: 1, max: 10 }),
    body("anio", "Año debe ser un entero de 4 dígitos").isInt({ min: 1900, max: 2050 }),
    body("capacidad_carga", "Capacidad de carga debe ser un número positivo").isFloat({ min: 0.1 }),
];


// GET /vehiculos - Listar todos (Auth Requerida)
router.get("/", verificarAutenticacion, async (req, res) => {
    const [rows] = await db.execute(
        "SELECT id_vehiculo, marca, modelo, patente, anio, capacidad_carga FROM vehiculos"
    );
    res.json({ success: true, vehiculos: rows });
});

// GET /vehiculos/:id - Obtener por ID (Auth Requerida)
router.get(
    "/:id",
    verificarAutenticacion,
    validarId,
    verificarValidaciones,
    async (req, res) => {
        const id = Number(req.params.id);
        const [rows] = await db.execute(
            "SELECT id_vehiculo, marca, modelo, patente, anio, capacidad_carga FROM vehiculos WHERE id_vehiculo=?",
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: "Vehículo no encontrado" });
        }
        res.json({ success: true, vehiculo: rows[0] });
    }
);

// POST /vehiculos - Crear (Auth y Rol Admin Requerido)
router.post(
    "/",
    verificarAutenticacion,
    verificarAutorizacion("admin"),
    validarVehiculo,
    verificarValidaciones,
    async (req, res) => {
        const { marca, modelo, patente, anio, capacidad_carga } = req.body;

        try {
            const [result] = await db.execute(
                "INSERT INTO vehiculos (marca, modelo, patente, anio, capacidad_carga) VALUES (?,?,?,?,?)",
                [marca, modelo, patente, anio, capacidad_carga]
            );

            res.status(201).json({
                success: true,
                data: { id: result.insertId, marca, modelo, patente },
            });
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                 return res.status(400).json({ success: false, message: "La patente ya se encuentra registrada." });
            }
            throw error; 
        }
    }
);

// PUT /vehiculos/:id - Modificar (Auth y Rol Admin Requerido)
router.put(
    "/:id",
    verificarAutenticacion,
    verificarAutorizacion("admin"),
    validarId,
    validarVehiculo,
    verificarValidaciones,
    async (req, res) => {
        const id = Number(req.params.id);
        const { marca, modelo, patente, anio, capacidad_carga } = req.body;

        const [result] = await db.execute(
            "UPDATE vehiculos SET marca=?, modelo=?, patente=?, anio=?, capacidad_carga=? WHERE id_vehiculo=?",
            [marca, modelo, patente, anio, capacidad_carga, id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Vehículo no encontrado" });
        }
        
        res.json({ success: true, message: "Vehículo modificado" });
    }
);

// DELETE /vehiculos/:id - Eliminar (Auth y Rol Admin Requerido)
router.delete(
    "/:id",
    verificarAutenticacion,
    verificarAutorizacion("admin"), 
    validarId,
    verificarValidaciones,
    async (req, res) => {
        const id = Number(req.params.id);
        await db.execute("DELETE FROM vehiculos WHERE id_vehiculo=?", [id]);
        res.json({ success: true, data: id });
    }
);

export default router;