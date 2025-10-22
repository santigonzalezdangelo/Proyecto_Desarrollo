// import React, {
//   useMemo,
//   useState,
//   useEffect,
//   useLayoutEffect,
//   useRef,
// } from "react";
// import SearchButton from "./SearchButton";

// const TEXT_MUTED = "#334155";
// const NAV_HEIGHT = 72;
// const STICK_OFFSET = 6; // píxeles extra cuando queda pegada arriba

// // Alturas unificadas para TODOS los campos/botón
// const FIELD_H = 56;          // normal
// const FIELD_H_COMPACT = 44;  // compacto (cuando se achica al scrollear)

// // Helpers
// function debounce(fn, wait = 300) {
//   let t;
//   return (...args) => {
//     clearTimeout(t);
//     t = setTimeout(() => fn(...args), wait);
//   };
// }

// function Field({ label, icon, children, compact = false }) {
//   const h = compact ? FIELD_H_COMPACT : FIELD_H;
//   return (
//     <label
//       className="flex items-center gap-2 rounded-xl border border-black/5 bg-white box-border px-3"
//       style={{ height: h }}
//     >
//       <span className="shrink-0 opacity-70" aria-hidden>
//         {icon}
//       </span>

//       <div className="flex flex-col w-full overflow-hidden">
//         {/* No permitir salto de línea en la etiqueta */}
//         <span
//           className="uppercase tracking-wide opacity-60 text-[11px] whitespace-nowrap overflow-hidden text-ellipsis"
//           style={{ color: TEXT_MUTED, lineHeight: 1.1 }}
//           title={label}
//         >
//           {label}
//         </span>

//         {/* El contenido también sin wraps para que no cambie la altura */}
//         <div className="text-[14px] whitespace-nowrap overflow-hidden text-ellipsis">
//           {children}
//         </div>
//       </div>
//     </label>
//   );
// }

// function CalendarIcon() {
//   return (
//     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
//       <rect x="3" y="5" width="18" height="16" rx="2" stroke={TEXT_MUTED} strokeWidth="1.5" />
//       <path d="M16 3v4M8 3v4M3 10h18" stroke={TEXT_MUTED} strokeWidth="1.5" />
//     </svg>
//   );
// }
// function MapPinIcon() {
//   return (
//     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
//       <path d="M12 21s6-6.091 6-10.364A6 6 0 106 10.636C6 14.909 12 21 12 21z" stroke={TEXT_MUTED} strokeWidth="1.5" />
//       <circle cx="12" cy="10" r="2.2" stroke={TEXT_MUTED} strokeWidth="1.5" />
//     </svg>
//   );
// }
// function UsersIcon() {
//   return (
//     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
//       <circle cx="9" cy="8" r="3.5" stroke={TEXT_MUTED} strokeWidth="1.5" />
//       <path d="M2.5 19c0-3.038 2.962-5.5 6.5-5.5S15.5 15.962 15.5 19" stroke={TEXT_MUTED} strokeWidth="1.5" />
//       <circle cx="18" cy="10" r="2.5" stroke={TEXT_MUTED} strokeWidth="1.5" />
//       <path d="M16 19c0-1.657 1.79-3 4-3" stroke={TEXT_MUTED} strokeWidth="1.5" />
//     </svg>
//   );
// }
// function PriceIcon() {
//   return (
//     <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
//       <text x="4" y="18" fontSize="16" fontWeight="bold" fill={TEXT_MUTED}>
//         $
//       </text>
//     </svg>
//   );
// }

// export function SearchBar({ variant = "embedded", anchorRef, onSearch }) {
//   const [locationText, setLocationText] = useState("");
//   const [idLocalidad, setIdLocalidad] = useState("");
//   const [sugs, setSugs] = useState([]);
//   const [openSugs, setOpenSugs] = useState(false);
//   const [activeIdx, setActiveIdx] = useState(-1);

