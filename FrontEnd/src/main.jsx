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

// Componentes CRUD NUEVOS
import { Vehiculos } from "./Vehiculos.jsx"; 
import { Conductores } from "./Conductores.jsx"; // IMPORTAR
import { Viajes } from "./Viajes.jsx";         // IMPORTAR


createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    <Route path="/" element={<Layout />}> 
                        
                        <Route index element={<Home />} />
                        <Route path="ingresar" element={<Ingresar />} />
                        
                        {/* RUTAS DE VEHÍCULOS (NUEVO FOCO DEL TP) */}
                        <Route
                            path="vehiculos"
                            element={<AuthPage><Vehiculos /></AuthPage>} // Listado
                        />
                        <Route
                            path="vehiculos/crear"
                            element={<AuthPage><AuthRol rol="admin"><h2>Crear Vehículo - Implementar CrearVehiculo.jsx</h2></AuthRol></AuthPage>}
                        />
                        <Route
                            path="vehiculos/:id"
                            element={<AuthPage><h2>Detalles Vehículo - Implementar DetallesVehiculo.jsx</h2></AuthPage>}
                        />
                        
                        {/* RUTAS DE CONDUCTORES */}
                        <Route
                            path="conductores"
                            element={<AuthPage><Conductores /></AuthPage>} // Listado
                        />

                        {/* RUTAS DE VIAJES */}
                        <Route
                            path="viajes"
                            element={<AuthPage><Viajes /></AuthPage>} // Listado
                        />

                        {/* RUTAS DE USUARIOS Y ROLES (Originales) */}
                        <Route
                            path="usuarios"
                            element={<AuthPage><Usuarios /></AuthPage>}
                        />
                        <Route
                            path="usuarios/:id"
                            element={<AuthPage><DetallesUsuario /></AuthPage>}
                        />
                        <Route
                            path="usuarios/:id/modificar"
                            element={<AuthPage><AuthRol rol="admin"><ModificarUsuario /></AuthRol></AuthPage>}
                        />
                        <Route
                            path="usuarios/crear"
                            element={<AuthPage><AuthRol rol="admin"><CrearUsuario /></AuthRol></AuthPage>}
                        />
                        <Route
                            path="roles"
                            element={<AuthPage><Roles /></AuthPage>}
                        />
                        
                    </Route>
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    </React.StrictMode>
);