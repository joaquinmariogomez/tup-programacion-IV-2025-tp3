import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "./Auth.jsx";

export function ModificarUsuario() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { fetchAuth } = useAuth();

    const [username, setUsername] = useState('');
    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Cargar datos iniciales del usuario
    useEffect(() => {
        async function loadUsuario() {
            try {
                const response = await fetchAuth(`http://localhost:3000/usuarios/${id}`);
                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.message || "Error al cargar datos del usuario.");
                }

                setUsername(data.usuario.username || '');
                setNombre(data.usuario.nombre || '');
                setApellido(data.usuario.apellido || '');
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        loadUsuario();
    }, [id, fetchAuth]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        const datosActualizados = { username, nombre, apellido };

        try {
            // Petición PUT segura al Backend (Requiere rol 'admin' en el Backend)
            const response = await fetchAuth(`http://localhost:3000/usuarios/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(datosActualizados),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || "Fallo en la actualización.");
            }
            
            // Éxito: Navegar de vuelta a los detalles
            navigate(`/usuarios/${id}`);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return <p aria-busy="true">Cargando datos iniciales...</p>;
    }

    if (error) {
        return <p style={{ color: 'red' }}>Error: {error}</p>;
    }

    return (
        <article>
            <h2>Modificar Usuario: {username}</h2>
            <form onSubmit={handleSubmit}>
                <div className="grid">
                    <label>
                        Nombre de Usuario (No modificable)
                        <input
                            type="text"
                            value={username}
                            disabled
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
                            disabled={isSubmitting}
                        />
                    </label>
                    <label>
                        Apellido
                        <input
                            type="text"
                            value={apellido}
                            onChange={(e) => setApellido(e.target.value)}
                            required
                            disabled={isSubmitting}
                        />
                    </label>
                </div>

                {error && <p style={{ color: 'red' }}>Error: {error}</p>}
                
                <div className="grid">
                    <button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                    <button 
                        type="button" 
                        className="secondary" 
                        onClick={() => navigate(`/usuarios/${id}`)} 
                        disabled={isSubmitting}
                    >
                        Cancelar
                    </button>
                </div>
            </form>
        </article>
    );
}