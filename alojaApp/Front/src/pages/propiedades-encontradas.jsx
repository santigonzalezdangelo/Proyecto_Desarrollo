// src/pages/propiedades-encontradas.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import PropertyCard from "../components/PropertyCard";


// ✅ Base de la API (usa variable de entorno si existe)
console.log("[VITE] VITE_API_BASE =", import.meta.env?.VITE_API_BASE);



/* ===============================
   Colores de tu app
   =============================== */
const PRIMARY = "#F8C24D";
const TEXT_DARK = "#0F172A";
const CARD = "#FFFFFF";

/* ===============================
   Navbar simple (logo + hamburguesa)
   =============================== */


/* ===============================
   Modal de filtros (UI sola)
   =============================== */
// Opciones mock (hasta que tengas endpoints meta)
const TIPOS_MOCK = [
  { id: 1, nombre: "Departamento" },
  { id: 2, nombre: "Casa" },
  { id: 3, nombre: "Cabaña" },
  { id: 4, nombre: "Loft" },
];

const AMENITIES_MOCK = [
  { id: 1, nombre: "WiFi" },
  { id: 2, nombre: "Piscina" },
  { id: 3, nombre: "Estacionamiento" },
  { id: 4, nombre: "Aire acondicionado" },
  { id: 5, nombre: "Calefacción" },
];


