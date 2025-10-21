// src/pages/propiedades-filtradas.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import PropertyCard from "../components/PropertyCard";

// Base de API desde .env (Front)
// VITE_API_URL=http://localhost:4000
const API_URL = import.meta.env?.VITE_API_URL || "http://localhost:4000";

// ======= UI consts (para alinear el botón filtro con tu NavBar.jsx) =======
const NAV_H = 72;          // alto del navbar
const NAV_PADX = 28;       // padding lateral interno
const MENU_BTN_W = 52;     // ancho del botón hamburguesa
const GAP = 10;            // separación entre filtro y hamburguesa
const RIGHT_OFFSET = NAV_PADX + MENU_BTN_W + GAP; // 28 + 52 + 10 = 90
const FILTER_BTN_SIZE = 52;
const TEXT_DARK = "#0F172A";
const PRIMARY = "#F8C24D";

// ----------------------- Modal de Filtros (básicos) -----------------------
function BasicFiltersModal({ open, onClose, initial, onApply }) {
  const [form, setForm] = useState({
    fecha_inicio: initial?.fecha_inicio || "",
    fecha_fin: initial?.fecha_fin || "",
    id_localidad: initial?.id_localidad || "",
    huespedes: initial?.huespedes || 1,
    precio_max: initial?.precio_max || "",
  });

  useEffect(() => {
    setForm({
      fecha_inicio: initial?.fecha_inicio || "",
      fecha_fin: initial?.fecha_fin || "",
      id_localidad: initial?.id_localidad || "",
      huespedes: initial?.huespedes || 1,
      precio_max: initial?.precio_max || "",
    });
  }, [initial]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const apply = () => {
    // Validación mínima
    if (!form.fecha_inicio || !form.fecha_fin || !form.id_localidad || !form.huespedes) {
      alert("Completá fecha de inicio, fecha de fin, localidad y huéspedes.");
      return;
    }
    onApply({
      fecha_inicio: form.fecha_inicio,
      fecha_fin: form.fecha_fin,
      id_localidad: String(form.id_localidad).trim(),
      huespedes: Number(form.huespedes),
      precio_max: String(form.precio_max).trim() || undefined,
    });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] grid place-items-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-xl p-6">
        <h3 className="text-xl font-semibold mb-4" style={{ color: TEXT_DARK }}>
          Filtros
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-sm text-slate-600">Check-in</span>
            <input
              type="date"
              name="fecha_inicio"
              value={form.fecha_inicio}
              onChange={onChange}
              className="border rounded-lg px-3 py-2"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm text-slate-600">Check-out</span>
            <input
              type="date"
              name="fecha_fin"
              value={form.fecha_fin}
              onChange={onChange}
              className="border rounded-lg px-3 py-2"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm text-slate-600">Localidad (ID)</span>
            <input
              type="number"
              min="1"
              name="id_localidad"
              value={form.id_localidad}
              onChange={onChange}
              placeholder="Ej: 1"
              className="border rounded-lg px-3 py-2"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm text-slate-600">Huéspedes</span>
            <input
              type="number"
              min="1"
              name="huespedes"
              value={form.huespedes}
              onChange={onChange}
              className="border rounded-lg px-3 py-2"
            />
          </label>

          <label className="flex flex-col gap-1 md:col-span-2">
            <span className="text-sm text-slate-600">Precio máximo por noche (opcional)</span>
            <input
              type="number"
              min="0"
              name="precio_max"
              value={form.precio_max}
              onChange={onChange}
              placeholder="Ej: 50000"
              className="border rounded-lg px-3 py-2"
            />
          </label>
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
            style={{ background: PRIMARY }}
          >
            Aplicar
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================ Página ============================
export default function PropiedadesFiltradas() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Estado de filtros inicial desde la URL
  const [filtros, setFiltros] = useState({
    fecha_inicio: searchParams.get("fecha_inicio") || "",
    fecha_fin: searchParams.get("fecha_fin") || "",
    id_localidad: searchParams.get("id_localidad") || "",
    huespedes: searchParams.get("huespedes") ? Number(searchParams.get("huespedes")) : "",
    precio_max: searchParams.get("precio_max") || "",
  });

  const [list, setList] = useState([]);
  const [openFilters, setOpenFilters] = useState(false);

  // Fetch a tu endpoint real
  useEffect(() => {
    const ctrl = new AbortController();

    (async () => {
      // Validación mínima antes de llamar
      if (!filtros.fecha_inicio || !filtros.fecha_fin || !filtros.id_localidad || !filtros.huespedes) {
        setList([]);
        return;
      }

      // Construcción de query solo con claves no vacías
      const qs = new URLSearchParams(
        Object.fromEntries(
          Object.entries({
            fecha_inicio: filtros.fecha_inicio,
            fecha_fin: filtros.fecha_fin,
            id_localidad: filtros.id_localidad,
            huespedes: filtros.huespedes,
            precio_max: filtros.precio_max || undefined,
          }).filter(([, v]) => v !== undefined && v !== null && String(v) !== "")
        )
      );

      const url = `${API_URL}/api/properties/available?${qs.toString()}`;
      try {
        const res = await fetch(url, { signal: ctrl.signal });
        if (!res.ok) {
          console.warn("Respuesta no OK:", res.status);
          setList([]);
          return;
        }
        const data = await res.json();

        // normalizar imagen_url por si viene con otro alias
        const normalized = (Array.isArray(data) ? data : []).map((p) => ({
          ...p,
          imagen_url:
            p.imagen_url ||
            p.url_foto ||
            p.foto?.nombre ||
            p.fotos?.[0]?.url_foto ||
            p.fotos?.[0]?.nombre ||
            p.foto_url,
        }));

        setList(normalized);
      } catch (e) {
        if (e.name !== "AbortError") {
          console.error("Error fetch disponibles:", e);
          setList([]);
        }
      }
    })();

    return () => ctrl.abort();
  }, [filtros]);

  // Chips visuales
  const chips = useMemo(() => {
    const out = [];
    if (filtros.fecha_inicio && filtros.fecha_fin)
      out.push(`Del ${filtros.fecha_inicio} al ${filtros.fecha_fin}`);
    if (filtros.huespedes) out.push(`${filtros.huespedes} huésped(es)`);
    if (filtros.id_localidad) out.push(`Localidad #${filtros.id_localidad}`);
    if (filtros.precio_max) out.push(`Hasta $${filtros.precio_max}/noche`);
    return out;
  }, [filtros]);

  // Sin tocar tu NavBar: botón filtro alineado a la izquierda del menú
  const FilterFab = (
    <button
      type="button"
      aria-label="Abrir filtros"
      onClick={() => setOpenFilters(true)}
      className="fixed rounded-xl shadow-md hover:scale-105 active:scale-95 transition-transform"
      style={{
        position: "fixed",
        top: (NAV_H - FILTER_BTN_SIZE) / 2, // 12px
        right: RIGHT_OFFSET,                // 90px
        width: FILTER_BTN_SIZE,
        height: FILTER_BTN_SIZE,
        backgroundColor: PRIMARY,
        color: TEXT_DARK,
        zIndex: 210,
        boxShadow: "0 10px 24px rgba(0,0,0,.16)",
      }}
    >
      {/* ícono sliders */}
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
        <line x1="4" y1="8"  x2="20" y2="8"  stroke={TEXT_DARK} strokeWidth="2" strokeLinecap="round" />
        <circle cx="10" cy="8" r="2" fill={TEXT_DARK} />
        <line x1="4" y1="12" x2="20" y2="12" stroke={TEXT_DARK} strokeWidth="2" strokeLinecap="round" />
        <circle cx="15" cy="12" r="2" fill={TEXT_DARK} />
        <line x1="4" y1="16" x2="20" y2="16" stroke={TEXT_DARK} strokeWidth="2" strokeLinecap="round" />
        <circle cx="8" cy="16" r="2" fill={TEXT_DARK} />
      </svg>
    </button>
  );

  // Para mantener la URL sincronizada
  const updateUrlFromFilters = (next) => {
    const qs = new URLSearchParams(
      Object.fromEntries(
        Object.entries(next).filter(([, v]) => v !== undefined && v !== null && String(v) !== "")
      )
    );
    setSearchParams(qs);
  };

  return (
    <div style={{ background: PRIMARY + "20", minHeight: "100vh" }}>
      <NavBar />

      {FilterFab}

      {/* Spacer para que el contenido no quede detrás del nav */}
      <div style={{ height: NAV_H }} />

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h1 className="text-2xl font-bold" style={{ color: TEXT_DARK }}>
            Propiedades filtradas
          </h1>
          <span className="text-slate-600">{list.length} resultados</span>
        </div>

        {chips.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {chips.map((t, i) => (
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

        {list.length === 0 ? (
          <p className="text-center text-slate-600 mt-10">
            No se encontraron propiedades que coincidan con los filtros seleccionados.
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((p) => (
              <PropertyCard
                key={p.id_propiedad}
                image={p.imagen_url || "https://via.placeholder.com/400x250?text=AlojaApp"}
                title={`${p.descripcion?.slice(0, 60) ?? "Propiedad"} – ${p.localidad ?? ""}`}
                subtitle={`${p.ciudad ?? ""}${p.pais ? `, ${p.pais}` : ""}`}
                rating={Number(p.rating ?? 0)}
              />
            ))}
          </div>
        )}
      </main>

      <BasicFiltersModal
        open={openFilters}
        onClose={() => setOpenFilters(false)}
        initial={filtros}
        onApply={(f) => {
          setOpenFilters(false);
          setFiltros(f);
          updateUrlFromFilters(f); // sincroniza la URL (?fecha_inicio=...&...)
        }}
      />
    </div>
  );
}
