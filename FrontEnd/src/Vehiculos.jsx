import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth, AuthRol } from "./Auth.jsx";

export function Vehiculos() {
    const { fetchAuth } = useAuth();
    const [vehiculos, setVehiculos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchVehiculos = useCallback(
        async () => {
            setError(null);
            setLoading(true);

            try {
                const response = await fetchAuth("http://localhost:3000/vehiculos");
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || "Fallo en la carga de datos.");
                }

                setVehiculos(data.vehiculos);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        },
        [fetchAuth]
    );

    useEffect(() => {
        fetchVehiculos();
    }, [fetchVehiculos]);

    if (loading) {
        return <p aria-busy="true">Cargando vehículos...</p>;
    }
    
    if (error) {
        return <p style={{ color: 'red' }}>Error al cargar vehículos: {error}</p>;
    }

    return (
        <article>
            <h2>Gestión de Vehículos</h2>
            
            <AuthRol rol="admin">
                <Link role="button" to="/vehiculos/crear">
                    Nuevo vehículo
                </Link>
            </AuthRol>
            
            {vehiculos.length === 0 ? (
                <p>No se encontraron vehículos en el sistema.</p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Marca</th>
                            <th>Modelo</th>
                            <th>Patente</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {vehiculos.map((v) => (
                            <tr key={v.id_vehiculo}>
                                <td>{v.id_vehiculo}</td>
                                <td>{v.marca}</td>
                                <td>{v.modelo}</td>
                                <td>{v.patente}</td>
                                <td>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <Link role="button" className="secondary" to={`/vehiculos/${v.id_vehiculo}`}>
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