import { createContext, useContext, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext(null);

// Carga el estado inicial desde localStorage para persistencia de la sesión
const storedToken = localStorage.getItem("token");
const storedUsername = localStorage.getItem("username");
const storedRoles = JSON.parse(localStorage.getItem("roles"));

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(storedToken);
    const [username, setUsername] = useState(storedUsername);
    const [roles, setRoles] = useState(storedRoles);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const login = async (username, password) => {
        setError(null);
        try {
            const response = await fetch("http://localhost:3000/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            const session = await response.json();

            if (!response.ok && response.status === 400) {
                throw new Error(session.error || "Usuario o contraseña inválida.");
            }
            
            setToken(session.token);
            setUsername(session.username);
            setRoles(session.roles);
            
            // Persistir los datos en localStorage
            localStorage.setItem("token", session.token);
            localStorage.setItem("username", session.username);
            localStorage.setItem("roles", JSON.stringify(session.roles));

            navigate("/usuarios");
            return { success: true };
        } catch (err) {
            setError(err.message);
            return { success: false };
        }
    };

    const logout = () => {
        setToken(null);
        setUsername(null);
        setRoles(null);
        setError(null);
        localStorage.clear();
        navigate("/ingresar");
    };

    // Esta función envuelve fetch para inyectar el JWT en el header Authorization
    const fetchAuth = useCallback(async (url, options = {}) => {
        if (!token) {
            logout();
            throw new Error("Sesión no iniciada.");
        }

        return fetch(url, {
            ...options,
            headers: { 
                ...options.headers, 
                Authorization: `Bearer ${token}` 
            },
        });
    }, [token, logout]);

    return (
        <AuthContext.Provider
            value={{
                token,
                username,
                roles,
                error,
                isAuthenticated: !!token, // Bandera de autenticación
                login,
                logout,
                fetchAuth,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

// Componente para proteger páginas (Autenticación requerida)
export const AuthPage = ({ children }) => {
    const { isAuthenticated } = useAuth();
    
    if (!isAuthenticated) {
        return <h2>Inicie sesión para acceder a esta página.</h2>;
    }
    return children;
};

// Componente para proteger elementos por rol (Autorización en Cliente)
export const AuthRol = ({ rol, children }) => {
    const { roles } = useAuth();

    if (!roles || !roles.includes(rol)) {
        return null; // Oculta el contenido si no tiene el rol
    }
    return children;
};