import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth, AuthRol } from "./Auth.jsx";

export function Viajes() {
    const { fetchAuth } = useAuth();
    const [viajes, setViajes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchViajes = useCallback(
        async () => {
            setError(null);
            setLoading(true);

            try {
                const response = await fetchAuth("http://localhost:3000/viajes");
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || "Fallo en la carga de datos de viajes.");
                }

                setViajes(data.viajes);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        },
        [fetchAuth]
    );

    useEffect(() => {
        fetchViajes();
    }, [fetchViajes]);

    if (loading) {
        return <p aria-busy="true">Cargando viajes...</p>;
    }
    
    if (error) {
        return <p style={{ color: 'red' }}>Error al cargar viajes: {error}</p>;
    }

    return (
        <article>
            <h2>Registro de Viajes</h2>
            
            <AuthRol rol="admin">
                <Link role="button" to="/viajes/crear">
                    Nuevo viaje
                </Link>
            </AuthRol>
            
            {viajes.length === 0 ? (
                <p>No se encontraron viajes registrados.</p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Origen</th>
                            <th>Destino</th>
                            <th>Vehículo (Patente)</th>
                            <th>Conductor</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {viajes.map((v) => (
                            <tr key={v.id_viaje}>
                                <td>{v.id_viaje}</td>
                                <td>{v.origen}</td>
                                <td>{v.destino}</td>
                                <td>{v.patente}</td>
                                <td>{v.nombre} {v.apellido}</td>
                                <td>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <Link role="button" className="secondary" to={`/viajes/${v.id_viaje}`}>
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