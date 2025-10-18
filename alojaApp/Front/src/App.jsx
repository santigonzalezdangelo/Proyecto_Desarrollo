import { Routes, Route } from "react-router-dom";
import Home from "./pages/home.jsx";
import Login from "./pages/Login.jsx";
import AdministrarPropiedades from "./pages/administrarPropiedades.jsx";
import Profile from "./pages/Profile.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
<<<<<<< HEAD
import Search from "./pages/search.jsx";
=======
import Search from "./pages/search.jsx";  // importa el componente Search (export default)
import PropiedadesEncontradas from "./pages/propiedades-encontradas.jsx";
>>>>>>> origin

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/buscar" element={<Search />} />
      <Route path="/administrarPropiedades" element={<AdministrarPropiedades />} />
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