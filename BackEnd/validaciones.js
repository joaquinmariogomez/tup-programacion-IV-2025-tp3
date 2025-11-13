import { param, validationResult } from "express-validator";

// Middleware genérico para verificar si hay errores de validación
export const verificarValidaciones = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ 
            success: false, 
            message: "Errores de validación", 
            errors: errors.array(), 
        });
    }
    next();
};

// Middleware específico para validar el ID en los parámetros de la URL
export const validarId = [
    param("id", "ID inválido").isInt({ min: 1 }),
];