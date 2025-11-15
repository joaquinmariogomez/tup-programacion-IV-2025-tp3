import { Link, Outlet } from "react-router-dom";
import { useAuth, AuthRol } from "./Auth"; // Aseguramos AuthRol para el menú

export function Layout() {
    const { isAuthenticated, username, logout } = useAuth();

    return (
        <>
            <header className="container">
                <nav>
                    <ul>
                        <li><Link to="/"><strong>TP Transportes</strong></Link></li>
                    </ul>
                    <ul>
                        <li><Link to="/vehiculos">Vehículos</Link></li>       
                        <li><Link to="/conductores">Conductores</Link></li>     
                        <li><Link to="/viajes">Viajes</Link></li>             
                        {isAuthenticated ? (
                            <>
                                {/* Mantenemos Usuarios/Roles, ocultos para Rol que no sea 'admin' */}
                                <AuthRol rol="admin">
                                    <li><Link to="/usuarios">Usuarios</Link></li>
                                    <li><Link to="/roles">Roles</Link></li>
                                </AuthRol>
                                
                                <li>Bienvenido, {username}</li>
                                <li><button onClick={logout}>Cerrar Sesión</button></li>
                            </>
                        ) : (
                            <li><Link to="/ingresar" role="button">Ingresar</Link></li>
                        )}
                    </ul>
                </nav>
            </header>
            <main className="container">
                {/* Outlet renderiza el componente de la ruta activa */}
                <Outlet />
            </main>
        </>
    );
}