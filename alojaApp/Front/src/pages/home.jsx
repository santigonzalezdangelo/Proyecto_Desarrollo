import React, { useMemo, useState, useEffect, useRef, useLayoutEffect} from "react";
import SearchButton from "../components/SearchButton";
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
const PAGE_BG = PRIMARY;

// Alturas para controlar “fusión” con Navbar
const NAV_HEIGHT = 72;        // alto visible de tu navbar
const HERO_ANCHOR_TOP = 130;  // top cuando está grande en el héroe
const NAV_Z = 90;             // z-index del navbar 

// ==== Ajustes de sticky/compact ====
const STICKY_GAP = 6;                 // línea amarilla visible arriba y abajo (px)
const HERO_EXTRA_H = 20;              // alto extra cuando está grande en el héroe
const COMPACT_HEIGHT = NAV_HEIGHT - STICKY_GAP * 2; // altura del contenedor cuando “pega” al navbar
// Cuánto queremos “meter” la barra dentro del navbar (puede ser 0)
const NAV_OVERLAY_OFFSET = 0; // probá 0, 2 o -2 si querés subir/bajar 2px



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
      className="fixed top-0 left-0 right-0 z-[90] w-full shadow-md"
      style={{ height: "72px", backgroundColor: "#F5DCA1", color: TEXT_DARK }}
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
// ====== Helpers extra ======
function debounce(fn, wait = 300) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

