import mysql from "mysql2/promise";

// Conexion a base de datos
async function conectarDB() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST, // Dominio (url) de db
      user: process.env.DB_USER, // Usuario
      password: process.env.DB_PASS, // Contraseña
      database: process.env.DB_NAME, // Esquema
    });
    console.log("Conexión a la DB establecida correctamente.");
    return connection;
  } catch (error) {
    console.error("ERROR CRÍTICO DE CONEXIÓN A LA BASE DE DATOS.");
    console.error("Asegúrate que el archivo .env sea correcto y que MySQL esté corriendo.");
    console.error("Mensaje de error:", error.message);
    process.exit(1); 
  }
}

export const db = await conectarDB();
export default db;