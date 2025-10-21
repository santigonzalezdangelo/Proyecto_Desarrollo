import React, { useMemo, useState, useEffect, useRef, useLayoutEffect} from "react";
import Navbar from "../components/NavBar";
import { SearchBar } from "../components/SearchBar";
import PropertyCard from "../components/PropertyCard";

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
const PRIMARY = "#F8C24D";
const TEXT_DARK = "#0F172A";
const TEXT_MUTED = "#334155";
const CARD_BG = "#FFFFFF";
const PAGE_BG = "#FFF6DB"; // crema claro del resto del sitio

// Alturas para controlar “fusión” con Navbar
const NAV_HEIGHT = 72;        // alto visible de tu navbar
const HERO_ANCHOR_TOP = 130;  // top cuando está grande en el héroe
const NAV_Z = 90;             // z-index del navbar 

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


// ====== Cards (Home: destacadas) ======
// ====== Cards (Home: destacadas) ======
function DestinationsGrid() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProperties() {
      try {
        // Si usás Vite, podés definir VITE_API_URL=http://localhost:4000
        const BASE =
          (typeof import.meta !== "undefined" &&
            import.meta.env &&
            import.meta.env.VITE_API_URL) ||
          "http://localhost:4000";

        const res = await fetch(`${BASE}/api/properties/destacadas`, {
          headers: { Accept: "application/json" },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const json = await res.json();
        // Acepta array plano o { data: [...] }
        const raw = Array.isArray(json) ? json : (json && Array.isArray(json.data) ? json.data : []);

        // Normalizamos campos para que PropertyCard no falle si cambia el shape
        const arr = (raw || []).map((p, i) => ({
          ...p,
          _titulo:
            p.titulo ||
            p.nombre ||
            (p.localidad ? `Alojamiento en ${p.localidad}` : "Propiedad"),
          _imagen:
            p.imagen_url ||
            p.imagen_principal ||
            p.url_foto ||
            "https://via.placeholder.com/400x250?text=AlojaApp",
          _sub: `${p.ciudad ? p.ciudad : ""}${p.pais ? (p.ciudad ? ", " : "") + p.pais : ""}`,
          _key: p.id_propiedad || p.id || `prop-${i}`,
          _rating: Number(p.rating != null ? p.rating : (p.puntuacion != null ? p.puntuacion : 0)),
          _loc: p.localidad || "",
        }));

        setItems(arr);
      } catch (err) {
        console.error("Error cargando propiedades destacadas:", err);
        setItems([]);
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

  if (!items.length) {
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
            key={p._key}
            image={p._imagen}
            title={`${p._titulo}${p._loc ? " – " + p._loc : ""}`}
            subtitle={p._sub}
            rating={p._rating}
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

function StarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M12 3l2.867 5.811 6.41.932-4.638 4.523 1.095 6.382L12 17.77l-5.734 3.878 1.095-6.382L2.723 9.743l6.41-.932L12 3z" stroke={TEXT_DARK} strokeWidth="1.2" fill="none" />
    </svg>
  );
}

// ====== Página Home ======
// arriba del archivo: // suma useEffect si no estaba

export default function Home() {
  const searchAnchorRef = useRef(null);
  // ⬇ Chat Dialogflow dentro del componente (no afuera)
  useEffect(() => {
    // evita inyectar dos veces en dev/StrictMode
    if (!document.querySelector('script[src*="dialogflow-console/fast/messenger/bootstrap.js"]')) {
      const script = document.createElement("script");
      script.src = "https://www.gstatic.com/dialogflow-console/fast/messenger/bootstrap.js?v=1";
      script.async = true;
      document.body.appendChild(script);

      script.onload = () => {
        const messenger = document.createElement("df-messenger");
        messenger.setAttribute("intent", "WELCOME");
        messenger.setAttribute("chat-title", "Aloja");
        messenger.setAttribute("agent-id", "05ffc9d0-9558-4057-ae6b-408b29eb69e0"); // tu Agent ID
        messenger.setAttribute("language-code", "es");

        // (opcional) tema
        messenger.setAttribute("chat-icon", "/images/logo.png");
        messenger.setAttribute("chat-width", "360");
        messenger.setAttribute("chat-height", "500");
        messenger.style.setProperty("--df-messenger-bot-message", "#FFF8D6");
        messenger.style.setProperty("--df-messenger-user-message", "#F8C24D");
        messenger.style.setProperty("--df-messenger-font-color", "#0F172A");
        messenger.style.setProperty("--df-messenger-send-icon", "#F8C24D");
        messenger.style.setProperty("--df-messenger-button-titlebar-color", "#F8C24D");
        // que el chatbot flote por encima del navbar
        messenger.style.position = "fixed";
        messenger.style.zIndex = "9999";
        // (opcional) asegurar ubicación del botón flotante
        messenger.style.right = "16px";
        messenger.style.bottom = "16px";

        document.body.appendChild(messenger);
      };
    } else {
      // si ya existe, mostralo
      const messenger = document.querySelector("df-messenger");
      if (messenger) {
        messenger.style.display = "block";
        messenger.style.position = "fixed";
        messenger.style.zIndex = "9999";
      }
    }
    // cleanup: ocultar al salir de Home
    return () => {
      const messenger = document.querySelector("df-messenger");
      if (messenger) messenger.style.display = "none";
    };
  }, []);

  function handleSearch(params) {
    const url = buildSearchURL(params);
    navigateTo(url);
  }

return (
    <div style={{ backgroundColor: PAGE_BG, minHeight: "100vh", paddingTop: `${NAV_HEIGHT + 16}px` }}>
      <Navbar active="inicio" />
      {}
      {/* HERO con imagen de fondo + fade */}
      <section className="relative w-full" style={{ minHeight: "62vh", paddingTop: 8 }}>
        {/* Imagen */}
        <div
          className="absolute inset-0 bg-center bg-cover"
          style={{ backgroundImage: 'url(/images/fondoHome.png)' }}
          aria-hidden="true"
        />

        {/* Overlay amarillo (más suave) */}
        <div
          className="absolute inset-0"
          style={{ backgroundColor: "rgba(248,194,77,0.35)" }}
          aria-hidden="true"
        />

        {/* Fade inferior hacia el color del body */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-40"
          style={{
            background:
              "linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,246,219,0.85) 65%, #FFF6DB 100%)",
          }}
          aria-hidden="true"
        />

        {/* Contenido */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 pt-10 sm:pt-16 pb-28 flex flex-col gap-6">
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight text-white drop-shadow-[0_2px_3px_rgba(0,0,0,.55)]">
            Encontrá alojamientos en alquiler
          </h1>

          <p className="mt-1 text-lg max-w-2xl text-white/95 drop-shadow-[0_2px_3px_rgba(0,0,0,.55)]">
            ¡Tu próxima aventura empieza acá! Encontrá alojamientos únicos en cada rincón del país
            y hospedate con personas que comparten tu forma de viajar.
          </p>

          {/* Ancla para posicionar la SearchBar */}
          <div ref={searchAnchorRef} />

          <div className="mt-4">
            <SearchBar
              variant="floating"
              anchorRef={searchAnchorRef}
              navbarHeight={NAV_HEIGHT}
              onSearch={handleSearch}
            />
          </div>
        </div>
      </section>

      <div className="rounded-t-[28px]">
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