// ====== Search Bar ======
function SearchBar({ onSearch, anchorRef }) {
  const [locationText, setLocationText] = useState("");
  const [idLocalidad, setIdLocalidad] = useState("");
  const [sugs, setSugs] = useState([]);
  const [openSugs, setOpenSugs] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);

  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);
  const [maxPrice, setMaxPrice] = useState("");

  const today = new Date().toISOString().slice(0, 10);

  // Posición real del ancla (debajo del título)
  const [anchorTop, setAnchorTop] = useState(HERO_ANCHOR_TOP);
  useLayoutEffect(() => {
    const update = () => {
      const el = anchorRef?.current;
      if (!el) return;
      const y = el.getBoundingClientRect().top + window.scrollY;
      setAnchorTop(y);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [anchorRef]);

  // Progreso 0→1 desde el ancla hasta el navbar (suaviza/escala)
  const [progress, setProgress] = useState(0);
  const compact = progress > 0.5;
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const travel = Math.max(1, anchorTop);
          const p = Math.min(1, Math.max(0, window.scrollY / travel));
          setProgress(p);
          ticking = false;
        });
        ticking = true;
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [anchorTop]);

  // Validaciones
  const disabled = useMemo(() => {
    if (!idLocalidad || !checkIn || !checkOut) return true;
    if (new Date(checkOut) < new Date(checkIn)) return true;
    const g = Number(guests);
    return !(Number.isFinite(g) && g >= 1);
  }, [idLocalidad, checkIn, checkOut, guests]);

  useEffect(() => {
    if (checkIn && checkOut && new Date(checkOut) < new Date(checkIn)) {
      setCheckOut(checkIn);
    }
  }, [checkIn, checkOut]);

  // Autocomplete (debounce)
  const fetchSugs = useMemo(
    () =>
      debounce(async (q) => {
        if (!q || q.trim().length < 1) {
          setSugs([]);
          setOpenSugs(false);
          return;
        }
        try {
          const res = await fetch(
            `http://localhost:4000/localidades/search?q=${encodeURIComponent(q)}`
          );
          if (!res.ok) throw new Error("HTTP " + res.status);
          const data = await res.json();
          setSugs(Array.isArray(data) ? data : []);
          setOpenSugs(true);
          setActiveIdx(-1);
        } catch (e) {
          console.error("Autocomplete error:", e);
          setSugs([]);
          setOpenSugs(false);
        }
      }, 250),
    []
  );

  function handleLocationChange(e) {
    const val = e.target.value;
    setLocationText(val);
    setIdLocalidad("");
    fetchSugs(val);
  }
  function selectSuggestion(s) {
    setLocationText(`${s.localidad}, ${s.ciudad}, ${s.pais}`);
    setIdLocalidad(String(s.id_localidad));
    setOpenSugs(false);
  }
  function handleKeyDown(e) {
    if (!openSugs || sugs.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => (i + 1) % sugs.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => (i - 1 + sugs.length) % sugs.length);
    } else if (e.key === "Enter" && activeIdx >= 0) {
      e.preventDefault();
      selectSuggestion(sugs[activeIdx]);
    } else if (e.key === "Escape") {
      setOpenSugs(false);
    }
  }

  return (
    <>
      <div
        role="search"
        aria-label="Buscador de alojamientos"
        className="w-full"
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          // Queda centrada “sobre” el navbar con una línea amarilla arriba y abajo
          top: `${Math.max(
            anchorTop - window.scrollY,
            Math.max(0, (NAV_HEIGHT - COMPACT_HEIGHT) / 2 + NAV_OVERLAY_OFFSET)
          )}px`,
          zIndex: 100,
          background: "transparent",
          willChange: "transform, top",
          transition: "top 240ms cubic-bezier(0.22,0.61,0.36,1)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: `${
            COMPACT_HEIGHT + (NAV_HEIGHT + HERO_EXTRA_H - COMPACT_HEIGHT) * (1 - progress)
          }px`,
          paddingInline: 12, // márgenes laterales iguales
        }}
      >
        <div
          className="mx-auto"
          style={{
            transform: `scale(${1 - 0.20 * progress})`,
            transition: "transform 240ms cubic-bezier(0.22,0.61,0.36,1)",
            transformOrigin: "center center",
            // Ancho con márgenes simétricos SIEMPRE
            width: "min(1160px, calc(100% - 56px))",
          }}
        >
          <div
            className="border searchbar-panel"
            style={{
              backgroundColor: "#fff",
              borderColor: "rgba(0,0,0,0.06)",
              borderRadius: `${14 - 6 * progress}px`,
              padding: `${12 - 4 * progress}px ${14 - 4 * progress}px`,
              boxShadow:
                progress < 0.5
                  ? "0 6px 20px rgba(0,0,0,0.12)"
                  : "0 3px 12px rgba(0,0,0,0.10)",
              transition:
                "border-radius 240ms cubic-bezier(0.22,0.61,0.36,1), padding 240ms cubic-bezier(0.22,0.61,0.36,1), box-shadow 240ms cubic-bezier(0.22,0.61,0.36,1)",
              overflow: "hidden", // nada se sale del panel blanco
            }}
          >
            {/* 👉 Ajuste de los inputs date para que el ícono no sobresalga */}
            <style>{`
              .searchbar-panel input[type="date"] {
                padding-right: 10px;
                line-height: 1.2;
              }
              .searchbar-panel input[type="date"]::-webkit-calendar-picker-indicator {
                margin-right: 10px;
                opacity: 0.85;
              }
            `}</style>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "minmax(260px, 3fr) minmax(170px, 2fr) minmax(170px, 2fr) minmax(140px, 2fr) minmax(180px, 2fr) auto",
                columnGap: `${12 + 6 * (1 - progress)}px`,
                alignItems: "stretch",
                paddingInline: "6px",
              }}
            >
              {/* Ubicación */}
              <div className="relative min-w-0">
                <Field label="¿A dónde vas?" icon={<MapPinIcon />} compact={compact}>
                  <input
                    value={locationText}
                    onChange={handleLocationChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => sugs.length && setOpenSugs(true)}
                    placeholder="Localidad (ej.: Centro, Palermo...)"
                    className="w-full bg-transparent outline-none"
                    aria-label="Destino"
                  />
                </Field>
                {openSugs && sugs.length > 0 && (
                  <ul
                    className="absolute z-50 mt-1 w-full max-h-64 overflow-auto rounded-xl border border-black/10 bg-white shadow-md"
                    role="listbox"
                  >
                    {sugs.map((s, idx) => (
                      <li
                        key={s.id_localidad}
                        role="option"
                        aria-selected={activeIdx === idx}
                        className={`px-3 py-2 cursor-pointer ${activeIdx === idx ? "bg-slate-100" : ""}`}
                        onMouseDown={(e) => { e.preventDefault(); selectSuggestion(s); }}
                        onMouseEnter={() => setActiveIdx(idx)}
                      >
                        <div className="text-sm font-medium">{s.localidad}</div>
                        <div className="text-xs text-slate-600">{s.ciudad}, {s.pais}</div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Llegada */}
              <div className="min-w-0">
                <Field label="Fecha de llegada" icon={<CalendarIcon />} compact={compact}>
                  <input
                    type="date"
                    min={today}
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full bg-transparent outline-none"
                  />
                </Field>
              </div>

              {/* Salida */}
              <div className="min-w-0">
                <Field label="Fecha de salida" icon={<CalendarIcon />} compact={compact}>
                  <input
                    type="date"
                    min={checkIn || today}
                    value={checkOut}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (checkIn && new Date(v) < new Date(checkIn)) setCheckOut(checkIn);
                      else setCheckOut(v);
                    }}
                    className="w-full bg-transparent outline-none"
                  />
                </Field>
              </div>

              {/* Huéspedes */}
              <div className="min-w-0">
                <Field label="Huéspedes" icon={<UsersIcon />} compact={compact}>
                  <input
                    type="number"
                    min={1}
                    value={guests}
                    onChange={(e) => setGuests(Math.max(1, parseInt(e.target.value || "1", 10)))}
                    className="w-full bg-transparent outline-none"
                  />
                </Field>
              </div>

              {/* Precio */}
              <div className="min-w-0">
                <Field label="Precio por noche" icon={<PriceIcon />} compact={compact}>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value.replace(/\D/g, ""))}
                    className="w-full bg-transparent outline-none appearance-none"
                    placeholder="Ej: 300"
                  />
                </Field>
              </div>

              {/* Botón */}
              <div className="min-w-0 flex items-stretch">
                <SearchButton
                  onClick={() =>
                    !disabled &&
                    onSearch?.({ location: idLocalidad, checkIn, checkOut, guests, maxPrice })
                  }
                  disabled={disabled}
                  label="Buscar"
                  className={compact ? "text-sm" : "text-base"}
                  style={{
                    width: "100%",
                    borderRadius: "12px",
                    border: "none",
                    backgroundColor: "#F8C24D",
                    color: "#4B4B4B",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "background-color 0.2s ease",
                    minHeight: compact ? "44px" : "52px",
                  }}
                  onMouseEnter={(e) => (e.target.style.backgroundColor = "#f6b818")}
                  onMouseLeave={(e) => (e.target.style.backgroundColor = "#F8C24D")}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Spacer para que el contenido no salte cuando la barra está fija */}
      <div style={{ height: `${NAV_HEIGHT + (20 * (1 - progress))}px` }} />
    </>
  );
}



function Field({ label, icon, children, compact = false }) {
  return (
    <label
      className={
        "flex h-full items-center gap-2 rounded-xl border border-black/5 bg-white " +
        (compact ? "px-2.5 py-2" : "px-3 py-3")
      }
    >


      <span className="shrink-0 opacity-70" aria-hidden>
        {icon}
      </span>
      <div className="flex flex-col w-full">
        <span
          className={
            "uppercase tracking-wide opacity-60 " +
            (compact ? "text-[10px]" : "text-xs")
          }
          style={{ color: TEXT_MUTED }}
        >
          {label}
        </span>
        <div className={compact ? "text-sm" : "text-base"}>
          {children}
        </div>
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
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <text
        x="4"
        y="18"
        fontSize="16"
        fontWeight="bold"
        fill={TEXT_MUTED}
      >
        $
      </text>
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

        document.body.appendChild(messenger);
      };
    } else {
      // si ya existe, mostralo
      const messenger = document.querySelector("df-messenger");
      if (messenger) messenger.style.display = "block";
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
      {/* ...tu contenido tal cual... */}
      <section className="mx-auto max-w-7xl px-4 pt-10 pb-8">
        <h1 className="text-4xl md:text-5xl font-extrabold leading-tight" style={{ color: TEXT_DARK }}>
          Encontrá alojamientos en alquiler
        </h1>
        <p className="mt-3 text-lg max-w-2xl" style={{ color: TEXT_MUTED }}>
          Explorá los mejores lugares para hospedarte. Inspirado en experiencias de Airbnb y Booking.
        </p>
        {/* Ancla: lugar donde “descansa” la SearchBar grande */}
        <div ref={searchAnchorRef} />

        <div className="mt-6">
          <SearchBar onSearch={handleSearch} anchorRef={searchAnchorRef} />
        </div>

      </section>

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
