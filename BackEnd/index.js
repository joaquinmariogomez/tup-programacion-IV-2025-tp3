// backend/index.js
import express from "express";
import cors from "cors";
import usuariosRouter from "./usuarios.js";
import rolesRouter from "./roles.js";
import usuariosRolesRouter from "./usuarios-roles.js";
import authRouter, { authConfig } from "./auth.js";
import "dotenv/config"; // Para leer el .env

    const app = express();
    const port = process.env.PORT || 3000;

    // Para interpretar body como JSON
    app.use(express.json());

    // Habilito CORS
    app.use(cors());

    authConfig();

    app.get("/", (req, res) => {
        res.send("API Funcionando! (Conectada a la DB)");
    });

    // Montaje de Routers
    app.use("/usuarios", usuariosRouter);
    app.use("/roles", rolesRouter);
    app.use("/auth", authRouter);
    app.use("/usuarios-roles", usuariosRolesRouter);

    // MIDDLEWARE DE MANEJO DE ERRORES GLOBAL (Debe ir al final)
    // Garantiza que cualquier fallo del servidor devuelva JSON 500
    app.use((err, req, res, next) => {
        console.error(err.stack);
        
        const status = err.status || 500; 
        
        res.status(status).json({
            success: false,
            message: "Error interno del servidor. " + err.message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
        });
    });

    // Inicializar el servidor
    app.listen(port, () => {
        console.log(`La aplicación esta funcionando en http://localhost:${port}`);
    });