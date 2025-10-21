// src/pages/propiedades-filtradas.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import PropertyCard from "../components/PropertyCard";

// Colores
const PRIMARY = "#F8C24D";
const TEXT_DARK = "#0F172A";

// Mock de filtros visuales (igual que tenías)
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

          {/* Rating mín */}
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

export default function PropiedadesFiltradas() {
  const [params] = useSearchParams();
  const [filtros, setFiltros] = useState({
    fecha_inicio: params.get("fecha_inicio") || undefined,
    fecha_fin: params.get("fecha_fin") || undefined,
    id_localidad: params.get("id_localidad") || undefined,
    precio_max: params.get("precio_max") || undefined,
    huespedes: params.get("huespedes") ? Number(params.get("huespedes")) : undefined,

    // avanzados opcionales (si vinieran en la URL)
    id_tipo_propiedad: params.get("id_tipo_propiedad") || undefined,
    precio_min: params.get("precio_min") || undefined,
    estancia_min: params.get("estancia_min") || undefined,
    rating_min: params.get("rating_min") || undefined,
    amenities: params.get("amenities") || undefined,
    order_by: params.get("order_by") || undefined,
  });

  const [list, setList] = useState([]);
  const [openFilters, setOpenFilters] = useState(false);

  // Carga de resultados
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
              id_tipo_propiedad: filtros.id_tipo_propiedad,
              precio_min: filtros.precio_min,
              precio_max: filtros.precio_max,
              estancia_min: filtros.estancia_min,
              rating_min: filtros.rating_min,
              amenities: filtros.amenities,
              order_by: filtros.order_by,
            }).filter(([, v]) => v !== undefined && v !== null && String(v).trim() !== "")
          )
        );

        const url = `/api/properties/available?${qs.toString()}`;
        const res = await fetch(url, { signal: ctrl.signal });
        if (!res.ok) {
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
        if (err.name !== "AbortError") setList([]);
      }
    })();

    return () => ctrl.abort();
  }, [filtros]);

  // chips UI
  const chips = useMemo(() => {
    const out = [];
    if (filtros.fecha_inicio && filtros.fecha_fin) out.push(`Del ${filtros.fecha_inicio} al ${filtros.fecha_fin}`);
    if (filtros.huespedes) out.push(`${filtros.huespedes} huésped(es)`);
    if (filtros.id_localidad) out.push(`Localidad #${filtros.id_localidad}`);
    if (filtros.precio_max) out.push(`Hasta $${filtros.precio_max}/noche`);
    if (filtros.id_tipo_propiedad) out.push(`Tipo #${filtros.id_tipo_propiedad}`);
    return out;
  }, [filtros]);

  // Constantes para alinear el botón flotante con tu Navbar
  const NAV_H = 72;
  const NAV_PADX = 28;
  const MENU_BTN_W = 52;
  const GAP = 10;
  const RIGHT_OFFSET = NAV_PADX + MENU_BTN_W + GAP; // 90
  const FILTER_BTN_SIZE = 52;
  const NAV_Z = 200;

  return (
    <div style={{ background: PRIMARY + "20", minHeight: "100vh" }}>
      <Navbar />

      {/* Botón flotante de filtros (alineado con el menú) */}
      <button
        onClick={() => setOpenFilters(true)}
        className="flex items-center justify-center rounded-xl shadow-md hover:scale-105 active:scale-95 transition-transform"
        style={{
          position: "fixed",
          top: (NAV_H - FILTER_BTN_SIZE) / 2,
          right: RIGHT_OFFSET,
          width: FILTER_BTN_SIZE,
          height: FILTER_BTN_SIZE,
          backgroundColor: "#F8C24D",
          color: "#0F172A",
          zIndex: NAV_Z + 10,
          boxShadow: "0 10px 24px rgba(0,0,0,.16)",
        }}
        aria-label="Abrir filtros"
        title="Filtros"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
          <line x1="4" y1="8"  x2="20" y2="8"  stroke="#0F172A" strokeWidth="2" strokeLinecap="round" />
          <circle cx="10" cy="8" r="2" fill="#0F172A" />
          <line x1="4" y1="12" x2="20" y2="12" stroke="#0F172A" strokeWidth="2" strokeLinecap="round" />
          <circle cx="15" cy="12" r="2" fill="#0F172A" />
          <line x1="4" y1="16" x2="20" y2="16" stroke="#0F172A" strokeWidth="2" strokeLinecap="round" />
          <circle cx="8" cy="16" r="2" fill="#0F172A" />
        </svg>
      </button>

      {/* separador para que el contenido no quede tapado por el navbar */}
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
              <span key={i} className="px-3 py-1 rounded-full text-sm border bg-white" style={{ borderColor: "rgba(0,0,0,0.1)" }}>
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
                price={p.precio_por_noche}
                guests={p.cantidad_huespedes}
              />
            ))}
          </div>
        )}
      </main>

      <FiltersModal
        open={openFilters}
        initial={filtros}
        onClose={() => setOpenFilters(false)}
        onApply={(f) => {
          setOpenFilters(false);
          setFiltros((prev) => ({
            fecha_inicio: prev.fecha_inicio,
            fecha_fin: prev.fecha_fin,
            id_localidad: prev.id_localidad,
            huespedes: prev.huespedes,
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
