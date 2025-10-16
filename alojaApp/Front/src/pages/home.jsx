import React, { useMemo, useState, useEffect } from "react";
import SearchButton from "../components/SearchButton";
import PropertyCard from "../components/PropertyCard";

/**
 * AlojaApp – Home.jsx (con Precio Máx + fixes)
 */

// ====== Tema / tokens ======
const PRIMARY = "#F8C24D";
const TEXT_DARK = "#0F172A";
const TEXT_MUTED = "#334155";
const CARD_BG = "#FFFFFF";
const PAGE_BG = PRIMARY;

// ====== Helpers ======
function classNames(...xs) {
  return xs.filter(Boolean).join(" ");
}

/** Navega de forma segura sin depender de Router. */
function navigateTo(url) {
  if (typeof window !== "undefined" && url) {
    window.location.assign(url);
  }
}

/** Mapeo temporal: texto de ubicación -> id_localidad (reemplazar por IDs reales o un <select>) */
const LOCALIDAD_ID = {
  "Buenos Aires": 1,
  "Córdoba": 2,
  "Rosario": 3,
  // TODO: reemplazar por valores reales o resolver con un autocomplete/selector
};

/** Construye la URL de búsqueda con los NOMBRES que espera TU backend */
export function buildSearchURL({ location, checkIn, checkOut, guests, maxPrice }) {
  // Si el usuario ya puso un número, lo tomamos como id_localidad
  const maybeId = Number(location);
  const id_localidad = Number.isFinite(maybeId)
    ? String(maybeId)
    : (LOCALIDAD_ID[location] ? String(LOCALIDAD_ID[location]) : "");

  const params = new URLSearchParams({
    fecha_inicio: checkIn || "",
    fecha_fin: checkOut || "",
    huespedes: guests != null ? String(guests) : "",
    id_localidad: id_localidad,
  });

  if (maxPrice != null && String(maxPrice).trim() !== "") {
    params.set("precio_max", String(maxPrice));
  }

  return `/buscar?${params.toString()}`;
}

