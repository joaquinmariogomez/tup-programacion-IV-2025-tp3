import React from "react";
import { createRoot } from "react-dom/client";
import "@picocss/pico"; // Estilos
import "./index.css";
import { Layout } from "./Layout.jsx";
import { Home } from "./Home.jsx";
import { Ingresar } from "./Ingresar.jsx";
import { AuthPage, AuthProvider, AuthRol } from "./Auth.jsx";
import { BrowserRouter, Route, Routes } from "react-router-dom";
// Componentes importados (se crearán en este commit o en el siguiente)
import { Usuarios } from "./Usuarios.jsx"; 
import { Roles } from "./Roles.jsx"; 
import { CrearUsuario } from "./CrearUsuario.jsx";


createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    {/* Ruta principal que envuelve el Layout */}
                    <Route path="/" element={<Layout />}> 
                        
                        {/* Rutas Públicas */}
                        <Route index element={<Home />} />
                        <Route path="ingresar" element={<Ingresar />} />
                        
                        {/* Rutas Protegidas por Autenticación */}
                        <Route
                            path="usuarios"
                            element={
                                <AuthPage>
                                    <Usuarios />
                                </AuthPage>
                            }
                        />
                        
                        <Route
                            path="roles"
                            element={
                                <AuthPage>
                                    <Roles />
                                </AuthPage>
                            }
                        />

                        {/* Rutas Protegidas por Rol Específico (Solo Admin) */}
                        <Route
                            path="usuarios/crear"
                            element={
                                <AuthPage>
                                    <AuthRol rol="admin"> 
                                        <CrearUsuario />
                                    </AuthRol>
                                </AuthPage>
                            }
                        />
                        
                    </Route>
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    </React.StrictMode>
);