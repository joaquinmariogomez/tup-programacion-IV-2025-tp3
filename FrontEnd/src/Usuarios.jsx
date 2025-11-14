import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth, AuthRol } from "./Auth";

export function Usuarios() {
    const { fetchAuth } = useAuth();

    const [usuarios, setUsuarios] = useState([]);
    const [buscar, setBuscar] = useState("");
    const [loading, setLoading] = useState(true);

    // Función para obtener la lista de usuarios, memoizada con useCallback
    const fetchUsuarios = useCallback(
        async (searchQuery = "") => {
            setLoading(true);
            const searchParams = new URLSearchParams();

            if (searchQuery) {
                searchParams.append("buscar", searchQuery);
            }

            try {
                // Petición segura usando fetchAuth (incluye el JWT)
                const response = await fetchAuth(
                    "http://localhost:3000/usuarios" +
                    (searchParams.size > 0 ? "?" + searchParams.toString() : "")
                );
                const data = await response.json();

                if (!response.ok) {
                    console.error("Error al obtener usuarios:", data.error);
                    return;
                }

                setUsuarios(data.usuarios);
            } catch (error) {
                console.error("Error de conexión:", error.message);
            } finally {
                setLoading(false);
            }
        },
        [fetchAuth]
    );

    // useEffect para cargar los usuarios al montar el componente
    useEffect(() => {
        fetchUsuarios();
    }, [fetchUsuarios]);


    const handleQuitar = async (id) => {
        if (window.confirm("¿Desea quitar el usuario? Esta acción es irreversible.")) {
            try {
                // Petición DELETE segura, solo visible/permitida para admin
                const response = await fetchAuth(`http://localhost:3000/usuarios/${id}`, {
                    method: "DELETE",
                });
                const data = await response.json();

                if (!response.ok || !data.success) {
                    return window.alert("Error al quitar usuario. Verifique permisos.");
                }

                // Recargar la lista después de la eliminación
                await fetchUsuarios();
            } catch (error) {
                console.error("Error al eliminar:", error);
            }
        }
    };

    if (loading) {
        return <p>Cargando usuarios...</p>;
    }

    return (
        <article>
            <h2>Gestión de Usuarios</h2>
            
            {/* Botón visible solo si el usuario tiene el rol 'admin' */}
            <AuthRol rol="admin">
                <Link role="button" to="/usuarios/crear">
                    Nuevo usuario
                </Link>
            </AuthRol>

            <div className="grid">
                <input 
                    type="text"
                    placeholder="Buscar por nombre de usuario..."
                    value={buscar} 
                    onChange={(e) => setBuscar(e.target.value)} 
                />
                <button onClick={() => fetchUsuarios(buscar)}>Buscar</button>
            </div>
            
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Usuario</th>
                        <th>Apellido</th>
                        <th>Nombre</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {usuarios.map((u) => (
                        <tr key={u.id_usuario}>
                            <td>{u.id_usuario}</td>
                            <td>{u.username}</td>
                            <td>{u.apellido}</td>
                            <td>{u.nombre}</td>
                            <td>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <Link role="button" className="secondary" to={`/usuarios/${u.id_usuario}`}>
                                        Ver
                                    </Link>
                                    
                                    {/* Botones de acción sensibles, solo para admin */}
                                    <AuthRol rol="admin">
                                        <button 
                                            onClick={() => handleQuitar(u.id_usuario)}
                                            className="secondary"
                                            style={{ margin: 0 }}
                                        >
                                            Quitar
                                        </button>
                                    </AuthRol>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </article>
    );
}