import React from "react";
import { createRoot } from "react-dom/client";
import "@picocss/pico"; 
import "./index.css";
import { Layout } from "./Layout.jsx";
import { Home } from "./Home.jsx";
import { Ingresar } from "./Ingresar.jsx";
import { AuthPage, AuthProvider, AuthRol } from "./Auth.jsx";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Usuarios } from "./Usuarios.jsx"; 
import { Roles } from "./Roles.jsx"; 
import { CrearUsuario } from "./CrearUsuario.jsx";


createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    <Route path="/" element={<Layout />}> 
                        
                        <Route index element={<Home />} />
                        <Route path="ingresar" element={<Ingresar />} />
                        
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
            </AuthProvider>
        </BrowserRouter>
    </React.StrictMode>
);