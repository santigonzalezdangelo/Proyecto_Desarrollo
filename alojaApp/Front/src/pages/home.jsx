import React, { useMemo, useState } from "react";

/**
 * AlojaApp – Home.jsx (FIX NAVIGATION)
 * ------------------------------------------------------------
 * ✅ Arregla el error: "useNavigate() may be used only in the context of a <Router>"
 *   - Se ELIMINA el uso de `useNavigate()` y cualquier hook de router.
 *   - La navegación se resuelve con `window.location.assign(url)` de forma segura.
 *   - Los ítems del Navbar usan <a href> en lugar de botones que llaman a hooks.
 *
 * 👁️‍🗨️ Estilos y comportamiento
 *   - Fondo principal #F8C24D (pedido del usuario)
 *   - Navbar con Inicio / Perfil / Login
 *   - Barra de búsqueda con inputs nativos y botón Buscar #F8C24D
 *   - Grid de destinos con tarjetas (placeholders de Unsplash)
 *   - Sin dependencias extra (opcionalmente se ve más prolijo con Tailwind)
 *
 * 🧪 Tests (lightweight en runtime de desarrollo):
 *   - Se agregó `buildSearchURL` + pruebas con `console.assert`.
 *   - `isSearchDisabled` probado con varios escenarios.
 * ------------------------------------------------------------
 */

// ====== Tema / tokens ======
const PRIMARY = "#F8C24D"; // pedido del usuario
const TEXT_DARK = "#0F172A"; // slate-900
const TEXT_MUTED = "#334155"; // slate-700
const CARD_BG = "#FFFFFF";
const PAGE_BG = PRIMARY; // fondo pedido

// ====== Helpers ======
function classNames(...xs) {
  return xs.filter(Boolean).join(" ");
}

/** Navega de forma segura sin depender de Router. */
function navigateTo(url) {
  if (typeof window !== "undefined" && url) {
    // Preferimos no usar pushState para evitar estados inconsistentes
    window.location.assign(url);
  }
}

/** Construye la URL de búsqueda (también usada en tests). */
export function buildSearchURL({ location, checkIn, checkOut, guests }) {
  const params = new URLSearchParams({ location, checkIn, checkOut, guests: String(guests) });
  return `/buscar?${params.toString()}`;
}

/** Determina si la búsqueda debe estar deshabilitada. */
export function isSearchDisabled({ location, checkIn, checkOut, guests }) {
  if (!location || !checkIn || !checkOut) return true;
  const g = Number(guests);
  return !(Number.isFinite(g) && g >= 1);
}

