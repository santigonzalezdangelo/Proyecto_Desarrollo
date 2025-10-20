
// import React, { useEffect, useRef, useState } from "react";

// const TEXT_DARK = "#0F172A";
// const API = (import.meta.env.VITE_API_URL).replace(/\/$/, "");

// export default function Navbar({
//   logoSrc = "/images/logo.png",
//   logoHref = "/",
//   bg = "#F5DCA1",
//   z = 200,
// }) {
//   const [open, setOpen] = useState(false);
//   const [loggingOut, setLoggingOut] = useState(false);
//   const menuRef = useRef(null);

//   useEffect(() => {
//     function onClickOutside(e) {
//       if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
//     }
//     function onKey(e) {
//       if (e.key === "Escape") setOpen(false);
//     }
//     document.addEventListener("mousedown", onClickOutside);
//     document.addEventListener("keydown", onKey);
//     return () => {
//       document.removeEventListener("mousedown", onClickOutside);
//       document.removeEventListener("keydown", onKey);
//     };
//   }, []);

//   // --- LOGOUT ---
//   const handleLogout = async (e) => {
//     e.preventDefault();
//     if (loggingOut) return;
//     setOpen(false);
//     setLoggingOut(true);
//     try {
//       await fetch(`${API}/auth/logout`, {
//         method: "POST",
//         credentials: "include",  
//         headers: { "Content-Type": "application/json" },
//       });
//     } catch {
//       // nada
//     } finally {
//       setLoggingOut(false);
//       window.location.href = "/login";
//     }
//   };

//   const H = 72;
//   const PADX = 28;
//   const BTN = 52;
//   const LOGO_H = 64;

//   return (
//     <header
//       className="fixed top-0 left-0 right-0 w-full shadow-md"
//       style={{ height: H, backgroundColor: bg, color: TEXT_DARK, overflow: "visible", zIndex: z }}
//       aria-label="Barra de navegación"
//     >
//       <div className="mx-auto flex items-center justify-between" style={{ height: "100%", paddingInline: PADX, overflow: "visible" }}>
//         <a href={logoHref} aria-label="Ir al inicio" className="flex items-center" style={{ lineHeight: 0, transform: "translate(-10px,8px)" }}>
//           <img src={logoSrc} alt="AlojaApp" style={{ height: LOGO_H, width: "auto", display: "block", objectFit: "contain" }} />
//         </a>

//         <div className="relative" ref={menuRef}>
//           <button
//             type="button"
//             aria-haspopup="menu"
//             aria-expanded={open}
//             aria-controls="navbar-menu"
//             onClick={() => setOpen((v) => !v)}
//             className="inline-flex items-center justify-center rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2"
//             style={{ height: BTN, width: BTN, backgroundColor: "#F8C24D", color: TEXT_DARK, boxShadow: "0 10px 24px rgba(0,0,0,.16)" }}
//             title="Abrir menú"
//           >
//             <HamburgerIcon />
//           </button>

//           {open && (
//             <div id="navbar-menu" role="menu" aria-label="Opciones" className="absolute right-0 mt-2 w-64 rounded-2xl shadow-lg border z-[9999]"
//                  style={{ background: "#FFFFFF", borderColor: "rgba(0,0,0,0.06)" }}>
//               <nav className="py-2">
//                 <a role="menuitem" href="/perfil" className="block px-4 py-3 hover:bg-slate-50 rounded-xl mx-1" onClick={() => setOpen(false)}>
//                   Perfil
//                 </a>
//                 <a role="menuitem" href="/admin/propiedades" className="block px-4 py-3 hover:bg-slate-50 rounded-xl mx-1" onClick={() => setOpen(false)}>
//                   Administrar propiedades
//                 </a>
//                 <a role="menuitem" href="/reservas" className="block px-4 py-3 hover:bg-slate-50 rounded-xl mx-1" onClick={() => setOpen(false)}>
//                   Administrar reservas
//                 </a>
//                 <div className="h-px my-2 bg-black/10 mx-3" />
//                 <a
//                   role="menuitem"
//                   href="/login"
//                   className="block px-4 py-3 hover:bg-slate-50 rounded-xl mx-1 text-red-600"
//                   onClick={handleLogout}
//                   aria-disabled={loggingOut}
//                 >
//                   {loggingOut ? "Cerrando sesión..." : "Cerrar sesión"}
//                 </a>
//               </nav>
//             </div>
//           )}
//         </div>
//       </div>
//     </header>
//   );
// }

// function HamburgerIcon() {
//   return (
//     <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
//       <rect x="3" y="6" width="18" height="2" rx="1" fill={TEXT_DARK} />
//       <rect x="3" y="11" width="18" height="2" rx="1" fill={TEXT_DARK} />
//       <rect x="3" y="16" width="18" height="2" rx="1" fill={TEXT_DARK} />
//     </svg>
//   );
// }

