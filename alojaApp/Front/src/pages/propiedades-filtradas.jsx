// src/pages/propiedades-filtradas.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import NavBar from "../components/NavBar";
import PropertyCard from "../components/PropertyCard";

const NAV_H = 72;               // alto de tu NavBar.jsx
const NAV_PADX = 28;            // padding interno del navbar
const MENU_BTN_W = 52;          // ancho botón hamburguesa
const GAP = 10;                 // separación entre filtros y hamburguesa
const RIGHT_OFFSET = NAV_PADX + MENU_BTN_W + GAP; // 90
const FILTER_BTN_SIZE = 52;
const PRIMARY = "#F8C24D";
const TEXT_DARK = "#0F172A";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

/* -------------------- Modal de Filtros (básicos + avanzados) -------------------- */
/* ===================== datasets locales (pueden venir de tu API) ===================== */
// Si luego tenés endpoints reales, simplemente cargás estos arrays con fetch.
const LOCALIDADES_DATA = [
  { id: 1, nombre: "La Plata" },
  { id: 2, nombre: "Gonnet" },
  { id: 3, nombre: "City Bell" },
];

const TIPOS_DATA = [
  { id: 1, nombre: "Departamento" },
  { id: 2, nombre: "Casa" },
  { id: 3, nombre: "Cabaña" },
  { id: 4, nombre: "Loft" },
];

const AMENITIES_DATA = [
  { id: 1, nombre: "WiFi" },
  { id: 2, nombre: "Piscina" },
  { id: 3, nombre: "Estacionamiento" },
  { id: 4, nombre: "Aire acondicionado" },
  { id: 5, nombre: "Calefacción" },
];

const todayISO = () => {
  const d = new Date();
  d.setHours(0,0,0,0);
  return d.toISOString().slice(0,10); // "YYYY-MM-DD"
};


