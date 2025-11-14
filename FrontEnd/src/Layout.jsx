import { Link, Outlet } from "react-router-dom";
import { useAuth } from "./Auth";

export function Layout() {
    const { isAuthenticated, username, logout } = useAuth();

    return (
        <>
            <header className="container">
                <nav>
                    <ul>
                        <li><Link to="/"><strong>TP Usuarios</strong></Link></li>
                    </ul>
                    <ul>
                        <li><Link to="/usuarios">Usuarios</Link></li>
                        <li><Link to="/roles">Roles</Link></li>
                        {isAuthenticated ? (
                            <>
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