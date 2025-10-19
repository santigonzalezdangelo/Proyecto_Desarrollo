// src/pages/propiedades-encontradas.jsx
import React, { useEffect, useMemo, useState } from "react";
import PropertyCard from "../components/PropertyCard"; // <- tu componente
import { Link, useSearchParams } from "react-router-dom";

// ✅ Base de la API (usa variable de entorno si existe)
const API_BASE = import.meta.env?.VITE_API_BASE || "http://localhost:4000/api";


/* ===============================
   Colores de tu app
   =============================== */
const PRIMARY = "#F8C24D";
const TEXT_DARK = "#0F172A";
const CARD = "#FFFFFF";

/* ===============================
   Navbar simple (logo + hamburguesa)
   =============================== */
function Navbar({ onOpenFilters, onHelpBounce }) {
  const [open, setOpen] = useState(false);
  return (
    <header
      className="sticky top-0 z-50 w-full border-b"
      style={{ backgroundColor: "#FFF4D0", borderColor: "rgba(0,0,0,0.08)" }}
    >
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          {/* usa tu icono Aloja */}
          <img
            src="/public/images/logo.png" /* pon aquí tu ruta real */
            alt="Aloja"
            className="w-16 h-16 object-contain"
          />
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenFilters}
            className="px-4 py-2 rounded-full text-sm font-medium border hover:opacity-90"
            style={{ background: CARD, borderColor: "rgba(0,0,0,0.1)" }}
          >
            Filtros
          </button>

          {/* Hamburguesa */}
          <div className="relative">
            <button
              onClick={() => setOpen((v) => !v)}
              aria-label="Abrir menú"
              className="w-10 h-10 grid place-items-center rounded-full border"
              style={{ background: CARD, borderColor: "rgba(0,0,0,0.1)" }}
            >
              <div className="space-y-1.5">
                <span className="block w-5 h-[2px] bg-black/70" />
                <span className="block w-5 h-[2px] bg-black/70" />
                <span className="block w-5 h-[2px] bg-black/70" />
              </div>
            </button>

            {open && (
              <div
                className="absolute right-0 mt-2 w-44 rounded-xl shadow-lg border p-2 bg-white"
                style={{ borderColor: "rgba(0,0,0,0.08)" }}
              >
                <Link
                  to="/login"
                  className="block px-3 py-2 rounded-lg hover:bg-black/5"
                >
                  Iniciar sesión / Registrarme
                </Link>
                <button
                  onClick={() => {
                    onHelpBounce?.();
                    setOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-black/5"
                >
                  Pedir ayuda
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

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
      const qs = new URLSearchParams(
        Object.fromEntries(
          Object.entries({
            fecha_inicio: filtros.fecha_inicio,
            fecha_fin: filtros.fecha_fin,
            huespedes: filtros.huespedes,
            id_localidad: filtros.id_localidad,
            precio_max: filtros.precio_max,
          }).filter(([, v]) => v !== undefined && v !== null && String(v).trim() !== "")
        )
      );

      const url = `${API_BASE}/api
      /properties/available?${qs.toString()}`;
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
    if (filtros.localidad) chips.push(`Localidad: ${filtros.localidad}`);
    if (filtros.precio_max) chips.push(`Hasta $${filtros.precio_max}/noche`);
    if (filtros.tipo) chips.push(`Tipo: ${filtros.tipo}`);
    return chips;
  }, [filtros]);

  return (
    <div style={{ background: PRIMARY + "20", minHeight: "100vh" }}>
      <Navbar
        onOpenFilters={() => setOpenFilters(true)}
        onHelpBounce={bounceHelp}
      />

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h1 className="text-2xl font-bold" style={{ color: TEXT_DARK }}>
            Propiedades encontradas
          </h1>
          <span className="text-slate-600">{list.length} resultados</span>
        </div>

        {/* Chips de filtros aplicados */}
        {filterChips.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {filterChips.map((t, i) => (
              <span
                key={i}
                className="px-3 py-1 rounded-full text-sm border bg-white"
                style={{ borderColor: "rgba(0,0,0,0.1)" }}
              >
                {t}
              </span>
            ))}
          </div>
        )}

        {/* Grid de cards usando TU PropertyCard */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {list.map((p) => (
            <PropertyCard
              key={p.id_propiedad}
              image={p.imagen_url}
              title={`${p.titulo} – ${p.localidad}`}
              subtitle={`${p.ciudad}, ${p.pais}`}
              rating={p.rating ?? 0}
            />
          ))}
        </div>
      </main>

      <FiltersModal
        open={openFilters}
        initial={filtros}
        onClose={() => setOpenFilters(false)}
        onApply={(f) => {
          setOpenFilters(false);
          setFiltros((prev) => ({ ...prev, ...f }));
          // cuando tengas backend, opcionalmente actualizás la URL:
          // const qs = new URLSearchParams({...prev, ...f});
          // window.history.replaceState({}, "", `/buscar?${qs.toString()}`);
        }}
      />
    </div>
  );
}