/* ===================== REEMPLAZO de FiltersAdvancedModal ===================== */
function FiltersAdvancedModal({ open, onClose, initial, onApply }) {
  const [local, setLocal] = useState({
    fecha_inicio: initial?.fecha_inicio || "",
    fecha_fin: initial?.fecha_fin || "",
    id_localidad: initial?.id_localidad || "",
    localidad_display:
      (initial?.id_localidad &&
        LOCALIDADES_DATA.find(l => String(l.id) === String(initial.id_localidad))?.nombre) ||
      "",
    huespedes: initial?.huespedes || "",
    precio_max: initial?.precio_max || "",
    id_tipo_propiedad: initial?.id_tipo_propiedad || "",
    tipo_display:
      (initial?.id_tipo_propiedad &&
        TIPOS_DATA.find(t => String(t.id) === String(initial.id_tipo_propiedad))?.nombre) ||
      "",
    precio_min: initial?.precio_min || "",
    rating_min: initial?.rating_min || "",
    amenities: initial?.amenities
      ? String(initial.amenities).split(",").map(x => Number(x.trim())).filter(Boolean)
      : [],
    order_by: initial?.order_by || "",
  });

  useEffect(() => {
    setLocal(prev => ({
      ...prev,
      fecha_inicio: initial?.fecha_inicio || "",
      fecha_fin: initial?.fecha_fin || "",
      id_localidad: initial?.id_localidad || "",
      localidad_display:
        (initial?.id_localidad &&
          LOCALIDADES_DATA.find(l => String(l.id) === String(initial.id_localidad))?.nombre) ||
        "",
      huespedes: initial?.huespedes || "",
      precio_max: initial?.precio_max || "",
      id_tipo_propiedad: initial?.id_tipo_propiedad || "",
      tipo_display:
        (initial?.id_tipo_propiedad &&
          TIPOS_DATA.find(t => String(t.id) === String(initial.id_tipo_propiedad))?.nombre) ||
        "",
      precio_min: initial?.precio_min || "",
      rating_min: initial?.rating_min || "",
      amenities: initial?.amenities
        ? String(initial.amenities).split(",").map(x => Number(x.trim())).filter(Boolean)
        : [],
      order_by: initial?.order_by || "",
    }));
  }, [initial]);

  if (!open) return null;

  const selectLocalidadByName = (name) => {
    const match = LOCALIDADES_DATA.find(
      l => l.nombre.toLowerCase() === String(name).trim().toLowerCase()
    );
    setLocal(s => ({ ...s, localidad_display: name, id_localidad: match ? match.id : "" }));
  };
  const selectTipoByName = (name) => {
    const match = TIPOS_DATA.find(
      t => t.nombre.toLowerCase() === String(name).trim().toLowerCase()
    );
    setLocal(s => ({ ...s, tipo_display: name, id_tipo_propiedad: match ? match.id : "" }));
  };
  const toggleAmenity = (id) => {
    setLocal(s => {
      const set = new Set(s.amenities);
      set.has(id) ? set.delete(id) : set.add(id);
      return { ...s, amenities: Array.from(set) };
    });
  };
  const normalizeNumber = (v) => {
    if (v === "" || v === null || v === undefined) return "";
    const n = Number(v);
    return Number.isFinite(n) ? n : "";
  };

  const apply = () => {
    const min = normalizeNumber(local.precio_min);
    const max = normalizeNumber(local.precio_max);
    const start = local.fecha_inicio ? new Date(local.fecha_inicio) : null;
    const end = local.fecha_fin ? new Date(local.fecha_fin) : null;
    const today = new Date(todayISO());

    if (!local.fecha_inicio || !local.fecha_fin)
      return alert("Debe seleccionar ambas fechas.");
    if (start < today) {
    alert("La fecha de inicio no puede ser anterior a hoy.");
    return;
  }
    if (end < start)
      return alert("La fecha de fin no puede ser anterior a la fecha de inicio.");

    if (min !== "" && min < 0) return alert("El precio mínimo no puede ser negativo.");
    if (max !== "" && max < 0) return alert("El precio máximo no puede ser negativo.");
    if (min !== "" && max !== "" && min > max) return alert("El mínimo no puede ser mayor que el máximo.");
    if (local.rating_min && (local.rating_min < 1 || local.rating_min > 5))
      return alert("El rating debe estar entre 1 y 5.");

    onApply({
      fecha_inicio: local.fecha_inicio,
      fecha_fin: local.fecha_fin,
      id_localidad: local.id_localidad || undefined,
      huespedes: local.huespedes || undefined,
      precio_max: max === "" ? undefined : max,
      id_tipo_propiedad: local.id_tipo_propiedad || undefined,
      precio_min: min === "" ? undefined : min,
      rating_min: local.rating_min || undefined,
      amenities: local.amenities?.length ? local.amenities.join(",") : undefined,
      order_by: local.order_by || undefined,
    });
  };
  // Convierte a número no-negativo (o "" si el input está vacío)
const toNonNeg = (v) => {
  if (v === "" || v === null || v === undefined) return "";
  const n = Number(v);
  if (!Number.isFinite(n)) return "";
  return Math.max(0, n);
};

const handleMinChange = (e) => {
  let val = e.target.value;
  if (val === "") {
    setLocal({ ...local, precio_min: "" });
    return;
  }
  let min = toNonNeg(val);
  const max = local.precio_max === "" ? "" : toNonNeg(local.precio_max);

  // Si existe un máximo y el min lo supera, lo clamp-eamos al max
  if (max !== "" && min > max) min = max;

  setLocal({ ...local, precio_min: String(min) });
};

const handleMaxChange = (e) => {
  let val = e.target.value;
  if (val === "") {
    setLocal({ ...local, precio_max: "" });
    return;
  }
  let max = toNonNeg(val);
  const min = local.precio_min === "" ? "" : toNonNeg(local.precio_min);

  // Si existe un mínimo y el max queda por debajo, lo clamp-eamos al min
  if (min !== "" && max < min) max = min;

  setLocal({ ...local, precio_max: String(max) });
};

// Bloquea el signo "-" para evitar números negativos desde el teclado
const blockMinus = (e) => {
  if (e.key === "-") e.preventDefault();
};


  return (
    <div className="fixed inset-0 z-50 grid place-items-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      {/* Contenedor scrollable */}
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-xl p-6 max-h-[85vh] overflow-auto">
        <h3 className="text-xl font-semibold mb-4" style={{ color: "#0F172A" }}>
          Filtros
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Fechas (renombradas y con validación visual) */}
          <label className="flex flex-col gap-1">
            <span className="text-sm text-slate-600">Fecha de inicio</span>
            <input
              type="date"
              min={todayISO()}                // ⬅️ no permite fechas pasadas
              value={local.fecha_inicio}
              onChange={(e) => {
                let start = e.target.value;
                if (start && start < todayISO()) start = todayISO(); // autocorrección
                setLocal(prev => {
                  // si la fin existe y quedó antes que la nueva inicio, la alineamos
                  const finOk = prev.fecha_fin && prev.fecha_fin < start ? start : prev.fecha_fin;
                  return { ...prev, fecha_inicio: start, fecha_fin: finOk };
                });
              }}
              className="border rounded-lg px-3 py-2"
            />
          </label>


          <label className="flex flex-col gap-1">
            <span className="text-sm text-slate-600">Fecha de fin</span>
            <input
              type="date"
              min={local.fecha_inicio || todayISO()}  // ⬅️ mínimo válido
              value={local.fecha_fin}
              onChange={(e) => setLocal({ ...local, fecha_fin: e.target.value })}
              className="border rounded-lg px-3 py-2"
            />
          </label>


          {/* Localidad */}
          <label className="flex flex-col gap-1">
            <span className="text-sm text-slate-600">Localidad</span>
            <input
              list="localidades-list"
              placeholder="Ej: La Plata"
              value={local.localidad_display}
              onChange={(e) => selectLocalidadByName(e.target.value)}
              className="border rounded-lg px-3 py-2"
            />
            <datalist id="localidades-list">
              {LOCALIDADES_DATA.map(l => (
                <option key={l.id} value={l.nombre} />
              ))}
            </datalist>
          </label>

          {/* Huéspedes */}
          <label className="flex flex-col gap-1">
            <span className="text-sm text-slate-600">Huéspedes</span>
            <input
              type="number"
              min="1"
              inputMode="numeric"
              value={local.huespedes}
              onChange={(e) => setLocal({ ...local, huespedes: e.target.value })}
              className="border rounded-lg px-3 py-2"
            />
          </label>

          {/* Precios alineados */}
          {/* Precio por noche (mín) */}
            <label className="flex flex-col gap-1">
              <span className="text-sm text-slate-600">Precio por noche (mín)</span>
              <input
                type="number"
                inputMode="numeric"
                min="0"
                max={local.precio_max !== "" ? local.precio_max : undefined}
                step="1"
                value={local.precio_min}
                onChange={handleMinChange}
                onKeyDown={blockMinus}
                placeholder="Ej: 15000"
                className="border rounded-lg px-3 py-2"
              />
            </label>

            {/* Precio por noche (máx) */}
            <label className="flex flex-col gap-1">
              <span className="text-sm text-slate-600">Precio por noche (máx)</span>
              <input
                type="number"
                inputMode="numeric"
                min={local.precio_min !== "" ? local.precio_min : 0}
                step="1"
                value={local.precio_max}
                onChange={handleMaxChange}
                onKeyDown={blockMinus}
                placeholder="Ej: 50000"
                className="border rounded-lg px-3 py-2"
              />
            </label>


          {/* Tipo */}
          <label className="flex flex-col gap-1">
            <span className="text-sm text-slate-600">Tipo de propiedad</span>
            <input
              list="tipos-list"
              placeholder="Ej: Departamento"
              value={local.tipo_display}
              onChange={(e) => selectTipoByName(e.target.value)}
              className="border rounded-lg px-3 py-2"
            />
            <datalist id="tipos-list">
              {TIPOS_DATA.map(t => (
                <option key={t.id} value={t.nombre} />
              ))}
            </datalist>
          </label>

          {/* Rating */}
          <label className="flex flex-col gap-1">
            <span className="text-sm text-slate-600">Rating mínimo (1 a 5)</span>
            <input
              type="number"
              min="1"
              max="5"
              inputMode="numeric"
              placeholder="Ej: 4"
              value={local.rating_min}
              onChange={(e) => setLocal({ ...local, rating_min: e.target.value })}
              className="border rounded-lg px-3 py-2"
            />
          </label>

          {/* Amenities chips */}
          <div className="flex flex-col gap-2 md:col-span-2">
            <span className="text-sm text-slate-600">Características</span>
            <div className="flex flex-wrap gap-2">
              {AMENITIES_DATA.map(a => {
                const active = local.amenities.includes(a.id);
                return (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => toggleAmenity(a.id)}
                    className={`px-3 py-2 rounded-lg border transition
                      ${active ? "ring-2 ring-yellow-400 border-yellow-400" : "border-slate-200"}`}
                    style={{
                      background: active ? "#FFF4D0" : "#FFFFFF",
                      color: "#0F172A",
                    }}
                  >
                    {a.nombre}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Ordenar */}
          <label className="flex flex-col gap-1 md:col-span-2">
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
            Aplicar
          </button>
        </div>
      </div>
    </div>
  );
}




/* -------------------------------- Página -------------------------------- */
export default function PropiedadesFiltradas() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Inicial desde la URL (básicos) + avanzados vacíos
  const [filtros, setFiltros] = useState({
    fecha_inicio: searchParams.get("fecha_inicio") || "",
    fecha_fin: searchParams.get("fecha_fin") || "",
    id_localidad: searchParams.get("id_localidad") || "",
    huespedes: searchParams.get("huespedes")
      ? Number(searchParams.get("huespedes"))
      : "",
    precio_max: searchParams.get("precio_max") || "",
    id_tipo_propiedad: "",
    precio_min: "",
    rating_min: "",
    amenities: "",
    order_by: "",
  });

  const [list, setList] = useState([]);
  const [openFilters, setOpenFilters] = useState(false); // <-- declarado ANTES de usarlo

  // Fetch a /api/properties/available
  useEffect(() => {
    const ctrl = new AbortController();

    (async () => {
      if (!filtros.fecha_inicio || !filtros.fecha_fin || !filtros.id_localidad || !filtros.huespedes) {
        setList([]);
        return;
      }

      const qs = new URLSearchParams(
        Object.fromEntries(
          Object.entries({
            // básicos
            fecha_inicio: filtros.fecha_inicio,
            fecha_fin: filtros.fecha_fin,
            id_localidad: filtros.id_localidad,
            huespedes: filtros.huespedes,
            precio_max: filtros.precio_max,
            // avanzados opcionales
            id_tipo_propiedad: filtros.id_tipo_propiedad || undefined,
            precio_min: filtros.precio_min || undefined,
            rating_min: filtros.rating_min || undefined,
            amenities: filtros.amenities || undefined,
            order_by: filtros.order_by || undefined,
          }).filter(([, v]) => v !== undefined && v !== null && String(v) !== "")
        )
      );

      try {
        const res = await fetch(`${API_URL}/api/properties/available?${qs.toString()}`, {
          signal: ctrl.signal,
        });
        if (!res.ok) {
          setList([]);
          return;
        }
        const data = await res.json();
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
        if (e.name !== "AbortError") setList([]);
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

  // Sincroniza la URL con el estado de filtros
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

      {/* Botón de filtros (alineado con el menú) */}
      <button
        onClick={() => setOpenFilters(true)}
        className="fixed rounded-xl shadow-md hover:scale-105 active:scale-95 transition-transform"
        style={{
          position: "fixed",
          top: (NAV_H - FILTER_BTN_SIZE) / 2,
          right: RIGHT_OFFSET,
          width: FILTER_BTN_SIZE,
          height: FILTER_BTN_SIZE,
          backgroundColor: PRIMARY,
          color: TEXT_DARK,
          zIndex: 210,
          boxShadow: "0 10px 24px rgba(0,0,0,.16)",
        }}
        aria-label="Abrir filtros"
        title="Filtros"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
          <line x1="4" y1="8"  x2="20" y2="8"  stroke={TEXT_DARK} strokeWidth="2" strokeLinecap="round" />
          <circle cx="10" cy="8" r="2" fill={TEXT_DARK} />
          <line x1="4" y1="12" x2="20" y2="12" stroke={TEXT_DARK} strokeWidth="2" strokeLinecap="round" />
          <circle cx="15" cy="12" r="2" fill={TEXT_DARK} />
          <line x1="4" y1="16" x2="20" y2="16" stroke={TEXT_DARK} strokeWidth="2" strokeLinecap="round" />
          <circle cx="8" cy="16" r="2" fill={TEXT_DARK} />
        </svg>
      </button>

      {/* Spacer para que el contenido no quede debajo del navbar */}
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

      {/* Modal (DENTRO del return, usando openFilters ya declarado) */}
      <FiltersAdvancedModal
        open={openFilters}
        onClose={() => setOpenFilters(false)}
        initial={filtros}
        onApply={(f) => {
          const next = { ...filtros, ...f };
          setOpenFilters(false);
          setFiltros(next);
          updateUrlFromFilters(next);
        }}
      />
    </div>
  );
}
