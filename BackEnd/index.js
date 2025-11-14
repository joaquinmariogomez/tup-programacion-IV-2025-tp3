import express from "express";
import cors from "cors";
import usuariosRouter from "./usuarios.js";
import rolesRouter from "./roles.js";
import usuariosRolesRouter from "./usuarios-roles.js";
import authRouter, { authConfig } from "./auth.js";
import "dotenv/config";

const app = express();
const port = process.env.PORT || 3000;

// Para interpretar body como JSON
app.use(express.json());

// Habilito CORS
app.use(cors());

authConfig();

app.get("/", (req, res) => {
    res.send("API Funcionando! (Conectada a la DB por db.js)");
});

app.use("/usuarios", usuariosRouter);
app.use("/roles", rolesRouter);
app.use("/auth", authRouter);
app.use("/usuarios-roles", usuariosRolesRouter);

// Inicializar el servidor
app.listen(port, () => {
    console.log(`La aplicación esta funcionando en http://localhost:${port}`);
});