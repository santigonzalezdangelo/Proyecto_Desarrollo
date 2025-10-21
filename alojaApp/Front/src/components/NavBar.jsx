import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

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

  // cerrar al tocar fuera del MENÚ **y** del BOTÓN, o con Esc
  useEffect(() => {
    const onPointerDown = (e) => {
      const inMenu = menuRef.current && menuRef.current.contains(e.target);
      const inButton = buttonRef.current && buttonRef.current.contains(e.target);
      if (!inMenu && !inButton) setOpen(false);   // fuera de ambos → cerrar
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };

    // captura para que corra antes que otros handlers y sea consistente con Portal
    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown, true);
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
        {/* === Botón hamburguesa portaleado (SIEMPRE arriba del SearchBar) === */}
        {createPortal(
          <button
            ref={buttonRef}
            type="button"
            aria-haspopup="menu"
            aria-expanded={open}
            aria-controls="navbar-menu"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex items-center justify-center rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2"
            style={{
              position: "fixed",
              top: 10,                 // ajustá si tu navbar es más alto/bajo
              right: 16,               // respeta tu padding lateral
              height: BTN,
              width: BTN,
              backgroundColor: "#F8C24D",
              color: TEXT_DARK,
              boxShadow: "0 10px 24px rgba(0,0,0,.16)",
              zIndex: 100000,          // por encima de TODO
            }}
            title="Abrir menú"
          >
            <HamburgerIcon />
          </button>,
          document.body
        )}

        {/* === Menú portaleado (por encima del SearchBar) === */}
        {open &&
          createPortal(
            <div
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 99999,         // capa del menú (top absoluta)
                pointerEvents: "none", // el overlay no bloquea el panel
              }}
            >
              {/* Backdrop clickable */}
              <div
                onClick={() => setOpen(false)}
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "rgba(0,0,0,0.25)",
                  pointerEvents: "auto",
                }}
              />

              {/* Panel del menú (usa el ref para no cerrarse al click interno) */}
              <div
                ref={menuRef}
                id="navbar-menu"
                role="menu"
                aria-label="Opciones"
                className="w-64 rounded-2xl shadow-lg border"
                style={{
                  position: "absolute",
                  top: 72 + 8,          // alto del navbar (H) + margen
                  right: 16,            // alineado con el botón
                  background: "#FFFFFF",
                  borderColor: "rgba(0,0,0,0.06)",
                  pointerEvents: "auto",
                }}
              >
                <nav className="py-2">
                  <a role="menuitem" href="/" className="block px-4 py-3 hover:bg-slate-50 rounded-xl mx-1" onClick={() => setOpen(false)}>
                    Inicio
                  </a>
                  <a role="menuitem" href="/conviertete-en-anfitrion" className="block px-4 py-3 hover:bg-slate-50 rounded-xl mx-1" onClick={() => setOpen(false)}>
                    Conviértete en anfitrión
                  </a>
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
            </div>,
            document.body
          )
        }
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
