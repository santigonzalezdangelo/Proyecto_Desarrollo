import { Routes, Route } from "react-router-dom";
import Home from "./pages/home.jsx";      // si tu archivo se llama 'home.jsx'
import Login from "./pages/Login.jsx";
import Profile from "./pages/Profile.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import LogoutButton from "./components/LogoutButton.jsx";
import LoginButton from "./components/LoginButton.jsx";
import Search from "./pages/search.jsx"
export default function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/buscar" element={<search />} />        
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
