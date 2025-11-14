import { useState } from "react";
import { useAuth } from "./Auth";

export function Ingresar() {
    const { login, error } = useAuth();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Llamar a la función de login del contexto
        await login(username, password);
    };

    return (
        <article>
            <h2>Ingresar al Sistema</h2>
            <form onSubmit={handleSubmit}>
                <input 
                    type="text" 
                    placeholder="Usuario" 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)} 
                    required 
                />
                <input 
                    type="password" 
                    placeholder="Contraseña" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                />
                {/* Muestra errores de login si existen */}
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <button type="submit">Entrar</button>
            </form>
        </article>
    );
}