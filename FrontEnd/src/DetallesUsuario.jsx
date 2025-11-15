import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth, AuthRol } from "./Auth.jsx";

export function DetallesUsuario() {
    const { id } = useParams();
    const { fetchAuth } = useAuth();
    
    const [usuario, setUsuario] = useState(null);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchDetalles = useCallback(async () => {
        setError(null);
        setLoading(true);
        try {
            // --- Petición 1: Detalles del usuario ---
            const userResponse = await fetchAuth(`http://localhost:3000/usuarios/${id}`);
            
            if (!userResponse.ok) {
                 // Intentamos leer el error JSON que DEBE devolver el Backend
                 const errorData = await userResponse.json();
                 throw new Error(errorData.message || `Fallo (${userResponse.status}) al cargar el usuario.`);
            }
            const userData = await userResponse.json();

            // --- Petición 2: Roles del usuario ---
            const rolesResponse = await fetchAuth(`http://localhost:3000/usuarios/${id}/roles`);
            
            if (!rolesResponse.ok) {
                 const errorData = await rolesResponse.json();
                 throw new Error(errorData.message || `Fallo (${rolesResponse.status}) al cargar los roles.`);
            }
            const rolesData = await rolesResponse.json();


            setUsuario(userData.usuario);
            setRoles(rolesData.roles);
        } catch (err) {
            // Este bloque atrapa el error de JSON si la respuesta fue HTML
            if (err.message.includes("valid JSON")) {
                 setError("Error Crítico de Servidor: La API devolvió un formato incorrecto (HTML) en lugar de datos JSON. Revise su Backend.");
            } else {
                 setError(err.message);
            }
        } finally {
            setLoading(false);
        }
    }, [id, fetchAuth]);

    useEffect(() => {
        fetchDetalles();
    }, [fetchDetalles]);

    if (loading) {
        return <p aria-busy="true">Cargando detalles...</p>;
    }

    if (error) {
        return <p style={{ color: 'red' }}>Error: {error}</p>;
    }
    
    if (!usuario) {
        return <h2>Usuario no encontrado.</h2>;
    }

    return (
        <article>
            <h2>Detalles del Usuario: {usuario.username}</h2>

            <p><strong>ID:</strong> {usuario.id_usuario}</p>
            <p><strong>Nombre:</strong> {usuario.nombre} {usuario.apellido}</p>
            <p><strong>Activo:</strong> {usuario.activo ? 'Sí' : 'No'}</p>

            <h3>Roles Asignados</h3>
            <ul>
                {roles.length > 0 ? (
                    roles.map(rol => <li key={rol.id_rol}>{rol.rol}</li>)
                ) : (
                    <li>No tiene roles asignados.</li>
                )}
            </ul>
            
            <AuthRol rol="admin">
                 <Link role="button" to={`/usuarios/${id}/modificar`}>
                    Modificar Usuario
                </Link>
            </AuthRol>

            <Link role="button" className="secondary" to="/usuarios" style={{ marginLeft: '10px' }}>
                Volver al Listado
            </Link>
        </article>
    );
}