//   const [checkIn, setCheckIn] = useState("");
//   const [checkOut, setCheckOut] = useState("");
//   const [guests, setGuests] = useState(1);
//   const [maxPrice, setMaxPrice] = useState("");

//   const today = new Date().toISOString().slice(0, 10);

//   // --- Modo flotante (scroll) ---
//   const [anchorTop, setAnchorTop] = useState(NAV_HEIGHT + 130);
//   const [progress, setProgress] = useState(variant === "floating" ? 0 : 1);
//   const compact = progress > 0.5 || variant === "embedded";

//   // medir altura real de la barra para el espaciador en mobile
//   const barRef = useRef(null);
//   const [barH, setBarH] = useState(0);

//   useLayoutEffect(() => {
//     if (variant !== "floating") return;
//     const update = () => {
//       const el = anchorRef?.current;
//       if (!el) return;
//       const y = el.getBoundingClientRect().top + window.scrollY;
//       setAnchorTop(y);
//     };
//     update();
//     window.addEventListener("resize", update);
//     return () => window.removeEventListener("resize", update);
//   }, [anchorRef, variant]);

//   useEffect(() => {
//     if (variant !== "floating") return;
//     let ticking = false;
//     const onScroll = () => {
//       if (!ticking) {
//         requestAnimationFrame(() => {
//           const travel = Math.max(1, anchorTop);
//           const p = Math.min(1, Math.max(0, window.scrollY / travel));
//           setProgress(p);
//           ticking = false;
//         });
//         ticking = true;
//       }
//     };
//     onScroll();
//     window.addEventListener("scroll", onScroll, { passive: true });
//     return () => window.removeEventListener("scroll", onScroll);
//   }, [anchorTop, variant]);

//   // medir altura para espaciador (mobile)
//   useEffect(() => {
//     if (!barRef.current) return;

//     const update = () => setBarH(barRef.current?.offsetHeight || 0);
//     update();

//     const ro =
//       typeof ResizeObserver !== "undefined"
//         ? new ResizeObserver(update)
//         : null;
//     if (ro) ro.observe(barRef.current);

//     window.addEventListener("resize", update);
//     return () => {
//       if (ro) ro.disconnect();
//       window.removeEventListener("resize", update);
//     };
//   }, []);

//   // flags de mobile / barra flotando
//   const isMobile =
//     typeof window !== "undefined" ? window.innerWidth <= 768 : false;
//   const isFloating =
//     variant === "floating" && typeof window !== "undefined"
//       ? anchorTop - window.scrollY <= 0
//       : false;

//   // --- Validaciones ---
//   const disabled = useMemo(() => {
//     const hasLocation = Boolean(idLocalidad || (locationText && locationText.trim()));
//     if (!hasLocation || !checkIn || !checkOut) return true;
//     if (new Date(checkOut) < new Date(checkIn)) return true;
//     const g = Number(guests);
//     return !(Number.isFinite(g) && g >= 1);
//   }, [idLocalidad, locationText, checkIn, checkOut, guests]);

//   useEffect(() => {
//     if (checkIn && checkOut && new Date(checkOut) < new Date(checkIn)) setCheckOut(checkIn);
//   }, [checkIn, checkOut]);

//   // --- Autocomplete (mock/api) ---
//   const fetchSugs = useMemo(
//     () =>
//       debounce(async (q) => {
//         if (!q || q.trim().length < 1) {
//           setSugs([]);
//           setOpenSugs(false);
//           return;
//         }
//         try {
//           const res = await fetch(
//             `http://localhost:4000/localidades/search?q=${encodeURIComponent(q)}`
//           );
//           if (!res.ok) throw new Error("HTTP " + res.status);
//           const data = await res.json();
//           setSugs(Array.isArray(data) ? data : []);
//           setOpenSugs(true);
//           setActiveIdx(-1);
//         } catch {
//           setSugs([]);
//           setOpenSugs(false);
//         }
//       }, 250),
//     []
//   );