/** Determina si la búsqueda debe estar deshabilitada (precio es opcional) */
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
        backgroundColor: "#F5DCA1",
        color: TEXT_DARK,
      }}
      aria-label="Barra de navegación"
    >
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <a href="/" aria-label="Ir al inicio">
            <img
              src="/images/logo.png"
              alt="AlojaApp"
              className="object-contain"
              style={{ maxHeight: "70px", height: "auto", width: "auto" }}
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
                active === it.key ? "font-semibold" : "opacity-80 hover:opacity-100"
              )}
              aria-current={active === it.key ? "page" : undefined}
              style={{ color: TEXT_DARK, textDecoration: "none" }}
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
  const [maxPrice, setMaxPrice] = useState("");

  const disabled = useMemo(
    () => isSearchDisabled({ location, checkIn, checkOut, guests }),
    [location, checkIn, checkOut, guests]
  );

  return (
    <div
      className="w-full max-w-6xl mx-auto" // 🔹 más ancha (antes max-w-5xl)
      role="search"
      aria-label="Buscador de alojamientos"
    >
      <div
        className="rounded-2xl shadow-xl p-4 md:p-5"
        style={{
          backgroundColor: CARD_BG,
          border: "1px solid rgba(0,0,0,0.05)",
        }}
      >
        {/* 🔹 Cambié a grid de 6 columnas iguales */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
          <Field label="¿A dónde vas?" icon={<MapPinIcon />}>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Ciudad o ID localidad"
              className="w-full bg-transparent outline-none"
              aria-label="Destino"
            />
          </Field>

          <Field label="Fecha de llegada" icon={<CalendarIcon />}>
            <input
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="w-full bg-transparent outline-none"
            />
          </Field>

          <Field label="Fecha de salida" icon={<CalendarIcon />}>
            <input
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="w-full bg-transparent outline-none"
            />
          </Field>

          <Field label="Huéspedes" icon={<UsersIcon />}>
            <input
              type="number"
              min={1}
              max={30}
              value={guests}
              onChange={(e) =>
                setGuests(Math.min(30, Math.max(1, parseInt(e.target.value || "1", 10))))
              }
              className="w-full bg-transparent outline-none"
            />
          </Field>

          {/* 🔹 Precio máx ahora ocupa exactamente el mismo ancho */}
          <Field label="Precio máx" icon={<PriceIcon />}>
            <input
              type="number"
              min={0}
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full bg-transparent outline-none"
              placeholder="Ej: 300"
            />
          </Field>

          {/* Botón buscar, más grande y centrado */}
          <div className="flex justify-center md:justify-end">
            <SearchButton
              onClick={() => !disabled && onSearch?.({ location, checkIn, checkOut, guests, maxPrice })}
              disabled={disabled}
              label="Buscar"
            />
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

// ====== Cards (Home: destacadas) ======
function DestinationsGrid() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProperties() {
      try {
        const res = await fetch("http://localhost:4000/propiedades/destacadas");
        const data = await res.json();
        setItems(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error cargando propiedades:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProperties();
  }, []);

  if (loading) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-10 text-center text-slate-600">
        Cargando propiedades...
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-10 text-center text-slate-600">
        No se encontraron propiedades destacadas.
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <h2 className="text-2xl font-semibold text-slate-900 mb-6">Propiedades destacadas</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map((p) => (
          <PropertyCard
            key={p.id_propiedad || `${p.titulo}-${p.localidad}`}
            image={p.imagen_url || "https://via.placeholder.com/400x250?text=AlojaApp"}
            title={`${p.titulo ?? "Propiedad"} – ${p.localidad ?? ""}`}
            subtitle={`${p.ciudad ?? ""}${p.pais ? `, ${p.pais}` : ""}`} 
            rating={Number(p.rating ?? p.puntuacion ?? 0)}
          />
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
function PriceIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M12 3v18M7 7h6a4 4 0 1 1 0 8H7" stroke={TEXT_MUTED} strokeWidth="1.5" />
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
  // ====== Integración del Chat de Dialogflow ======
  useEffect(() => {
  if (!document.querySelector('script[src*="dialogflow-console/fast/messenger/bootstrap.js"]')) {
    const script = document.createElement("script");
    script.src = "https://www.gstatic.com/dialogflow-console/fast/messenger/bootstrap.js?v=1";
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      const messenger = document.createElement("df-messenger");
      messenger.setAttribute("intent", "WELCOME");
      messenger.setAttribute("chat-title", "Aloja");
      messenger.setAttribute("agent-id", "05ffc9d0-9558-4057-ae6b-408b29eb69e0");
      messenger.setAttribute("language-code", "es");

      // 🎨 Colores personalizados (tema amarillo Aloja)
      messenger.setAttribute("chat-icon", "/images/logo.png"); // opcional
      messenger.setAttribute("chat-width", "360");
      messenger.setAttribute("chat-height", "500");
      messenger.style.setProperty("--df-messenger-bot-message", "#FFF8D6"); // burbujas del bot
      messenger.style.setProperty("--df-messenger-user-message", "#F8C24D"); // burbujas del usuario
      messenger.style.setProperty("--df-messenger-font-color", "#0F172A"); // texto
      messenger.style.setProperty("--df-messenger-send-icon", "#F8C24D");
      messenger.style.setProperty("--df-messenger-button-titlebar-color", "#F8C24D"); // barra superior

      document.body.appendChild(messenger);
    };
  } else {
    const messenger = document.querySelector("df-messenger");
    if (messenger) messenger.style.display = "block";
  }

  return () => {
    const messenger = document.querySelector("df-messenger");
    if (messenger) messenger.style.display = "none";
  };
}, []);
  function handleSearch(params) {
    const url = buildSearchURL(params); // ahora incluye precio_max y nombres del backend
    navigateTo(url);
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
    const url1 = buildSearchURL({
      location: "1", // id_localidad directo
      checkIn: "2025-10-10",
      checkOut: "2025-10-12",
      guests: 2,
      maxPrice: 300,
    });
    console.assert(url1.startsWith("/buscar?"), "[TEST] URL debe iniciar con /buscar?");
    console.assert(url1.includes("fecha_inicio=2025-10-10"), "[TEST] Debe mapear fecha_inicio");
    console.assert(url1.includes("huespedes=2"), "[TEST] Debe incluir huespedes");
    console.assert(url1.includes("precio_max=300"), "[TEST] Debe incluir precio_max");
  } catch (err) {
    console.error("[SmokeTests] Error ejecutando tests:", err);
  }
}

if (typeof window !== "undefined") {
  const mode = (import.meta && import.meta.env && import.meta.env.MODE) || "development";
  if (mode !== "production") __runSmokeTests();
}