function FiltersModal({ open, onClose, initial, onApply }) {
  const [local, setLocal] = useState(() => ({
    // distintos al Home
    tipo: initial?.tipo ?? "",                 // id tipo_propiedad
    precio_min: initial?.precio_min ?? "",
    precio_max: initial?.precio_max ?? "",
    estancia_min: initial?.estancia_min ?? "",
    rating_min: initial?.rating_min ?? "",     // si más adelante calculás rating
    amenities: Array.isArray(initial?.amenities) 
      ? initial.amenities 
      : (typeof initial?.amenities === "string" ? initial.amenities.split(",").map(Number) : []),
    solo_con_fotos: !!initial?.solo_con_fotos, // boolean
    order_by: initial?.order_by ?? "",         // "precio_asc" | "precio_desc" | "rating_desc"
  }));

  useEffect(() => {
    setLocal((prev) => ({
      ...prev,
      tipo: initial?.tipo ?? "",
      precio_min: initial?.precio_min ?? "",
      precio_max: initial?.precio_max ?? "",
      estancia_min: initial?.estancia_min ?? "",
      rating_min: initial?.rating_min ?? "",
      amenities: Array.isArray(initial?.amenities) 
        ? initial.amenities 
        : (typeof initial?.amenities === "string" ? initial.amenities.split(",").map(Number) : []),
      solo_con_fotos: !!initial?.solo_con_fotos,
      order_by: initial?.order_by ?? "",
    }));
  }, [initial]);

  const toggleAmenity = (id) => {
    setLocal((prev) => {
      const set = new Set(prev.amenities || []);
      if (set.has(id)) set.delete(id);
      else set.add(id);
      return { ...prev, amenities: Array.from(set) };
    });
  };

  const apply = () => {
    onApply({
      ...local,
      // normalizamos para la query string (vacíos -> undefined; amenities CSV)
      tipo: local.tipo || undefined,
      precio_min: local.precio_min || undefined,
      precio_max: local.precio_max || undefined,
      estancia_min: local.estancia_min || undefined,
      rating_min: local.rating_min || undefined,
      amenities:
        local.amenities && local.amenities.length ? local.amenities.join(",") : undefined,
      solo_con_fotos: local.solo_con_fotos ? "1" : undefined,
      order_by: local.order_by || undefined,
    });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-xl p-6">
        <h3 className="text-xl font-semibold mb-4" style={{ color: "#0F172A" }}>
          Filtros avanzados
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Tipo */}
          <label className="flex flex-col gap-1">
            <span className="text-sm text-slate-600">Tipo de propiedad</span>
            <select
              value={local.tipo}
              onChange={(e) => setLocal({ ...local, tipo: e.target.value })}
              className="border rounded-lg px-3 py-2 bg-white"
            >
              <option value="">Cualquiera</option>
              {TIPOS_MOCK.map((t) => (
                <option key={t.id} value={t.id}>{t.nombre}</option>
              ))}
            </select>
          </label>

          {/* Precio mín */}
          <label className="flex flex-col gap-1">
            <span className="text-sm text-slate-600">Precio por noche (mín)</span>
            <input
              type="number"
              min="0"
              inputMode="numeric"
              value={local.precio_min}
              onChange={(e) => setLocal({ ...local, precio_min: e.target.value })}
              placeholder="Ej: 15000"
              className="border rounded-lg px-3 py-2"
            />
          </label>

          {/* Precio máx */}
          <label className="flex flex-col gap-1">
            <span className="text-sm text-slate-600">Precio por noche (máx)</span>
            <input
              type="number"
              min="0"
              inputMode="numeric"
              value={local.precio_max}
              onChange={(e) => setLocal({ ...local, precio_max: e.target.value })}
              placeholder="Ej: 50000"
              className="border rounded-lg px-3 py-2"
            />
          </label>

          {/* Estancia mínima */}
          <label className="flex flex-col gap-1">
            <span className="text-sm text-slate-600">Estancia mínima (noches)</span>
            <input
              type="number"
              min="1"
              inputMode="numeric"
              value={local.estancia_min}
              onChange={(e) => setLocal({ ...local, estancia_min: e.target.value })}
              placeholder="Ej: 2"
              className="border rounded-lg px-3 py-2"
            />
          </label>

          {/* Rating mín (si lo usás más adelante) */}
          <label className="flex flex-col gap-1">
            <span className="text-sm text-slate-600">Calificación mínima</span>
            <input
              type="number"
              min="1"
              max="5"
              inputMode="numeric"
              value={local.rating_min}
              onChange={(e) => setLocal({ ...local, rating_min: e.target.value })}
              placeholder="Ej: 4"
              className="border rounded-lg px-3 py-2"
            />
          </label>

          {/* Solo con fotos */}
          <label className="flex items-center gap-2 mt-7">
            <input
              type="checkbox"
              checked={!!local.solo_con_fotos}
              onChange={(e) => setLocal({ ...local, solo_con_fotos: e.target.checked })}
            />
            <span className="text-sm">Mostrar solo propiedades con fotos</span>
          </label>

          {/* Orden */}
          <label className="flex flex-col gap-1">
            <span className="text-sm text-slate-600">Ordenar por</span>
            <select
              value={local.order_by}
              onChange={(e) => setLocal({ ...local, order_by: e.target.value })}
              className="border rounded-lg px-3 py-2 bg-white"
            >
              <option value="">Relevancia</option>
              <option value="precio_asc">Precio: más bajo primero</option>
              <option value="precio_desc">Precio: más alto primero</option>
              <option value="rating_desc">Mejor calificación</option>
            </select>
          </label>
        </div>

        {/* Amenities */}
        <div className="mt-5">
          <span className="block text-sm text-slate-600 mb-2">Características</span>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {AMENITIES_MOCK.map((a) => {
              const checked = (local.amenities || []).includes(a.id);
              return (
                <label
                  key={a.id}
                  className="flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer hover:bg-black/5"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleAmenity(a.id)}
                  />
                  <span className="text-sm">{a.nombre}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border"
            style={{ background: "#FFFFFF", borderColor: "rgba(0,0,0,0.1)" }}
          >
            Cancelar
          </button>
          <button
            onClick={apply}
            className="px-4 py-2 rounded-lg text-white"
            style={{ background: "#F8C24D" }}
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
}

function FilterFab({ onClick }) {
  const TEXT_DARK = "#0F172A";
  return (
    <button
      type="button"
      aria-label="Abrir filtros"
      onClick={onClick}
      className="fixed rounded-xl shadow-lg hover:scale-105 transition-transform"
      style={{
        // alineado con tu navbar sin modificarlo
        top: 10,              // distancia desde arriba (navbar ~72px de alto → este valor se ve bien)
        right: 24,
           // margen derecho
        width: 52,
        height: 52,
        backgroundColor: "#EABA4B",
        color: TEXT_DARK,
        zIndex: 9999,         // por encima del navbar
      }}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
        {/* Ícono de filtros (3 sliders) */}
        <line x1="4" y1="5" x2="20" y2="5" stroke={TEXT_DARK} strokeWidth="2" strokeLinecap="round" />
        <circle cx="10" cy="5" r="2" fill={TEXT_DARK} />
        <line x1="4" y1="12" x2="20" y2="12" stroke={TEXT_DARK} strokeWidth="2" strokeLinecap="round" />
        <circle cx="16" cy="12" r="2" fill={TEXT_DARK} />
        <line x1="4" y1="19" x2="20" y2="19" stroke={TEXT_DARK} strokeWidth="2" strokeLinecap="round" />
        <circle cx="8" cy="19" r="2" fill={TEXT_DARK} />
      </svg>
    </button>
  );
}


/* ===============================
   Página
   =============================== */
export default function PropiedadesEncontradas() {
  const [params] = useSearchParams();
  const [filtros, setFiltros] = useState({
    // se rellenan desde la URL si existen
    fecha_inicio: params.get("fecha_inicio") || undefined,
    fecha_fin: params.get("fecha_fin") || undefined,
    id_localidad: params.get("id_localidad") || undefined,
    precio_max: params.get("precio_max") || undefined,
    huespedes: params.get("huespedes")
      ? Number(params.get("huespedes"))
      : undefined,
  });
  const [list, setList] = useState([]);
  const [openFilters, setOpenFilters] = useState(false);

  // ===== Chatbox siempre visible + estilos + rebote doble
// ==== Chat Dialogflow: montar + animación abrir/cerrar (slide up/down) ====
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


  // función que hace rebotar el chat
  const bounceHelp = () => {
    const df = document.querySelector("df-messenger");
    if (!df) return;
    df.classList.remove("aloja-bounce");
    // reflow para reiniciar animación
    // eslint-disable-next-line no-unused-expressions
    df.offsetWidth;
    df.classList.add("aloja-bounce");
  };

  // cargar lista (mock por ahora)
// cargar lista desde el backend (con fallback al MOCK si falla)
useEffect(() => {
  const ctrl = new AbortController();

  (async () => {
    try {
      // Armamos solo con claves definidas/no vacías
      const qs = new URLSearchParams(
        Object.fromEntries(
          Object.entries({
            // básicos
            fecha_inicio: filtros.fecha_inicio,
            fecha_fin: filtros.fecha_fin,
            huespedes: filtros.huespedes,
            id_localidad: filtros.id_localidad,
            // avanzados (solo los que hoy existen en tu UI)
            id_tipo_propiedad: filtros.id_tipo_propiedad,
            precio_min: filtros.precio_min,
            precio_max: filtros.precio_max,
            estancia_min: filtros.estancia_min,
            rating_min: filtros.rating_min,
            amenities: filtros.amenities, // CSV
            order_by: filtros.order_by,
          }).filter(([, v]) => v !== undefined && v !== null && String(v).trim() !== "")
        )
      );

      const url = `/api/properties/available?${qs.toString()}`;
      console.log("[FETCH] URL =>", url);
      console.log("[FETCH] filtros =>", Object.fromEntries(qs));

      const res = await fetch(url, { signal: ctrl.signal });
      if (!res.ok) {
        console.warn("[propiedades] Respuesta no OK:", res.status);
        setList([]);
        return;
      }

      const data = await res.json();

      const normalizados = (Array.isArray(data) ? data : []).map((p) => ({
        ...p,
        imagen_url:
          p.imagen_url ||
          p.url_foto ||
          p.foto?.nombre ||
          p.fotos?.[0]?.url_foto ||
          p.fotos?.[0]?.nombre ||
          p.foto_url,
      }));

      setList(normalizados);
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error("[propiedades] Error fetch:", err);
        setList([]);
      }
    }
  })();

  return () => ctrl.abort();
}, [filtros]);



  // chips de filtros (solo si existen → NO aparece “1 huéspedes” por defecto)
  const filterChips = useMemo(() => {
    const chips = [];
    if (filtros.fecha_inicio && filtros.fecha_fin)
      chips.push(`Del ${filtros.fecha_inicio} al ${filtros.fecha_fin}`);
    if (filtros.huespedes) chips.push(`${filtros.huespedes} huésped(es)`);
    if (filtros.id_localidad) chips.push(`Localidad #${filtros.id_localidad}`);
    if (filtros.precio_max) chips.push(`Hasta $${filtros.precio_max}/noche`);
    if (filtros.id_tipo_propiedad) chips.push(`Tipo #${filtros.id_tipo_propiedad}`);
    return chips;
  }, [filtros]);

  // arriba del return, define estas constantes (para que sea fácil ajustar)
const NAV_H = 72;         // alto del Navbar (tu Navbar.jsx usa 72)
const NAV_PADX = 28;      // padding lateral interno del navbar
const MENU_BTN_W = 52;    // ancho del botón hamburguesa
const GAP = 10;           // separación entre el botón filtros y el hamburguesa
const RIGHT_OFFSET = NAV_PADX + MENU_BTN_W + GAP; // 28 + 52 + 10 = 90
const FILTER_BTN_SIZE = 52; // px
const NAV_Z = 200;        // igual que el Navbar

  return (
  <div style={{ background: PRIMARY + "20", minHeight: "100vh" }}>
    {/* Navbar fijo */}
    <Navbar />

    {/* BOTÓN DE FILTROS FIJO (a la izquierda del menú) */}
{/* BOTÓN DE FILTROS FIJO (alineado con el menú) */}
{/* BOTÓN DE FILTROS FIJO (alineado con el menú) */}
<button
  onClick={() => setOpenFilters(true)}
  className="flex items-center justify-center rounded-xl shadow-md hover:scale-105 active:scale-95 transition-transform"
  style={{
    position: "fixed",
    // centrado vertical perfecto: (alto navbar - alto botón) / 2
    top: (NAV_H - FILTER_BTN_SIZE) / 2,      // 72 - 48 = 12
    // a la izquierda del hamburguesa: padding der del navbar + ancho botón menú + gap
    right: RIGHT_OFFSET,                     // 28 + 52 + 10 = 90
    width: FILTER_BTN_SIZE,                  // 52 (o ponelo en 52 si lo querés igual al menú)
    height: FILTER_BTN_SIZE,
    backgroundColor: "#F8C24D",
    color: "#0F172A",
    zIndex: NAV_Z + 10,                      // 210 (encima del navbar)
    boxShadow: "0 10px 24px rgba(0,0,0,.16)",
  }}
  aria-label="Abrir filtros"
  title="Filtros"
>
  {/* Ícono filtros */}
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
    <line x1="4" y1="8"  x2="20" y2="8"  stroke="#0F172A" strokeWidth="2" strokeLinecap="round" />
    <circle cx="10" cy="8" r="2" fill="#0F172A" />
    <line x1="4" y1="12" x2="20" y2="12" stroke="#0F172A" strokeWidth="2" strokeLinecap="round" />
    <circle cx="15" cy="12" r="2" fill="#0F172A" />
    <line x1="4" y1="16" x2="20" y2="16" stroke="#0F172A" strokeWidth="2" strokeLinecap="round" />
    <circle cx="8" cy="16" r="2" fill="#0F172A" />
  </svg>
</button>



    {/* SPACER para que el contenido no quede debajo del navbar */}
    <div style={{ height: NAV_H }} />

    {/* ...tu <main> y resto de la página */}
    <main className="max-w-7xl mx-auto px-4 py-6">
  {list.length === 0 ? (
    <p className="text-center text-slate-600 mt-10">
      No se encontraron propiedades que coincidan con los filtros seleccionados.
    </p>
  ) : (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {list.map((p) => (
        <PropertyCard
          key={p.id_propiedad}
          image={
            p.imagen_url ||
            "https://via.placeholder.com/400x250?text=AlojaApp"
          }
          title={`${p.descripcion?.slice(0, 60) ?? "Propiedad"} – ${p.localidad ?? ""}`}
          subtitle={`${p.ciudad ?? ""}${p.pais ? `, ${p.pais}` : ""}`}
          rating={Number(p.rating ?? 0)}
          price={p.precio_por_noche}
          guests={p.cantidad_huespedes}
        />
      ))}
    </div>
  )}
</main>


    {/* Tu modal de filtros usa setOpenFilters(true/false) como ya tenías */}
    <FiltersModal
      open={openFilters}
      initial={filtros}
      onClose={() => setOpenFilters(false)}
onApply={(f) => {
  setOpenFilters(false);

  // Logueamos lo que viene del modal
  console.log("[FiltersModal] onApply ->", f);

  // Actualizamos el estado de filtros que usa el fetch
  setFiltros((prev) => ({
        // básicos (los preservo)
        fecha_inicio: prev.fecha_inicio,
        fecha_fin: prev.fecha_fin,
        id_localidad: prev.id_localidad,
        huespedes: prev.huespedes,

        // avanzados (vienen del modal)
        id_tipo_propiedad: f.tipo || undefined,
        precio_min: f.precio_min || undefined,
        precio_max: f.precio_max || undefined,
        estancia_min: f.estancia_min || undefined,
        rating_min: f.rating_min || undefined,
        amenities:
          Array.isArray(f.amenities) && f.amenities.length
            ? f.amenities.join(",")
            : (typeof f.amenities === "string" ? f.amenities : undefined),
        order_by: f.order_by || undefined,
      }));
    }}
    />
  </div>
);

}
