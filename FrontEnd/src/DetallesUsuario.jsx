import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth, AuthRol } from "./Auth.jsx";

export function DetallesUsuario() {
    const { id } = useParams(); // Obtiene el ID del usuario de la URL
    const { fetchAuth } = useAuth();
    
    const [usuario, setUsuario] = useState(null);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Carga los datos del usuario y sus roles
    const fetchDetalles = useCallback(async () => {
        setError(null);
        setLoading(true);
        try {
            // Petición GET segura para obtener detalles del usuario
            const userResponse = await fetchAuth(`http://localhost:3000/usuarios/${id}`);
            const userData = await userResponse.json();

            // Petición GET segura para obtener roles del usuario (Ruta pendiente en BackEnd, asumimos /usuarios/:id/roles)
            const rolesResponse = await fetchAuth(`http://localhost:3000/usuarios/${id}/roles`);
            const rolesData = await rolesResponse.json();

            if (!userResponse.ok || !rolesResponse.ok) {
                throw new Error(userData.message || rolesData.error || "Fallo al cargar los detalles.");
            }

            setUsuario(userData.usuario);
            setRoles(rolesData.roles);
        } catch (err) {
            setError(err.message);
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
        return <p style={{ color: 'red' }}>Error al cargar usuario: {error}</p>;
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
            
            {/* Botón visible solo si el usuario tiene el rol 'admin' */}
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