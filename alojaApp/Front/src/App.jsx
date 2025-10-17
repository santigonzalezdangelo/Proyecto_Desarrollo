import { Routes, Route } from "react-router-dom";
import Home from "./pages/home.jsx";
import Login from "./pages/login.jsx";
import AdministrarPropiedades from "./pages/administrarPropiedades.jsx"; 
import Profile from "./pages/Profile.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Search from "./pages/search.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/buscar" element={<Search />} />
      <Route path="/administrarPropiedades" element={<AdministrarPropiedades />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/profile" element={<Profile />} />

      </Route>
    </Routes>
  );
}