function Navbar({ active = "inicio" }) {
  const items = [
    { key: "inicio", label: "Inicio", href: "/" },
    { key: "perfil", label: "Perfil", href: "/perfil" },
    { key: "login", label: "Login", href: "/login" },
  ];

  return (
    <header
      className="sticky top-0 z-50 w-full shadow-md"
      style={{
        backgroundColor: "#F5DCA1", // fondo sólido
        color: TEXT_DARK,
      }}
      aria-label="Barra de navegación"
    >
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <a href="/" aria-label="Ir al inicio">
            <img
              src="/images/logo.png" // ✅ ruta correcta para Vite
              alt="AlojaApp"
              className="object-contain"
              style={{
                maxHeight: "70px",
                height: "auto",
                width: "auto",
              }}
            />
          </a>
        </div>

        {/* Links */}
        <nav className="flex items-center gap-3">
          {items.map((it) => (
            <a
              key={it.key}
              href={it.href}
              className={classNames(
                "text-base transition-colors",
                active === it.key
                  ? "font-semibold"
                  : "opacity-80 hover:opacity-100"
              )}
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

// ====== Search Bar ======
function SearchBar({ onSearch }) {
  const [location, setLocation] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);

  const disabled = useMemo(
    () => isSearchDisabled({ location, checkIn, checkOut, guests }),
    [location, checkIn, checkOut, guests]
  );

  return (
    <div className="w-full max-w-5xl mx-auto" role="search" aria-label="Buscador de alojamientos">
      <div className="rounded-2xl shadow-xl" style={{ backgroundColor: CARD_BG }}>
        <div className="p-3 md:p-4 grid grid-cols-1 md:grid-cols-5 gap-3 md:gap-2 items-center">
          {/* Ubicación */}
          <Field label="¿A dónde vas?" icon={<MapPinIcon />}>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Ciudad, región o país"
              className="w-full bg-transparent outline-none"
              aria-label="Destino"
            />
          </Field>

          {/* Check-in */}
          <Field label="Fecha de llegada" icon={<CalendarIcon />}>
            <input
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="w-full bg-transparent outline-none"
              aria-label="Fecha de llegada"
            />
          </Field>

          {/* Check-out */}
          <Field label="Fecha de salida" icon={<CalendarIcon />}>
            <input
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="w-full bg-transparent outline-none"
              aria-label="Fecha de salida"
            />
          </Field>

          {/* Huéspedes */}
          <Field label="Huéspedes" icon={<UsersIcon />}>
            <input
              type="number"
              min={1}
              value={guests}
              onChange={(e) => setGuests(Math.max(1, parseInt(e.target.value || "1", 10)))}
              className="w-full bg-transparent outline-none"
              aria-label="Cantidad de huéspedes"
            />
          </Field>

          {/* Botón Buscar */}
          <div className="flex justify-stretch md:justify-end">
            <button
              onClick={() => !disabled && onSearch?.({ location, checkIn, checkOut, guests })}
              disabled={disabled}
              className={classNames(
                "w-full md:w-auto px-6 py-3 rounded-xl font-semibold transition-transform active:scale-[0.98]",
                disabled ? "opacity-60 cursor-not-allowed" : "hover:brightness-95"
              )}
              style={{ backgroundColor: PRIMARY, color: TEXT_DARK }}
              aria-label="Buscar"
              data-testid="btn-buscar"
            >
              Buscar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, icon, children }) {
  return (
    <label className="flex items-center gap-2 rounded-xl border border-black/5 bg-white px-3 py-3">
      <span className="shrink-0 opacity-70" aria-hidden>
        {icon}
      </span>
      <div className="flex flex-col w-full">
        <span className="text-xs uppercase tracking-wide opacity-60" style={{ color: TEXT_MUTED }}>
          {label}
        </span>
        {children}
      </div>
    </label>
  );
}

// ====== Cards ======
function PropertyCard({ image, title, subtitle, rating }) {
  return (
    <article className="overflow-hidden rounded-2xl shadow-md bg-white">
      <div className="aspect-[16/10] w-full overflow-hidden">
        <img src={image} alt={title} className="h-full w-full object-cover" />
      </div>
      <div className="p-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          {subtitle && <p className="text-sm text-slate-600">{subtitle}</p>}
        </div>
        {typeof rating === "number" && (
          <div className="flex items-center gap-1" aria-label={`Calificación ${rating} de 5`}>
            <StarIcon />
            <span className="text-sm font-medium">{rating.toFixed(1)}</span>
          </div>
        )}
      </div>
    </article>
  );
}

function DestinationsGrid() {
  // imágenes libres de Unsplash (placeholders)
  const items = [
    {
      image: "https://images.unsplash.com/photo-1505691723518-36a5ac3be353?q=80&w=1600&auto=format&fit=crop",
      title: "Ciudad de México, México",
      subtitle: "Depto céntrico con vista",
      rating: 4.8,
    },
    {
      image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1600&auto=format&fit=crop",
      title: "Roma, Italia",
      subtitle: "Apartamento luminoso",
      rating: 4.7,
    },
    {
      image: "https://images.unsplash.com/photo-1501045661006-fcebe0257c3f?q=80&w=1600&auto=format&fit=crop",
      title: "Barcelona, España",
      subtitle: "Cerca del mar",
      rating: 4.9,
    },
    {
      image: "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?q=80&w=1600&auto=format&fit=crop",
      title: "Nueva York, EE.UU.",
      subtitle: "Loft en Brooklyn",
      rating: 4.6,
    },
  ];
  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <h2 className="text-2xl font-semibold text-slate-900 mb-6">Destinos populares</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map((it, i) => (
          <PropertyCard key={i} {...it} />
        ))}
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="mt-16 border-t border-black/10" style={{ backgroundColor: "#FFF4D0" }}>
      <div className="mx-auto max-w-7xl px-4 py-8 text-sm text-slate-700 flex flex-col md:flex-row items-center justify-between gap-3">
        <span>© {new Date().getFullYear()} AlojaApp</span>
      </div>
    </footer>
  );
}

// ====== Iconos (SVG inline, sin librerías) ======
function PinIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M12 22s7-7.111 7-12a7 7 0 10-14 0c0 4.889 7 12 7 12z" stroke={TEXT_DARK} strokeWidth="1.5" />
      <circle cx="12" cy="10" r="2.5" stroke={TEXT_DARK} strokeWidth="1.5" />
    </svg>
  );
}
function CalendarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <rect x="3" y="5" width="18" height="16" rx="2" stroke={TEXT_MUTED} strokeWidth="1.5" />
      <path d="M16 3v4M8 3v4M3 10h18" stroke={TEXT_MUTED} strokeWidth="1.5" />
    </svg>
  );
}
function MapPinIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M12 21s6-6.091 6-10.364A6 6 0 106 10.636C6 14.909 12 21 12 21z" stroke={TEXT_MUTED} strokeWidth="1.5" />
      <circle cx="12" cy="10" r="2.2" stroke={TEXT_MUTED} strokeWidth="1.5" />
    </svg>
  );
}
function UsersIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <circle cx="9" cy="8" r="3.5" stroke={TEXT_MUTED} strokeWidth="1.5" />
      <path d="M2.5 19c0-3.038 2.962-5.5 6.5-5.5S15.5 15.962 15.5 19" stroke={TEXT_MUTED} strokeWidth="1.5" />
      <circle cx="18" cy="10" r="2.5" stroke={TEXT_MUTED} strokeWidth="1.5" />
      <path d="M16 19c0-1.657 1.79-3 4-3" stroke={TEXT_MUTED} strokeWidth="1.5" />
    </svg>
  );
}
function StarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M12 3l2.867 5.811 6.41.932-4.638 4.523 1.095 6.382L12 17.77l-5.734 3.878 1.095-6.382L2.723 9.743l6.41-.932L12 3z" stroke={TEXT_DARK} strokeWidth="1.2" fill="none" />
    </svg>
  );
}

