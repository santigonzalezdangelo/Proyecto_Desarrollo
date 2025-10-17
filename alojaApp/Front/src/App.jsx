import { Routes, Route, Link, useNavigate } from "react-router-dom";
import Home from "./pages/home.jsx";
import Login from "./pages/login.jsx";
import Profile from "./pages/Profile.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import LogoutButton from "./components/LogoutButton.jsx";
import LoginButton from "./components/LoginButton.jsx";
import Reserva from "./pages/Reserva.jsx";
import Search from "./pages/search.jsx"
export default function App() {
  const navigate = useNavigate();
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/buscar" element={<Search />} />   
        <Route path="/reserva" element={<Reserva />} />    
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}