// src/components/Navbar.jsx
import React, { useEffect, useRef, useState } from "react";

const TEXT_DARK = "#0F172A";
const API = (import.meta.env.VITE_API_URL || "http://localhost:4000").replace(/\/$/, "");

export default function Navbar({
  logoSrc = "/images/logo.png",
  logoHref = "/",
  bg = "#F5DCA1",
  z = 200,
}) {
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // <- NUEVO
  const menuRef = useRef(null);

  // Detectar sesión
  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const r = await fetch(`${API}/auth/current`, { credentials: "include" });
        if (!ignore) setIsLoggedIn(r.ok);
      } catch {
        if (!ignore) setIsLoggedIn(false);
      }
    })();
    return () => { ignore = true; };
  }, []);

  // cerrar al click afuera o Esc
  useEffect(() => {
    function onClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    }
    function onKey(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  // Logout
  const handleLogout = async (e) => {
    e.preventDefault();
    if (loggingOut) return;
    setOpen(false);
    setLoggingOut(true);
    try {
      await fetch(`${API}/auth/logout`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
    } catch {
      //
    }
    setLoggingOut(false);
    window.location.href = "/login";
  };

  const H = 72, PADX = 28, BTN = 52, LOGO_H = 64;

  return (
    <header
      className="fixed top-0 left-0 right-0 w-full shadow-md"
      style={{ height: H, backgroundColor: bg, color: TEXT_DARK, overflow: "visible", zIndex: z }}
      aria-label="Barra de navegación"
    >
      <div className="mx-auto flex items-center justify-between" style={{ height: "100%", paddingInline: PADX, overflow: "visible" }}>
        {/* Logo */}
        <a href={logoHref} aria-label="Ir al inicio" className="flex items-center" style={{ lineHeight: 0, transform: "translate(-10px,8px)" }}>
          <img src={logoSrc} alt="AlojaApp" style={{ height: LOGO_H, width: "auto", display: "block", objectFit: "contain" }} />
        </a>

        {/* Menú */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            aria-haspopup="menu"
            aria-expanded={open}
            aria-controls="navbar-menu"
            onClick={() => setOpen(v => !v)}
            className="inline-flex items-center justify-center rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2"
            style={{ height: BTN, width: BTN, backgroundColor: "#F8C24D", color: TEXT_DARK, boxShadow: "0 10px 24px rgba(0,0,0,.16)" }}
            title="Abrir menú"
          >
            <HamburgerIcon />
          </button>

          {open && (
            <div
              id="navbar-menu"
              role="menu"
              aria-label="Opciones"
              className="absolute right-0 mt-2 w-64 rounded-2xl shadow-lg border z-[9999]"
              style={{ background: "#FFFFFF", borderColor: "rgba(0,0,0,0.06)" }}
            >
              <nav className="py-2">
                <a role="menuitem" href="/perfil" className="block px-4 py-3 hover:bg-slate-50 rounded-xl mx-1" onClick={() => setOpen(false)}>
                  Perfil
                </a>
                <a role="menuitem" href="/administrarPropiedades" className="block px-4 py-3 hover:bg-slate-50 rounded-xl mx-1" onClick={() => setOpen(false)}>
                  Administrar propiedades
                </a>
                <a role="menuitem" href="/reservas" className="block px-4 py-3 hover:bg-slate-50 rounded-xl mx-1" onClick={() => setOpen(false)}>
                  Administrar reservas
                </a>

                <div className="h-px my-2 bg-black/10 mx-3" />

                {/* Auth item condicional */}
                {isLoggedIn ? (
                  <a
                    role="menuitem"
                    href="/login"
                    className="block px-4 py-3 hover:bg-slate-50 rounded-xl mx-1 text-red-600"
                    onClick={handleLogout}
                    aria-disabled={loggingOut}
                  >
                    {loggingOut ? "Cerrando sesión..." : "Cerrar sesión"}
                  </a>
                ) : (
                  <a
                    role="menuitem"
                    href="/login"
                    className="block px-4 py-3 hover:bg-slate-50 rounded-xl mx-1"
                    onClick={() => setOpen(false)}
                  >
                    Login
                  </a>
                )}
              </nav>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function HamburgerIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="6" width="18" height="2" rx="1" fill={TEXT_DARK} />
      <rect x="3" y="11" width="18" height="2" rx="1" fill={TEXT_DARK} />
      <rect x="3" y="16" width="18" height="2" rx="1" fill={TEXT_DARK} />
    </svg>
  );
}
