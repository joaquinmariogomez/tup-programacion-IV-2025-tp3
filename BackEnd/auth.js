import express from "express";
import { db } from "./db.js";
import { verificarValidaciones } from "./validaciones.js";
import { body } from "express-validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import passport from "passport";
import { Strategy, ExtractJwt } from "passport-jwt";

const router = express.Router();

export function authConfig() {
    const jwtOptions = {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), 
        secretOrKey: process.env.JWT_SECRET,
    };

    // Creo estrategia jwt
passport.use(
    new Strategy(jwtOptions, async (payload, next) => {
    next(null, payload);
    })
);
}


export const verificarAutenticacion = passport.authenticate("jwt", {
    session: false,
});

export const verificarAutorizacion = (rol) => {
    const rolRequeridoLower = rol.toLowerCase(); 

    return (req, res, next) => {
        const roles = req.user.roles;
        
        if (!Array.isArray(roles) || roles.length === 0) {
             return res
                .status(403) 
                .json({ success: false, message: "Usuario no autorizado (No se encontraron roles)" });
        }
        
        // Conversión a minúsculas para comparación segura
        const rolesUsuarioLower = roles.map(r => r.toLowerCase()); 

        if (!rolesUsuarioLower.includes(rolRequeridoLower)) {
            return res
                .status(403) 
                .json({ success: false, message: "Usuario no autorizado (Rol requerido: " + rol + ")" });
        }
        next();
    };
};

router.post(
    "/login",
    body("username").isLength({ max: 20 }),
    body("password").isStrongPassword({
        minLength: 8, 
        minLowercase: 1,
        minUppercase: 0, 
        minNumbers: 1, 
        minSymbols: 0, 
    }),
    verificarValidaciones,
    async (req, res) => {
    const { username, password } = req.body;

    //Consultar usuario y password_hash
    const [usuarios] = await db.execute("SELECT id_usuario, password_hash FROM usuarios WHERE username=?", [username]);
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
    const [rolesDB] = await db.execute(
        "SELECT r.rol \
        FROM roles r \
        JOIN usuarios_roles ur ON r.id_rol = ur.id_rol \
        WHERE ur.id_usuario=?",
        [usuarios[0].id_usuario]
    );
    let rolesUsuario = rolesDB.map((r) => r.rol);
    
    // 🛠️ Lógica para el primer usuario (si aún falla la asignación)
    if (rolesUsuario.length === 0) {
        const [[{ count }]] = await db.execute("SELECT COUNT(*) as count FROM usuarios");
        
        if (count === 1) {
            rolesUsuario = ["admin"]; 
        }
    }

    //Generar JWT (Payload incluye roles para la autorización)
    const payload = { userId: usuarios[0].id_usuario, roles: rolesUsuario };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "4h" }); // 🛑 Esta línea también usa JWT_SECRET

    //Devolver el token
    res.json({ success: true, token, roles: rolesUsuario });
    }
);

export default router;