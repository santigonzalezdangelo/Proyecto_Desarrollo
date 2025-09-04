import { Routes, Route, Link, useNavigate } from "react-router-dom";
import Home from "./pages/home.jsx";
import Login from "./pages/login.jsx";
import Profile from "./pages/Profile.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import LogoutButton from "./components/LogoutButton.jsx";
import LoginButton from "./components/LoginButton.jsx";

export default function App() {
  const navigate = useNavigate();
  return (
    <div>
      <nav style={{ display: "flex", gap: 12, padding: 12 }}>
        <Link to="/">Home</Link>
        <button onClick={() => navigate("/login")}>Iniciar sesión</button>
        <Link to="/profile">Perfil</Link>
        <LoginButton />
        <LogoutButton />
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
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
