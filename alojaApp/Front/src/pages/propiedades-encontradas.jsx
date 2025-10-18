// src/pages/propiedades-encontradas.jsx
import React, { useEffect, useMemo, useState } from "react";
import PropertyCard from "../components/PropertyCard"; // <- tu componente
import { Link, useSearchParams } from "react-router-dom";


/* ===============================
   MOCK mientras el backend no está
   =============================== */
const MOCK = [
  {
    id_propiedad: 101,
    titulo: "LP Microcentro – Balcón y Luz",
    localidad: "Centro",
    ciudad: "La Plata",
    pais: "Argentina",
    rating: 4.8,
    imagen_url:
      "https://images.unsplash.com/photo-1505691723518-36a5ac3be353?q=80&w=1600&auto=format&fit=crop",
    precio_por_noche: 25000,
    huespedes: 3,
    tipo: "Departamento",
  },
  {
    id_propiedad: 102,
    titulo: "Depto Ideal Parejas",
    localidad: "Centro",
    ciudad: "La Plata",
    pais: "Argentina",
    rating: 4.6,
    imagen_url:
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1600&auto=format&fit=crop",
    precio_por_noche: 22000,
    huespedes: 2,
    tipo: "Departamento",
  },
  {
    id_propiedad: 103,
    titulo: "Loft luminoso",
    localidad: "Gonnet",
    ciudad: "La Plata",
    pais: "Argentina",
    rating: 4.9,
    imagen_url:
      "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?q=80&w=1600&auto=format&fit=crop",
    precio_por_noche: 28000,
    huespedes: 2,
    tipo: "Loft",
  },
];

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
function FiltersModal({ open, onClose, initial, onApply }) {
  const [local, setLocal] = useState(initial || {});
  useEffect(() => setLocal(initial || {}), [initial]);

  return (
    open && (
      <div className="fixed inset-0 z-50 grid place-items-center">
        <div className="absolute inset-0 bg-black/40" onClick={onClose} />
        <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl p-6">
          <h3 className="text-xl font-semibold mb-4" style={{ color: TEXT_DARK }}>
            Filtros
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tipo */}
            <label className="flex flex-col gap-1">
              <span className="text-sm text-slate-600">Tipo de alojamiento</span>
              <input
                value={local.tipo || ""}
                onChange={(e) => setLocal({ ...local, tipo: e.target.value })}
                placeholder="Departamento, Casa, Loft…"
                className="border rounded-lg px-3 py-2"
              />
            </label>

            {/* Precio máx por noche */}
            <label className="flex flex-col gap-1">
              <span className="text-sm text-slate-600">Precio por noche (máx)</span>
              <input
                type="number"
                min="0"
                inputMode="numeric"
                value={local.precio_max || ""}
                onChange={(e) =>
                  setLocal({ ...local, precio_max: e.target.value })
                }
                placeholder="Ej: 30000"
                className="border rounded-lg px-3 py-2"
              />
            </label>

            {/* Huéspedes (opcional: solo si querés mostrarlo) */}
            <label className="flex flex-col gap-1">
              <span className="text-sm text-slate-600">Huéspedes (opcional)</span>
              <input
                type="number"
                min="1"
                inputMode="numeric"
                value={local.huespedes || ""}
                onChange={(e) =>
                  setLocal({
                    ...local,
                    huespedes: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                placeholder="Cantidad"
                className="border rounded-lg px-3 py-2"
              />
            </label>

            {/* Localidad */}
            <label className="flex flex-col gap-1">
              <span className="text-sm text-slate-600">Localidad</span>
              <input
                value={local.localidad || ""}
                onChange={(e) => setLocal({ ...local, localidad: e.target.value })}
                placeholder="Centro, Gonnet…"
                className="border rounded-lg px-3 py-2"
              />
            </label>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border"
              style={{ background: CARD, borderColor: "rgba(0,0,0,0.1)" }}
            >
              Cancelar
            </button>
            <button
              onClick={() => onApply(local)}
              className="px-4 py-2 rounded-lg text-white"
              style={{ background: PRIMARY }}
            >
              Continuar
            </button>
          </div>
        </div>
      </div>
    )
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
  useEffect(() => {
    let cancelled = false;

    (async () => {
      /* ===============================
         AQUÍ VA TU ENDPOINT REAL:
         
      const qs = new URLSearchParams(
        Object.fromEntries(Object.entries(filtros).filter(([_,v]) => v !== undefined && v !== ""))
      );
      const res = await fetch(`http://localhost:4000/propiedades/disponibles?${qs}`);
      const data = await res.json();
      if (!cancelled) setList(data);
         =============================== */

      // MOCK (filtrado básico)
      const filtered = MOCK.filter((p) => {
        if (filtros.precio_max && p.precio_por_noche > Number(filtros.precio_max))
          return false;
        if (filtros.huespedes && p.huespedes < Number(filtros.huespedes))
          return false;
        if (filtros.id_localidad && String(filtros.id_localidad) !== "1")
          return true; // demo: no frenamos si no coincide (porque no tenemos ids reales en mock)
        if (filtros.localidad && !p.localidad?.toLowerCase().includes(String(filtros.localidad).toLowerCase()))
          return false;
        return true;
      });
      if (!cancelled) setList(filtered);
    })();

    return () => {
      cancelled = true;
    };
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
