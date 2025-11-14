import { useEffect, useState, useCallback } from "react";
import { useAuth } from "./Auth";

export function Roles() {
    const { fetchAuth } = useAuth();
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);

    // Función para obtener la lista de roles
    const fetchRoles = useCallback(
        async () => {
            setLoading(true);
            try {
                // Petición segura a /roles (Requiere JWT)
                const response = await fetchAuth("http://localhost:3000/roles");
                const data = await response.json();

                if (!response.ok) {
                    console.error("Error al obtener roles:", data.error);
                    return;
                }

                setRoles(data.roles);
            } catch (error) {
                console.error("Error de conexión o token:", error.message);
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
        return <p>Cargando roles...</p>;
    }

    return (
        <article>
            <h2>Roles del Sistema</h2>
            
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
        </article>
    );
}