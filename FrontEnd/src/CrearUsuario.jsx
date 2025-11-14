import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./Auth";

export function CrearUsuario() {
    const { fetchAuth } = useAuth();
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [nombre, setNombre] = useState("");
    const [apellido, setApellido] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const nuevoUsuario = { username, nombre, apellido, password };

        try {
            // Petición POST segura, requiere rol 'admin' en el Backend
            const response = await fetchAuth("http://localhost:3000/usuarios", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(nuevoUsuario),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                // Manejo de errores de validación de Express Validator o duplicados
                const mensajeError = data.message || (data.errors && data.errors[0].msg) || "Error al crear el usuario.";
                throw new Error(mensajeError);
            }

            // Éxito: Navegar de vuelta al listado de usuarios
            navigate("/usuarios");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <article>
            <h2>Crear Nuevo Usuario</h2>
            <form onSubmit={handleSubmit}>
                <div className="grid">
                    <label>
                        Nombre de Usuario
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </label>
                </div>
                <div className="grid">
                    <label>
                        Nombre
                        <input
                            type="text"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </label>
                    <label>
                        Apellido
                        <input
                            type="text"
                            value={apellido}
                            onChange={(e) => setApellido(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </label>
                </div>
                <label>
                    Contraseña
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={loading}
                    />
                    <small>Mínimo 8 caracteres, al menos un número y una minúscula.</small>
                </label>

                {error && <p style={{ color: 'red' }}>Error: {error}</p>}
                
                <div className="grid">
                    <button type="submit" disabled={loading}>
                        {loading ? 'Creando...' : 'Crear Usuario'}
                    </button>
                    <button 
                        type="button" 
                        className="secondary" 
                        onClick={() => navigate("/usuarios")} 
                        disabled={loading}
                    >
                        Cancelar
                    </button>
                </div>
            </form>
        </article>
    );
}