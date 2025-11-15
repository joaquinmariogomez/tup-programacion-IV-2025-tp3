import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth, AuthRol } from "./Auth.jsx";

export function Conductores() {
    const { fetchAuth } = useAuth();
    const [conductores, setConductores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchConductores = useCallback(
        async () => {
            setError(null);
            setLoading(true);

            try {
                const response = await fetchAuth("http://localhost:3000/conductores");
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || "Fallo en la carga de datos de conductores.");
                }

                setConductores(data.conductores);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        },
        [fetchAuth]
    );

    useEffect(() => {
        fetchConductores();
    }, [fetchConductores]);

    if (loading) {
        return <p aria-busy="true">Cargando conductores...</p>;
    }
    
    if (error) {
        return <p style={{ color: 'red' }}>Error al cargar conductores: {error}</p>;
    }

    return (
        <article>
            <h2>Gestión de Conductores</h2>
            
            <AuthRol rol="admin">
                <Link role="button" to="/conductores/crear">
                    Nuevo conductor
                </Link>
            </AuthRol>
            
            {conductores.length === 0 ? (
                <p>No se encontraron conductores en el sistema.</p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>DNI</th>
                            <th>Licencia</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {conductores.map((c) => (
                            <tr key={c.id_conductor}>
                                <td>{c.id_conductor}</td>
                                <td>{c.nombre} {c.apellido}</td>
                                <td>{c.dni}</td>
                                <td>{c.licencia}</td>
                                <td>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <Link role="button" className="secondary" to={`/conductores/${c.id_conductor}`}>
                                            Ver
                                        </Link>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </article>
    );
}