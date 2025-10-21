// import { Routes, Route, Navigate} from "react-router-dom";
// import Home from "./pages/home.jsx";      // si tu archivo se llama 'home.jsx'
// import Login from "./pages/Login.jsx";
// import Profile from "./pages/Profile.jsx";
// import ProtectedRoute from "./components/ProtectedRoute.jsx";
// import AdministrarPropiedades from "./pages/AdministrarPropiedades.jsx";
// import Search from "./pages/search.jsx";  // importa el componente Search (export default)
// import PropiedadesEncontradas from "./pages/propiedades-encontradas.jsx";
// import Reservas from "./pages/reservas.jsx";
// import Register from "./pages/Register.jsx";
// import Reserva from "./pages/Reserva.jsx";


// export default function App() {
//   return (
//     <Routes>
//       <Route path="/" element={<Home />} />
//       <Route path="/login" element={<Login />} />
//       <Route path="/buscar" element={<Search />} />   {/* <-- FIX */}
//       <Route path="/reservas" element={<Reservas />} />
//       <Route path="/reserva" element={<Reserva />} />
//       <Route path="/register" element={<Register />} />
//       <Route path="/perfil" element={<Profile />} />
//       <Route path="/administrarPropiedades" element= {<AdministrarPropiedades/>}/>
//       <Route
//           path="/propiedades-encontradas"
//           element={<PropiedadesEncontradas />} />
//       <Route path="/reserva/:id" element={<Reserva />} />

//     </Routes>
//   );
// }


import { Routes, Route, Navigate} from "react-router-dom";
import Home from "./pages/home.jsx";      // si tu archivo se llama 'home.jsx'
import Login from "./pages/Login.jsx";
import Profile from "./pages/Profile.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AdministrarPropiedades from "./pages/AdministrarPropiedades.jsx";
import Search from "./pages/search.jsx";  // importa el componente Search (export default)
import PropiedadesEncontradas from "./pages/propiedades-encontradas.jsx";
import Reservas from "./pages/reservas.jsx";
import Register from "./pages/Register.jsx";
import Reserva from "./pages/Reserva.jsx";


export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/buscar" element={<Search />} />   {/* <-- FIX */}
      <Route path="/reservas" element={<Reservas />} />
      <Route path="/reserva" element={<Reserva />} />
      <Route path="/register" element={<Register />} />
      <Route path="/perfil" element={<Profile />} />
      <Route path="/administrarPropiedades" element= {<AdministrarPropiedades/>}/>
      <Route
          path="/propiedades-encontradas"
          element={<PropiedadesEncontradas />} />

    </Routes>
  );
}