//   function handleLocationChange(e) {
//     setLocationText(e.target.value);
//     setIdLocalidad("");
//     fetchSugs(e.target.value);
//   }
//   function selectSuggestion(s) {
//     setLocationText(`${s.localidad}, ${s.ciudad}, ${s.pais}`);
//     setIdLocalidad(String(s.id_localidad));
//     setOpenSugs(false);
//   }
//   function handleKeyDown(e) {
//     if (!openSugs || sugs.length === 0) return;
//     if (e.key === "ArrowDown") {
//       e.preventDefault();
//       setActiveIdx((i) => (i + 1) % sugs.length);
//     } else if (e.key === "ArrowUp") {
//       e.preventDefault();
//       setActiveIdx((i) => (i - 1 + sugs.length) % sugs.length);
//     } else if (e.key === "Enter" && activeIdx >= 0) {
//       e.preventDefault();
//       selectSuggestion(sugs[activeIdx]);
//     } else if (e.key === "Escape") {
//       setOpenSugs(false);
//     }
//   }

//   // --- Estilos contenedores ---
//   const containerStyle =
//     variant === "floating"
//       ? {
//           position: "fixed",
//           left: 0,
//           right: 0,
//           top: `${Math.max(anchorTop - window.scrollY, 0) + STICK_OFFSET}px`,
//           zIndex: 4000, // sobre el navbar, pero debajo del botón/menú
//           background: "transparent",
//           display: "flex",
//           justifyContent: "center",
//           paddingInline: 12,
//           transition: "top 220ms cubic-bezier(0.22,0.61,0.36,1)",
//         }
//       : {
//           position: "relative",
//           zIndex: 1,
//           display: "flex",
//           justifyContent: "center",
//           paddingInline: 12,
//           marginTop: 8,
//           marginBottom: 8,
//         };

//   const frameStyle = {
//     transform: variant === "floating" ? `scale(${1 - 0.2 * progress})` : undefined,
//     transition: "transform 240ms cubic-bezier(0.22,0.61,0.36,1)",
//     transformOrigin: "center center",
//     width: "min(1160px, calc(100% - 56px))",
//   };

//   return (
//     <>
//       {/* Espaciador: SOLO en mobile y cuando la barra está fija, para no tapar el contenido */}
//       {isMobile && isFloating ? <div aria-hidden style={{ height: barH }} /> : null}

//       <div
//         ref={barRef}
//         role="search"
//         aria-label="Buscador de alojamientos"
//         className="w-full"
//         style={containerStyle}
//       >
//         <div className="mx-auto" style={frameStyle}>
//           <div
//             className="border"
//             style={{
//               backgroundColor: "#fff",
//               borderColor: "rgba(0,0,0,0.06)",
//               borderRadius: 12,
//               padding: "8px 0", // sin padding lateral para simetría exacta
//               boxShadow: "0 6px 18px rgba(0,0,0,0.10)",
//               overflow: "hidden",
//             }}
//           >
//             {/* Grilla con espaciadores laterales simétricos */}
//             <div
//               style={{
//                 display: "grid",
//                 gridTemplateColumns: "1px repeat(12, minmax(0,1fr)) 12px",
//                 columnGap: 12,
//                 rowGap: 8,
//                 alignItems: "stretch",
//               }}
//             >
//               {/* Contenido en 12 columnas */}
//               <div
//                 style={{ gridColumn: "2 / 14" }}
//                 className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-x-3 gap-y-2 items-stretch"
//               >
//                 {/* Localidad */}
//                 <div className="relative min-w-0 col-span-1 sm:col-span-2 lg:col-span-3">
//                   <Field label="¿A dónde vas?" icon={<MapPinIcon />} compact={compact}>
//                     <input
//                       value={locationText}
//                       onChange={handleLocationChange}
//                       onKeyDown={handleKeyDown}
//                       onFocus={() => sugs.length && setOpenSugs(true)}
//                       placeholder="Localidad (ej.: Centro, Palermo...)"
//                       className="w-full bg-transparent outline-none"
//                       aria-label="Destino"
//                     />
//                   </Field>
//                   {openSugs && sugs.length > 0 && (
//                     <ul
//                       className="absolute z-50 mt-1 w-full max-h-64 overflow-auto rounded-xl border border-black/10 bg-white shadow-md"
//                       role="listbox"
//                     >
//                       {sugs.map((s, idx) => (
//                         <li
//                           key={s.id_localidad}
//                           role="option"
//                           aria-selected={activeIdx === idx}
//                           className={`px-3 py-2 cursor-pointer ${
//                             activeIdx === idx ? "bg-slate-100" : ""
//                           }`}
//                           onMouseDown={(e) => {
//                             e.preventDefault();
//                             selectSuggestion(s);
//                           }}
//                           onMouseEnter={() => setActiveIdx(idx)}
//                         >
//                           <div className="text-sm font-medium">{s.localidad}</div>
//                           <div className="text-xs text-slate-600">
//                             {s.ciudad}, {s.pais}
//                           </div>
//                         </li>
//                       ))}
//                     </ul>
//                   )}
//                 </div>