// ====== Página Home ======
export default function Home() {
  function handleSearch(params) {
    const url = buildSearchURL(params);
    navigateTo(url);
    console.log("Buscar →", params);
  }

  return (
    <div style={{ backgroundColor: PAGE_BG, minHeight: "100vh" }}>
      <Navbar active="inicio" />

      {/* Hero + Buscador */}
      <section className="mx-auto max-w-7xl px-4 pt-10 pb-8">
        <h1 className="text-4xl md:text-5xl font-extrabold leading-tight" style={{ color: TEXT_DARK }}>
          Encontrá alojamientos en alquiler
        </h1>
        <p className="mt-3 text-lg max-w-2xl" style={{ color: TEXT_MUTED }}>
          Explorá los mejores lugares para hospedarte. Inspirado en experiencias de Airbnb y Booking.
        </p>
        <div className="mt-6">
          <SearchBar onSearch={handleSearch} />
        </div>
      </section>

      {/* Grid de destinos */}
      <div className="rounded-t-[28px]" style={{ backgroundColor: "#FFF6DB" }}>
        <DestinationsGrid />
      </div>

      <Footer />
    </div>
  );
}

// ====== Smoke Tests (solo en desarrollo) ======
function __runSmokeTests() {
  try {
    // buildSearchURL
    const url1 = buildSearchURL({ location: "Roma", checkIn: "2025-10-10", checkOut: "2025-10-12", guests: 2 });
    console.assert(url1.startsWith("/buscar?"), "[TEST] buildSearchURL debe iniciar con /buscar?");
    console.assert(url1.includes("location=Roma"), "[TEST] buildSearchURL debe incluir location");
    console.assert(url1.includes("checkIn=2025-10-10"), "[TEST] buildSearchURL debe incluir checkIn");
    console.assert(url1.includes("guests=2"), "[TEST] buildSearchURL debe incluir guests");

    // isSearchDisabled
    console.assert(
      isSearchDisabled({ location: "BA", checkIn: "2025-01-01", checkOut: "2025-01-02", guests: 1 }) === false,
      "[TEST] isSearchDisabled debe habilitar al tener datos válidos"
    );
    console.assert(
      isSearchDisabled({ location: "", checkIn: "2025-01-01", checkOut: "2025-01-02", guests: 1 }) === true,
      "[TEST] isSearchDisabled debe deshabilitar si falta location"
    );
    console.assert(
      isSearchDisabled({ location: "BA", checkIn: "", checkOut: "2025-01-02", guests: 1 }) === true,
      "[TEST] isSearchDisabled debe deshabilitar si falta checkIn"
    );
    console.assert(
      isSearchDisabled({ location: "BA", checkIn: "2025-01-01", checkOut: "", guests: 1 }) === true,
      "[TEST] isSearchDisabled debe deshabilitar si falta checkOut"
    );
    console.assert(
      isSearchDisabled({ location: "BA", checkIn: "2025-01-01", checkOut: "2025-01-02", guests: 0 }) === true,
      "[TEST] isSearchDisabled debe deshabilitar si guests < 1"
    );
  } catch (err) {
    console.error("[SmokeTests] Error ejecutando tests:", err);
  }
}

if (typeof window !== "undefined") {
  // Ejecutar pruebas solo en dev si Vite está presente y no es producción
  const mode = (import.meta && import.meta.env && import.meta.env.MODE) || "development";
  if (mode !== "production") __runSmokeTests();
}
