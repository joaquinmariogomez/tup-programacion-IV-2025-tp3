import React from "react";
import { createRoot } from "react-dom/client";
import "@picocss/pico"; 
import "./index.css";
import { Layout } from "./Layout.jsx";
import { Home } from "./Home.jsx";
import { Ingresar } from "./Ingresar.jsx";
import { AuthPage, AuthProvider, AuthRol } from "./Auth.jsx";
import { BrowserRouter, Route, Routes } from "react-router-dom";
// Componentes CRUD
import { Usuarios } from "./Usuarios.jsx"; 
import { Roles } from "./Roles.jsx"; 
import { CrearUsuario } from "./CrearUsuario.jsx";
import { DetallesUsuario } from "./DetallesUsuario.jsx"; 
import { ModificarUsuario } from "./ModificarUsuarios.jsx"; 


createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    <Route path="/" element={<Layout />}> 
                        
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

                        {/* Ruta para ver detalles (DetallesUsuario) - REQUIERE AUTH */}
                        <Route
                            path="usuarios/:id"
                            element={
                                <AuthPage>
                                    <DetallesUsuario />
                                </AuthPage>
                            }
                        />
                        
                        {/* Ruta para modificar (ModificarUsuario) - REQUIERE AUTH + ROL ADMIN */}
                        <Route
                            path="usuarios/:id/modificar"
                            element={
                                <AuthPage>
                                    <AuthRol rol="admin">
                                        <ModificarUsuario />
                                    </AuthRol>
                                </AuthPage>
                            }
                        />

                        {/* Ruta para crear (CrearUsuario) - REQUIERE AUTH + ROL ADMIN */}
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
                        
                        <Route
                            path="roles"
                            element={
                                <AuthPage>
                                    <Roles />
                                </AuthPage>
                            }
                        />
                        
                    </Route>
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    </React.StrictMode>
);