import React, { useMemo, useState, useEffect, useLayoutEffect } from "react";
import SearchButton from "./SearchButton";

const TEXT_DARK = "#0F172A";
const TEXT_MUTED = "#334155";
const NAV_HEIGHT = 72;

// Ajustes para el modo flotante (Home)
const STICKY_GAP = 6;
const HERO_EXTRA_H = 20;
const COMPACT_HEIGHT = NAV_HEIGHT - STICKY_GAP * 2;
const NAV_OVERLAY_OFFSET = 0;

// Helpers
function debounce(fn, wait = 300) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), wait); };
}

function Field({ label, icon, children, compact = false }) {
  return (
    <label
      className={
        "flex h-full items-center gap-2 rounded-xl border border-black/5 bg-white " +
        (compact ? "px-2.5 py-2" : "px-3 py-3")
      }
    >
      <span className="shrink-0 opacity-70" aria-hidden>{icon}</span>
      <div className="flex flex-col w-full">
        <span
          className={"uppercase tracking-wide opacity-60 " + (compact ? "text-[10px]" : "text-xs")}
          style={{ color: TEXT_MUTED }}
        >
          {label}
        </span>
        <div className={compact ? "text-sm" : "text-base"}>{children}</div>
      </div>
    </label>
  );
}

// Íconos inline (solo este componente)
function CalendarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="5" width="18" height="16" rx="2" stroke={TEXT_MUTED} strokeWidth="1.5" />
      <path d="M16 3v4M8 3v4M3 10h18" stroke={TEXT_MUTED} strokeWidth="1.5" />
    </svg>
  );
}
function MapPinIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 21s6-6.091 6-10.364A6 6 0 106 10.636C6 14.909 12 21 12 21z" stroke={TEXT_MUTED} strokeWidth="1.5" />
      <circle cx="12" cy="10" r="2.2" stroke={TEXT_MUTED} strokeWidth="1.5" />
    </svg>
  );
}
function UsersIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="9" cy="8" r="3.5" stroke={TEXT_MUTED} strokeWidth="1.5" />
      <path d="M2.5 19c0-3.038 2.962-5.5 6.5-5.5S15.5 15.962 15.5 19" stroke={TEXT_MUTED} strokeWidth="1.5" />
      <circle cx="18" cy="10" r="2.5" stroke={TEXT_MUTED} strokeWidth="1.5" />
      <path d="M16 19c0-1.657 1.79-3 4-3" stroke={TEXT_MUTED} strokeWidth="1.5" />
    </svg>
  );
}
function PriceIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
      <text x="4" y="18" fontSize="16" fontWeight="bold" fill={TEXT_MUTED}>$</text>
    </svg>
  );
}

/**
 * Componente reusable
 * - variant: "floating" (Home) | "embedded" (otras páginas)
 */
