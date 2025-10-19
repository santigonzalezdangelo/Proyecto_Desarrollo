// src/components/Navbar.jsx
import React, { useEffect, useRef, useState } from "react";

const TEXT_DARK = "#0F172A";

export default function Navbar({
  logoSrc = "/images/logo.png",
  logoHref = "/",
  bg = "#F5DCA1",
  z = 200,
  onLogout, // opcional
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

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

  // paddings simétricos
  const H = 72;           // alto navbar
  const PADX = 28;        // padding lateral (mismo a izq/der)
  const BTN = 52;         // alto/ancho botón hamburger
  const LOGO_H = 64;      // alto del logo (proporcional al botón)

  return (
    <header
      className="fixed top-0 left-0 right-0 w-full shadow-md"
      style={{
        height: H,
        backgroundColor: bg,
        color: TEXT_DARK,
        overflow: "visible", // evita que recorte el dropdown
        zIndex: z,
      }}
      aria-label="Barra de navegación"
    >
      <div
        className="mx-auto flex items-center justify-between"
        style={{
          height: "100%",
          paddingInline: PADX, // mismo padding a ambos lados
          overflow: "visible",
        }}
      >
        {/* Logo */}
        <a
          href={logoHref}
          aria-label="Ir al inicio"
          className="flex items-center"
          style={{
            lineHeight: 0,
            transform: "translate(-10px,8px)", // 
          }}
        >
          <img
            src={logoSrc}
            alt="AlojaApp"
            style={{
              height: LOGO_H,
              width: "auto",
              display: "block",
              objectFit: "contain",
            }}
          />
        </a>

        {/* Menú hamburguesa (sin absolute, perfectamente centrado) */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            aria-haspopup="menu"
            aria-expanded={open}
            aria-controls="navbar-menu"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex items-center justify-center rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2"
            style={{
              height: BTN,
              width: BTN,
              backgroundColor: "#F8C24D",
              color: TEXT_DARK,
              boxShadow: "0 10px 24px rgba(0,0,0,.16)",
            }}
            title="Abrir menú"
          >
            <HamburgerIcon />
          </button>

          {/* Dropdown (cuelga del botón, no se corta) */}
          {open && (
            <div
              id="navbar-menu"
              role="menu"
              aria-label="Opciones"
              className="absolute right-0 mt-2 w-64 rounded-2xl shadow-lg border z-[9999]"
              style={{ background: "#FFFFFF", borderColor: "rgba(0,0,0,0.06)" }}
            >
              <nav className="py-2">
                <a
                  role="menuitem"
                  href="/perfil"
                  className="block px-4 py-3 hover:bg-slate-50 rounded-xl mx-1"
                  onClick={() => setOpen(false)}
                >
                  Perfil
                </a>
                <a
                  role="menuitem"
                  href="/admin/propiedades"
                  className="block px-4 py-3 hover:bg-slate-50 rounded-xl mx-1"
                  onClick={() => setOpen(false)}
                >
                  Administrar propiedades
                </a>
                <a
                  role="menuitem"
                  href="/admin/reservas"
                  className="block px-4 py-3 hover:bg-slate-50 rounded-xl mx-1"
                  onClick={() => setOpen(false)}
                >
                  Administrar reservas
                </a>
                <div className="h-px my-2 bg-black/10 mx-3" />
                <a
                  role="menuitem"
                  href="/logout"
                  className="block px-4 py-3 hover:bg-slate-50 rounded-xl mx-1 text-red-600"
                  onClick={(e) => {
                    setOpen(false);
                    onLogout?.(e);
                  }}
                >
                  Cerrar sesión
                </a>
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
