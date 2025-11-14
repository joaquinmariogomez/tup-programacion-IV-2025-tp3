import { useEffect, useState, useCallback } from "react";
import { useAuth } from "./Auth.jsx";

export function Roles() {
    const { fetchAuth } = useAuth();
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null); // Nuevo estado de error

    // Función para obtener la lista de roles
    const fetchRoles = useCallback(
        async () => {
            setError(null);
            setLoading(true);
            try {
                // Petición segura a /roles (Requiere JWT)
                const response = await fetchAuth("http://localhost:3000/roles");
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || "Fallo en la carga de roles.");
                }

                // El Backend devuelve { success: true, roles: [...] }
                setRoles(data.roles);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        },
        [fetchAuth]
    );

    useEffect(() => {
        fetchRoles();
    }, [fetchRoles]);

    if (loading) {
        return <p aria-busy="true">Cargando roles...</p>;
    }

    // Si hay un error, lo mostramos en pantalla
    if (error) {
        return <p style={{ color: 'red' }}>Error al cargar roles: {error}</p>;
    }

    return (
        <article>
            <h2>Roles del Sistema</h2>
            
            {roles.length === 0 ? (
                 <p>No se encontraron roles en el sistema.</p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre del Rol</th>
                        </tr>
                    </thead>
                    <tbody>
                        {roles.map((r) => (
                            <tr key={r.id_rol}>
                                <td>{r.id_rol}</td>
                                <td>{r.rol}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </article>
    );
}