export function SearchBar({ variant = "embedded", anchorRef, onSearch }) {
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

  // Posición/scroll solo en modo flotante
  const [anchorTop, setAnchorTop] = useState(NAV_HEIGHT + 130);
  const [progress, setProgress] = useState(variant === "floating" ? 0 : 1);
  const compact = progress > 0.5 || variant === "embedded";

  useLayoutEffect(() => {
    if (variant !== "floating") return;
    const update = () => {
      const el = anchorRef?.current;
      if (!el) return;
      const y = el.getBoundingClientRect().top + window.scrollY;
      setAnchorTop(y);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [anchorRef, variant]);

  useEffect(() => {
    if (variant !== "floating") return;
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
  }, [anchorTop, variant]);

  // Validaciones
  const disabled = useMemo(() => {
    if (!idLocalidad || !checkIn || !checkOut) return true;
    if (new Date(checkOut) < new Date(checkIn)) return true;
    const g = Number(guests);
    return !(Number.isFinite(g) && g >= 1);
  }, [idLocalidad, checkIn, checkOut, guests]);

  useEffect(() => {
    if (checkIn && checkOut && new Date(checkOut) < new Date(checkIn)) setCheckOut(checkIn);
  }, [checkIn, checkOut]);

  // Autocomplete
  const fetchSugs = useMemo(
    () =>
      debounce(async (q) => {
        if (!q || q.trim().length < 1) { setSugs([]); setOpenSugs(false); return; }
        try {
          const res = await fetch(`http://localhost:4000/localidades/search?q=${encodeURIComponent(q)}`);
          if (!res.ok) throw new Error("HTTP " + res.status);
          const data = await res.json();
          setSugs(Array.isArray(data) ? data : []);
          setOpenSugs(true);
          setActiveIdx(-1);
        } catch {
          setSugs([]); setOpenSugs(false);
        }
      }, 250),
    []
  );

  function handleLocationChange(e) { setLocationText(e.target.value); setIdLocalidad(""); fetchSugs(e.target.value); }
  function selectSuggestion(s) { setLocationText(`${s.localidad}, ${s.ciudad}, ${s.pais}`); setIdLocalidad(String(s.id_localidad)); setOpenSugs(false); }
  function handleKeyDown(e) {
    if (!openSugs || sugs.length === 0) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setActiveIdx((i) => (i + 1) % sugs.length); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActiveIdx((i) => (i - 1 + sugs.length) % sugs.length); }
    else if (e.key === "Enter" && activeIdx >= 0) { e.preventDefault(); selectSuggestion(sugs[activeIdx]); }
    else if (e.key === "Escape") { setOpenSugs(false); }
  }

  // Estilos según variante
  const containerStyle =
    variant === "floating"
      ? {
          position: "fixed",
          left: 0, right: 0,
          top: `${Math.max(
            anchorTop - window.scrollY,
            Math.max(0, (NAV_HEIGHT - COMPACT_HEIGHT) / 2 + NAV_OVERLAY_OFFSET)
          )}px`,
          zIndex: 100,
          background: "transparent",
          willChange: "transform, top",
          transition: "top 240ms cubic-bezier(0.22,0.61,0.36,1)",
          display: "flex", justifyContent: "center", alignItems: "center",
          height: `${COMPACT_HEIGHT + (NAV_HEIGHT + HERO_EXTRA_H - COMPACT_HEIGHT) * (1 - progress)}px`,
          paddingInline: 12,
        }
      : {
          position: "relative",
          zIndex: 1,
          display: "flex",
          justifyContent: "center",
          paddingInline: 12,
          marginTop: 8,
          marginBottom: 8,
        };

  const frameStyle =
    variant === "floating"
      ? {
          transform: `scale(${1 - 0.20 * progress})`,
          transition: "transform 240ms cubic-bezier(0.22,0.61,0.36,1)",
          transformOrigin: "center center",
          width: "min(1160px, calc(100% - 56px))",
        }
      : { width: "min(1160px, calc(100% - 56px))" };

  return (
    <>
      <div role="search" aria-label="Buscador de alojamientos" className="w-full" style={containerStyle}>
        <div className="mx-auto" style={frameStyle}>
          <div
            className="border searchbar-panel"
            style={{
              backgroundColor: "#fff",
              borderColor: "rgba(0,0,0,0.06)",
              borderRadius: `${14 - 6 * (variant === "floating" ? progress : 1)}px`,
              padding: `${12 - 4 * (variant === "floating" ? progress : 1)}px ${14 - 4 * (variant === "floating" ? progress : 1)}px`,
              boxShadow:
                variant === "floating" && progress < 0.5 ? "0 6px 20px rgba(0,0,0,0.12)" : "0 3px 12px rgba(0,0,0,0.10)",
              transition: "border-radius 240ms, padding 240ms, box-shadow 240ms cubic-bezier(0.22,0.61,0.36,1)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "minmax(260px, 3fr) minmax(170px, 2fr) minmax(170px, 2fr) minmax(140px, 2fr) minmax(180px, 2fr) auto",
                columnGap: `${12 + 6 * (variant === "floating" ? (1 - progress) : 0)}px`,
                alignItems: "stretch",
                paddingInline: "6px", // mismo borde izq/der dentro del panel
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
                  <ul className="absolute z-50 mt-1 w-full max-h-64 overflow-auto rounded-xl border border-black/10 bg-white shadow-md" role="listbox">
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
                  <div className="flex items-center gap-2">
                    <input type="date" min={today} value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className="w-full bg-transparent outline-none" />
                    <span style={{ width: 2 }} />
                  </div>
                </Field>
              </div>

              {/* Salida */}
              <div className="min-w-0">
                <Field label="Fecha de salida" icon={<CalendarIcon />} compact={compact}>
                  <div className="flex items-center gap-2">
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
                    <span style={{ width: 2 }} />
                  </div>
                </Field>
              </div>

              {/* Huéspedes */}
              <div className="min-w-0">
                <Field label="Huéspedes" icon={<UsersIcon />} compact={compact}>
                  <input type="number" min={1} value={guests} onChange={(e) => setGuests(Math.max(1, parseInt(e.target.value || "1", 10)))} className="w-full bg-transparent outline-none" />
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

              {/* Botón (amarillo, sin recuadro) */}
              <div className="flex items-stretch">
                <SearchButton
                  onClick={() => !disabled && onSearch?.({ location: idLocalidad, checkIn, checkOut, guests, maxPrice })}
                  disabled={disabled}
                  label="Buscar"
                  className={compact ? "text-sm" : "text-base"}
                  style={{ width: "100%", height: "100%", minHeight: compact ? "44px" : "52px" }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Spacer solo en floating */}
      {variant === "floating" && <div style={{ height: `${NAV_HEIGHT + (20 * (1 - progress))}px` }} />}
    </>
  );
}

//COMO USARLA EN OTRAS PAGINAS (ESTATICA)

//import React, { useRef } from "react";
//import { SearchBar } from "../components/SearchBar";

//export default function Listado() {
//  function handleSearch(params) {
    // navegar o filtrar
//  }

//  return (
//    <div style={{ paddingTop: "80px" }}>
//      <SearchBar variant="embedded" onSearch={handleSearch} />
//      {/* ...resto del contenido... */} 
// </div>
// );
//} 