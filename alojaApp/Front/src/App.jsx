import { Routes, Route } from "react-router-dom";
import Home from "./pages/home.jsx";
import Login from "./pages/login.jsx";
import Profile from "./pages/Profile.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Search from "./pages/search.jsx";
import AdministrarPropiedades from "./pages/administrarPropiedades.jsx";
import Search from "./pages/search.jsx";  // importa el componente Search (export default)
import PropiedadesEncontradas from "./pages/propiedades-encontradas.jsx";
import Reservas from "./pages/reservas.jsx";
import Register from "./pages/Register.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/buscar" element={<Search />} />   {/* <-- FIX */}
      <Route path="/administrarPropiedades" element={<AdministrarPropiedades />} />
      <Route path="/reservas" element={<Reservas />} />
      <Route path="/register" element={<Register />} />
      <Route
          path="/propiedades-encontradas"
          element={<PropiedadesEncontradas />} />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
