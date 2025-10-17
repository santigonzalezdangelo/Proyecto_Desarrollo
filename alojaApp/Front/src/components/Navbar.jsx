import React from "react";

const TEXT_DARK = "#0F172A"; // slate-900

export default function Navbar({ active = "inicio" }) {
  const items = [
    { key: "inicio", label: "Inicio", href: "/" },
    { key: "perfil", label: "Perfil", href: "/profile" },
    { key: "login", label: "Login", href: "/login" },
  ];

  return (
    <header
      className="sticky top-0 z-50 w-full"
      style={{
        backgroundColor: "#F5DCA1",
        color: TEXT_DARK,
        boxShadow: "none", // ❌ elimina la sombra que generaba la franja
        margin: 0,
        padding: 0,
      }}
      aria-label="Barra de navegación"
    >
      <div
        className="w-full flex items-center justify-between"
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "8px 16px", // espacio interno suave
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3">
          <a href="/" aria-label="Ir al inicio">
            <img
              src="/images/logo.png"
              alt="Aloja"
              className="object-contain"
              style={{
                maxHeight: "60px",
                height: "auto",
                width: "auto",
                marginTop: "2px", // 🔧 ajusta leve alineación vertical
              }}
            />
          </a>
        </div>

        {/* Links */}
        <nav className="flex items-center gap-4">
          {items.map((it) => (
            <a
              key={it.key}
              href={it.href}
              className={`text-base transition-colors ${
                active === it.key
                  ? "font-semibold"
                  : "opacity-80 hover:opacity-100"
              }`}
              aria-current={active === it.key ? "page" : undefined}
              style={{
                color: TEXT_DARK,
                textDecoration: "none",
              }}
            >
              {it.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
