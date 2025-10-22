import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const TEXT_DARK = "#0F172A";
const API = import.meta.env.VITE_API_URL.replace(/\/$/, "");

export default function Navbar({
  logoSrc = "/images/logo.png",
  logoHref = "/",
  bg = "#F5DCA1",
  z = 200,
}) {
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // nuevo
  const [isHuesped, setIsHuesped] = useState(false);
  // nuevo
  const [isAnfitrion, setIsAnfitrion] = useState(false);

  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  // nuevo: ids configurables por entorno (por si cambian entre seeds/DBs)
  const ROLE_IDS = {
    HUESPED: Number(import.meta.env.VITE_DEFAULT_ROLE_ID),
    ANFITRION: Number(import.meta.env.VITE_DEFAULT_ANFITRION_ID),
  };

  // nuevo: helper para obtener el nombre a partir del id
  function roleNameFromId(id) {
    const idNum = Number(id);
    if (idNum === ROLE_IDS.HUESPED) return "huesped";
    if (idNum === ROLE_IDS.ANFITRION) return "anfitrion";
    return ""; // desconocido
  }

  // Detectar sesión + rol
  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const r = await fetch(`${API}/auth/current`, {
          credentials: "include",
          headers: { Accept: "application/json" },
        });

        if (ignore) return;

        if (!r.ok) {
          setIsLoggedIn(false);
          // nuevo
          setIsHuesped(false);
          // nuevo
          setIsAnfitrion(false);
          return;
        }

        setIsLoggedIn(true);

        // nuevo: resolver nombre del rol a partir del id_rol del current
        const j = await r.json().catch(() => ({}));
        const idRol = Number(j?.data?.id_rol ?? j?.id_rol ?? NaN);
        const role = roleNameFromId(idRol); // "huesped" | "anfitrion" | ""

        setIsHuesped(role === "huesped"); // nuevo
        setIsAnfitrion(role === "anfitrion"); // nuevo
      } catch {
        if (!ignore) {
          setIsLoggedIn(false);
          // nuevo
          setIsHuesped(false);
          // nuevo
          setIsAnfitrion(false);
        }
      }
    })();
    return () => {
      ignore = true;
    };
  }, []);

  // cerrar al tocar fuera del MENÚ **y** del BOTÓN, o con Esc
  useEffect(() => {
    const onPointerDown = (e) => {
      const inMenu = menuRef.current && menuRef.current.contains(e.target);
      const inButton =
        buttonRef.current && buttonRef.current.contains(e.target);
      if (!inMenu && !inButton) setOpen(false); // fuera de ambos → cerrar
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };

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

  const H = 72,
    PADX = 28,
    BTN = 52,
    LOGO_H = 64;

  return (
    <header
      className="fixed top-0 left-0 right-0 w-full shadow-md"
      style={{
        height: H,
        backgroundColor: bg,
        color: TEXT_DARK,
        overflow: "visible",
        zIndex: z,
      }}
      aria-label="Barra de navegación"
    >
      <div
        className="mx-auto flex items-center justify-between"
        style={{ height: "100%", paddingInline: PADX, overflow: "visible" }}
      >
        {/* Logo */}
        <a
          href={logoHref}
          aria-label="Ir al inicio"
          className="flex items-center"
          style={{ lineHeight: 0, transform: "translate(-10px,8px)" }}
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
              top: 10,
              right: 16,
              height: BTN,
              width: BTN,
              backgroundColor: "#F8C24D",
              color: TEXT_DARK,
              boxShadow: "0 10px 24px rgba(0,0,0,.16)",
              zIndex: 100000,
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
                zIndex: 99999,
                pointerEvents: "none",
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

              {/* Panel del menú */}
              <div
                ref={menuRef}
                id="navbar-menu"
                role="menu"
                aria-label="Opciones"
                className="w-64 rounded-2xl shadow-lg border"
                style={{
                  position: "absolute",
                  top: 72 + 8,
                  right: 16,
                  background: "#FFFFFF",
                  borderColor: "rgba(0,0,0,0.06)",
                  pointerEvents: "auto",
                }}
              >
                <nav className="py-2">
                  {/* *** OJO: “Inicio” volado *** */}

                  {isLoggedIn ? (
                    <>
                      {/* nuevo: si es HUESPED => Perfil, Mis reservas, Convertirse en anfitrión, Cerrar sesión */}
                      {isHuesped && (
                        <>
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
                            href="/reservas"
                            className="block px-4 py-3 hover:bg-slate-50 rounded-xl mx-1"
                            onClick={() => setOpen(false)}
                          >
                            Mis reservas
                          </a>
                          <a
                            role="menuitem"
                            href="/conviertete-en-anfitrion"
                            className="block px-4 py-3 hover:bg-slate-50 rounded-xl mx-1"
                            onClick={() => setOpen(false)}
                          >
                            Convertirse en anfitrión
                          </a>
                          <div className="h-px my-2 bg-black/10 mx-3" />
                          <a
                            role="menuitem"
                            href="/login"
                            className="block px-4 py-3 hover:bg-slate-50 rounded-xl mx-1 text-red-600"
                            onClick={handleLogout}
                            aria-disabled={loggingOut}
                          >
                            {loggingOut
                              ? "Cerrando sesión..."
                              : "Cerrar sesión"}
                          </a>
                        </>
                      )}

                      {/* nuevo: si es ANFITRION => todo menos “Convertirse en anfitrión” */}
                      {isAnfitrion && (
                        <>
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
                            href="/administrarPropiedades"
                            className="block px-4 py-3 hover:bg-slate-50 rounded-xl mx-1"
                            onClick={() => setOpen(false)}
                          >
                            Administrar propiedades
                          </a>
                          <a
                            role="menuitem"
                            href="/reservas"
                            className="block px-4 py-3 hover:bg-slate-50 rounded-xl mx-1"
                            onClick={() => setOpen(false)}
                          >
                            Administrar reservas
                          </a>
                          <div className="h-px my-2 bg-black/10 mx-3" />
                          <a
                            role="menuitem"
                            href="/login"
                            className="block px-4 py-3 hover:bg-slate-50 rounded-xl mx-1 text-red-600"
                            onClick={handleLogout}
                            aria-disabled={loggingOut}
                          >
                            {loggingOut
                              ? "Cerrando sesión..."
                              : "Cerrar sesión"}
                          </a>
                        </>
                      )}

                      {/* Si está logueado pero no es ni huesped ni anfitrion, mostramos algo mínimo */}
                      {!isHuesped && !isAnfitrion && (
                        <>
                          <a
                            role="menuitem"
                            href="/perfil"
                            className="block px-4 py-3 hover:bg-slate-50 rounded-xl mx-1"
                            onClick={() => setOpen(false)}
                          >
                            Perfil
                          </a>
                          <div className="h-px my-2 bg-black/10 mx-3" />
                          <a
                            role="menuitem"
                            href="/login"
                            className="block px-4 py-3 hover:bg-slate-50 rounded-xl mx-1 text-red-600"
                            onClick={handleLogout}
                            aria-disabled={loggingOut}
                          >
                            {loggingOut
                              ? "Cerrando sesión..."
                              : "Cerrar sesión"}
                          </a>
                        </>
                      )}
                    </>
                  ) : (
                    // No logueado => solo Login
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
          )}
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
