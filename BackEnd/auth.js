// backend/auth.js
import express from "express";
import { execute } from "./db.js";
import { verificarValidaciones } from "./validaciones.js";
import { body } from "express-validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import passport from "passport";
import { Strategy, ExtractJwt } from "passport-jwt";

const router = express.Router();

export function authConfig() {
    const jwtOptions = {
    // Opciones de configuracion de passport-jwt
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), 
        secretOrKey: process.env.JWT_SECRET,
    };

    // Creo estrategia jwt
passport.use(
    new Strategy(jwtOptions, async (payload, next) => {
    // Si llegamos aquí, el token es válido y no está expirado.
    next(null, payload);
    })
);
}


export const verificarAutenticacion = passport.authenticate("jwt", {
    session: false,
});

export const verificarAutorizacion = (rol) => {
    return (req, res, next) => {
        const roles = req.user.roles;
        if (!roles || !roles.includes(rol)) {
        return res
            .status(403) 
            .json({ success: false, message: "Usuario no autorizado (Rol requerido: " + rol + ")" });
        }
        next();
    };
};

router.post(
    "/login",
    body("username").isAlphanumeric("es-ES").isLength({ max: 20 }),
    body("password").isStrongPassword({
        minLength: 8, // Minimo de 8 caracteres
        minLowercase: 1, // Al menos una letra en minusculas
        minUppercase: 0, // Letras mayusculas opcionales
        minNumbers: 1, // Al menos un número
        minSymbols: 0, // Símbolos opcionales
    }),
    verificarValidaciones,
    async (req, res) => {
    const { username, password } = req.body;

    //Consultar usuario y password_hash
    const [usuarios] = await execute("SELECT id_usuario, password_hash FROM usuarios WHERE username=?", [username]);
    if (usuarios.length === 0) {
        return res.status(400).json({ success: false, error: "Usuario o Contraseña inválido" });
    }

    //Verificar la contraseña (usando bcrypt)
    const hashedPassword = usuarios[0].password_hash;
    const passwordComparada = await bcrypt.compare(password, hashedPassword);
    if (!passwordComparada) {
        return res.status(400).json({ success: false, error: "Usuario o Contraseña inválido" });
    }

    //Obtener los roles del usuario
    const [rolesDB] = await execute(
        "SELECT r.rol \
        FROM roles r \
        JOIN usuarios_roles ur ON r.id_rol = ur.id_rol \
        WHERE ur.id_usuario=?",
        [usuarios[0].id_usuario]
    );
    const rolesUsuario = rolesDB.map((r) => r.rol);

    //Generar JWT (Payload incluye roles para la autorización)
    const payload = { userId: usuarios[0].id_usuario, roles: rolesUsuario };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "4h" });

    //Devolver el token
    res.json({ success: true, token, roles: rolesUsuario });
    }
);

export default router;