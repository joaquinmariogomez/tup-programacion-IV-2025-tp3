import mysql from "mysql2/promise";

/**
 * Crea y exporta un pool de conexiones a la base de datos.
 * Usar un pool es la práctica recomendada para aplicaciones web,
 * ya que gestiona múltiples conexiones de forma eficiente y robusta.
 */
function crearPool() {
    try {
        const pool = mysql.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME,
            waitForConnections: true, // Esperar si todas las conexiones están en uso
            connectionLimit: 10,      // Número máximo de conexiones en el pool
            queueLimit: 0             // Sin límite en la cola de espera
        });
        console.log("Pool de conexiones a la DB creado correctamente.");
        return pool;
    } catch (error) {
        console.error("ERROR CRÍTICO AL CREAR EL POOL DE CONEXIONES A LA BASE DE DATOS.");
        console.error("Asegúrate que el archivo .env sea correcto y que MySQL esté corriendo.");
        console.error("Mensaje de error:", error.message);
        process.exit(1);
    }
}

export const db = crearPool();