//                 {/* Llegada */}
//                 <div className="min-w-0 col-span-1 sm:col-span-1 lg:col-span-2">
//                   <Field label="Fecha de llegada" icon={<CalendarIcon />} compact={compact}>
//                     <input
//                       type="date"
//                       min={today}
//                       value={checkIn}
//                       onChange={(e) => setCheckIn(e.target.value)}
//                       className="w-full bg-transparent outline-none"
//                     />
//                   </Field>
//                 </div>

//                 {/* Salida */}
//                 <div className="min-w-0 col-span-1 sm:col-span-1 lg:col-span-2">
//                   <Field label="Fecha de salida" icon={<CalendarIcon />} compact={compact}>
//                     <input
//                       type="date"
//                       min={checkIn || today}
//                       value={checkOut}
//                       onChange={(e) => {
//                         const v = e.target.value;
//                         if (checkIn && new Date(v) < new Date(checkIn)) setCheckOut(checkIn);
//                         else setCheckOut(v);
//                       }}
//                       className="w-full bg-transparent outline-none"
//                     />
//                   </Field>
//                 </div>

//                 {/* Huéspedes */}
//                 <div className="min-w-0 col-span-1 sm:col-span-1 lg:col-span-2" style={{ minWidth: 160 }}>
//                   <Field label="Huéspedes" icon={<UsersIcon />} compact={compact}>
//                     <input
//                       type="number"
//                       min={1}
//                       value={guests}
//                       onChange={(e) =>
//                         setGuests(Math.max(1, parseInt(e.target.value || "1", 10)))
//                       }
//                       className="w-full bg-transparent outline-none"
//                     />
//                   </Field>
//                 </div>

//                 {/* Precio */}
//                 <div className="min-w-0 col-span-1 sm:col-span-1 lg:col-span-2">
//                   <Field label="Precio por noche" icon={<PriceIcon />} compact={compact}>
//                     <input
//                       type="text"
//                       inputMode="numeric"
//                       pattern="[0-9]*"
//                       value={maxPrice}
//                       onChange={(e) => setMaxPrice(e.target.value.replace(/\D/g, ""))}
//                       className="w-full bg-transparent outline-none appearance-none"
//                       placeholder="Ej: 300"
//                     />
//                   </Field>
//                 </div>

//                 {/* Botón: falso Field para misma altura */}
//                 <div className="col-span-1 sm:col-span-2 lg:col-span-1 flex items-stretch">
//                   <div
//                     className="rounded-xl border border-transparent box-border w-full"
//                     style={{
//                       height: compact ? FIELD_H_COMPACT : FIELD_H,
//                       background: "transparent",
//                     }}
//                   >
//                     <SearchButton
//                       onClick={() => {
//                         if (disabled) return;
//                         const location =
//                           idLocalidad || (locationText ? locationText.trim() : "");
//                         onSearch?.({ location, checkIn, checkOut, guests, maxPrice });
//                       }}
//                       disabled={disabled}
//                       label="Buscar"
//                       className="w-full"
//                       style={{ height: "100%", width: "100%" }}
//                     />
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }

// // Export default por si lo importás como default en algún archivo
// export default SearchBar;

import React, {
  useMemo,
  useState,
  useEffect,
  useLayoutEffect,
  useRef,
} from "react";
import SearchButton from "./SearchButton";

const TEXT_MUTED = "#334155";
const NAV_HEIGHT = 72;
const STICK_OFFSET = 6;

const FIELD_H = 56;
const FIELD_H_COMPACT = 44;

function debounce(fn, wait = 300) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

function Field({ label, icon, children, compact = false }) {
  const h = compact ? FIELD_H_COMPACT : FIELD_H;
  return (
    <label
      className="flex items-center gap-2 rounded-xl border border-black/5 bg-white box-border px-3"
      style={{ height: h }}
    >
      <span className="shrink-0 opacity-70" aria-hidden>
        {icon}
      </span>
      <div className="flex flex-col w-full overflow-hidden">
        <span
          className="uppercase tracking-wide opacity-60 text-[11px] whitespace-nowrap overflow-hidden text-ellipsis"
          style={{ color: TEXT_MUTED, lineHeight: 1.1 }}
          title={label}
        >
          {label}
        </span>
        <div className="text-[14px] whitespace-nowrap overflow-hidden text-ellipsis">
          {children}
        </div>
      </div>
    </label>
  );
}

function CalendarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect
        x="3"
        y="5"
        width="18"
        height="16"
        rx="2"
        stroke={TEXT_MUTED}
        strokeWidth="1.5"
      />
      <path d="M16 3v4M8 3v4M3 10h18" stroke={TEXT_MUTED} strokeWidth="1.5" />
    </svg>
  );
}
function MapPinIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 21s6-6.091 6-10.364A6 6 0 106 10.636C6 14.909 12 21 12 21z"
        stroke={TEXT_MUTED}
        strokeWidth="1.5"
      />
      <circle cx="12" cy="10" r="2.2" stroke={TEXT_MUTED} strokeWidth="1.5" />
    </svg>
  );
}
function UsersIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="9" cy="8" r="3.5" stroke={TEXT_MUTED} strokeWidth="1.5" />
      <path
        d="M2.5 19c0-3.038 2.962-5.5 6.5-5.5S15.5 15.962 15.5 19"
        stroke={TEXT_MUTED}
        strokeWidth="1.5"
      />
      <circle cx="18" cy="10" r="2.5" stroke={TEXT_MUTED} strokeWidth="1.5" />
      <path
        d="M16 19c0-1.657 1.79-3 4-3"
        stroke={TEXT_MUTED}
        strokeWidth="1.5"
      />
    </svg>
  );
}
function PriceIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
      <text x="4" y="18" fontSize="16" fontWeight="bold" fill={TEXT_MUTED}>
        $
      </text>
    </svg>
  );
}

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

  // --- Floating desktop ---
  const [anchorTop, setAnchorTop] = useState(NAV_HEIGHT + 130);
  const [progress, setProgress] = useState(variant === "floating" ? 0 : 1);

  const barRef = useRef(null);
  const [barH, setBarH] = useState(0);

  // ====== MOBILE OVERRIDES ======
  const isMobile =
    typeof window !== "undefined"
      ? window.matchMedia("(max-width: 768px)").matches
      : false;

  // En mobile desactivamos COMPLETAMENTE el modo "floating"
  const disableFloatingOnMobile = isMobile && variant === "floating";

  // El alto compactado lo forzamos en mobile para “achatarlo”
  const compact = disableFloatingOnMobile
    ? true
    : progress > 0.5 || variant === "embedded";

  // Medición anchor SOLO si está activo el modo floating (no en mobile)
  useLayoutEffect(() => {
    if (variant !== "floating" || disableFloatingOnMobile) return;
    const update = () => {
      const el = anchorRef?.current;
      if (!el) return;
      const y = el.getBoundingClientRect().top + window.scrollY;
      setAnchorTop(y);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [anchorRef, variant, disableFloatingOnMobile]);

  // Scroll listener SOLO si está activo floating (no en mobile)
  useEffect(() => {
    if (variant !== "floating" || disableFloatingOnMobile) return;
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
  }, [anchorTop, variant, disableFloatingOnMobile]);

  // altura para el espaciador (sólo necesario cuando es fixed)
  useEffect(() => {
    if (!barRef.current) return;
    const update = () => setBarH(barRef.current?.offsetHeight || 0);
    update();
    const ro =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(update) : null;
    if (ro) ro.observe(barRef.current);
    window.addEventListener("resize", update);
    return () => {
      if (ro) ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  const isFloating =
    !disableFloatingOnMobile &&
    variant === "floating" &&
    typeof window !== "undefined"
      ? anchorTop - window.scrollY <= 0
      : false;

  // --- Validaciones ---
  const disabled = useMemo(() => {
    const hasLocation = Boolean(
      idLocalidad || (locationText && locationText.trim())
    );
    if (!hasLocation || !checkIn || !checkOut) return true;
    if (new Date(checkOut) < new Date(checkIn)) return true;
    const g = Number(guests);
    return !(Number.isFinite(g) && g >= 1);
  }, [idLocalidad, locationText, checkIn, checkOut, guests]);

  useEffect(() => {
    if (checkIn && checkOut && new Date(checkOut) < new Date(checkIn))
      setCheckOut(checkIn);
  }, [checkIn, checkOut]);

  // --- Autocomplete (mock/api) ---
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
            `http://localhost:4000/localidades/search?q=${encodeURIComponent(
              q
            )}`
          );
          if (!res.ok) throw new Error("HTTP " + res.status);
          const data = await res.json();
          setSugs(Array.isArray(data) ? data : []);
          setOpenSugs(true);
          setActiveIdx(-1);
        } catch {
          setSugs([]);
          setOpenSugs(false);
        }
      }, 250),
    []
  );

  function handleLocationChange(e) {
    setLocationText(e.target.value);
    setIdLocalidad("");
    fetchSugs(e.target.value);
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

  // ====== LAYOUT ======
  const containerStyle =
    variant === "floating" && !disableFloatingOnMobile
      ? {
          position: "fixed",
          left: 0,
          right: 0,
          top: `${Math.max(anchorTop - window.scrollY, 0) + STICK_OFFSET}px`,
          zIndex: 4000,
          background: "transparent",
          display: "flex",
          justifyContent: "center",
          paddingInline: 12,
          transition: "top 220ms cubic-bezier(0.22,0.61,0.36,1)",
        }
      : {
          // MOBILE (o variant embedded): en flujo, no sigue el scroll
          position: "relative",
          zIndex: 1,
          display: "flex",
          justifyContent: "center",
          paddingInline: 8,
          marginTop: 8,
          marginBottom: 12, // separa del título “Propiedades destacadas”
        };

  const frameStyle = disableFloatingOnMobile
    ? {
        // Más ancho en mobile y un poco más chato
        width: "min(720px, calc(100% - 24px))",
        transform: "none",
      }
    : {
        transform:
          variant === "floating" ? `scale(${1 - 0.2 * progress})` : undefined,
        transition: "transform 240ms cubic-bezier(0.22,0.61,0.36,1)",
        transformOrigin: "center center",
        width: "min(1160px, calc(100% - 56px))",
      };

  return (
    <>
      {/* Espaciador solo si está fixed (desktop). En mobile no hace falta */}
      {isMobile && !disableFloatingOnMobile && isFloating ? (
        <div aria-hidden style={{ height: barH }} />
      ) : null}

      <div
        ref={barRef}
        role="search"
        aria-label="Buscador de alojamientos"
        className="w-full"
        style={containerStyle}
      >
        <div className="mx-auto" style={frameStyle}>
          <div
            className="border"
            style={{
              backgroundColor: "#fff",
              borderColor: "rgba(0,0,0,0.06)",
              borderRadius: 18,
              padding: disableFloatingOnMobile ? "12px 0" : "8px 0",
              boxShadow: "0 6px 18px rgba(0,0,0,0.10)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1px repeat(12, minmax(0,1fr)) 12px",
                columnGap: 12,
                rowGap: 8,
                alignItems: "stretch",
              }}
            >
              <div
                style={{ gridColumn: "2 / 14" }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-x-3 gap-y-2 items-stretch"
              >
                {/* Localidad */}
                <div className="relative min-w-0 col-span-1 sm:col-span-2 lg:col-span-3">
                  <Field
                    label="¿A dónde vas?"
                    icon={<MapPinIcon />}
                    compact={compact}
                  >
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
                          className={`px-3 py-2 cursor-pointer ${
                            activeIdx === idx ? "bg-slate-100" : ""
                          }`}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            selectSuggestion(s);
                          }}
                          onMouseEnter={() => setActiveIdx(idx)}
                        >
                          <div className="text-sm font-medium">
                            {s.localidad}
                          </div>
                          <div className="text-xs text-slate-600">
                            {s.ciudad}, {s.pais}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Llegada */}
                <div className="min-w-0 col-span-1 sm:col-span-1 lg:col-span-2">
                  <Field
                    label="Fecha de llegada"
                    icon={<CalendarIcon />}
                    compact={compact}
                  >
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
                <div className="min-w-0 col-span-1 sm:col-span-1 lg:col-span-2">
                  <Field
                    label="Fecha de salida"
                    icon={<CalendarIcon />}
                    compact={compact}
                  >
                    <input
                      type="date"
                      min={checkIn || today}
                      value={checkOut}
                      onChange={(e) => {
                        const v = e.target.value;
                        if (checkIn && new Date(v) < new Date(checkIn))
                          setCheckOut(checkIn);
                        else setCheckOut(v);
                      }}
                      className="w-full bg-transparent outline-none"
                    />
                  </Field>
                </div>

                {/* Huéspedes */}
                <div
                  className="min-w-0 col-span-1 sm:col-span-1 lg:col-span-2"
                  style={{ minWidth: 160 }}
                >
                  <Field
                    label="Huéspedes"
                    icon={<UsersIcon />}
                    compact={compact}
                  >
                    <input
                      type="number"
                      min={1}
                      value={guests}
                      onChange={(e) =>
                        setGuests(
                          Math.max(1, parseInt(e.target.value || "1", 10))
                        )
                      }
                      className="w-full bg-transparent outline-none"
                    />
                  </Field>
                </div>

                {/* Precio */}
                <div className="min-w-0 col-span-1 sm:col-span-1 lg:col-span-2">
                  <Field
                    label="Precio por noche"
                    icon={<PriceIcon />}
                    compact={compact}
                  >
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={maxPrice}
                      onChange={(e) =>
                        setMaxPrice(e.target.value.replace(/\D/g, ""))
                      }
                      className="w-full bg-transparent outline-none appearance-none"
                      placeholder="Ej: 300"
                    />
                  </Field>
                </div>

                {/* Botón */}
                <div className="col-span-1 sm:col-span-2 lg:col-span-1 flex items-stretch">
                  <div
                    className="rounded-xl border border-transparent box-border w-full"
                    style={{
                      height: compact ? FIELD_H_COMPACT : FIELD_H,
                      background: "transparent",
                    }}
                  >
                    <SearchButton
                      onClick={() => {
                        if (disabled) return;
                        const location =
                          idLocalidad ||
                          (locationText ? locationText.trim() : "");
                        onSearch?.({
                          location,
                          checkIn,
                          checkOut,
                          guests,
                          maxPrice,
                        });
                      }}
                      disabled={disabled}
                      label="Buscar"
                      className="w-full"
                      style={{ height: "100%", width: "100%" }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default SearchBar;
