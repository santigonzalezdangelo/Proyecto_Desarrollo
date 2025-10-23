import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../components/NavBar";
import PropertyCard from "../components/PropertyCard";

const NAV_H = 72;

const PRIMARY = "#F8C24D"; // amber principal
const PRIMARY_SOFT = "#FFF4D0"; // fondo chips
const AMBER_300 = "#FACC15"; // bordes/foco
const ORANGE_400 = "#FB923C"; // acento suave
const TEXT_DARK = "#0F172A";

const API_URL = import.meta.env.VITE_API_URL;

// ✅ Endpoints reales
const LOCALIDADES_URL = `${API_URL}/localidades/search`;
const FILTERS_URL = `${API_URL}/properties/filters`;
const AVAILABLE_URL = `${API_URL}/properties/available`;
const DESTACADAS_URL = `${API_URL}/properties/destacadas`;

const todayISO = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
};

/* ===================== Modal de filtros (se mantiene por si lo abrís desde otro lugar) ===================== */
function FiltersAdvancedModal({ open, onClose, initial, onApply, options }) {
  const { localidades, tipos, amenities } = options;

  const [local, setLocal] = useState({
    fecha_inicio: initial?.fecha_inicio || "",
    fecha_fin: initial?.fecha_fin || "",
    id_localidad: initial?.id_localidad || "",
    localidad_display:
      (initial?.id_localidad &&
        localidades.find(
          (l) => String(l.id_localidad) === String(initial.id_localidad)
        )?.nombre_localidad) ||
      "",
    huespedes: initial?.huespedes || "",
    precio_max: initial?.precio_max || "",
    id_tipo_propiedad: initial?.id_tipo_propiedad || "",
    tipo_display:
      (initial?.id_tipo_propiedad &&
        tipos.find(
          (t) =>
            String(t.id_tipo_propiedad) === String(initial.id_tipo_propiedad)
        )?.nombre) ||
      "",
    precio_min: initial?.precio_min || "",
    rating_min: initial?.rating_min || "",
    amenities: initial?.amenities
      ? String(initial.amenities)
          .split(",")
          .map((x) => Number(x.trim()))
          .filter(Boolean)
      : [],
    order_by: initial?.order_by || "",
  });

  useEffect(() => {
    setLocal((prev) => ({
      ...prev,
      fecha_inicio: initial?.fecha_inicio || "",
      fecha_fin: initial?.fecha_fin || "",
      id_localidad: initial?.id_localidad || "",
      localidad_display:
        (initial?.id_localidad &&
          localidades.find(
            (l) => String(l.id_localidad) === String(initial.id_localidad)
          )?.nombre_localidad) ||
        "",
      huespedes: initial?.huespedes || "",
      precio_max: initial?.precio_max || "",
      id_tipo_propiedad: initial?.id_tipo_propiedad || "",
      tipo_display:
        (initial?.id_tipo_propiedad &&
          tipos.find(
            (t) =>
              String(t.id_tipo_propiedad) === String(initial.id_tipo_propiedad)
          )?.nombre) ||
        "",
      precio_min: initial?.precio_min || "",
      rating_min: initial?.rating_min || "",
      amenities: initial?.amenities
        ? String(initial.amenities)
            .split(",")
            .map((x) => Number(x.trim()))
            .filter(Boolean)
        : [],
      order_by: initial?.order_by || "",
    }));
  }, [initial, localidades, tipos]);

  if (!open) return null;

  const selectLocalidadByName = (name) => {
    const match = localidades.find(
      (l) =>
        l.nombre_localidad.toLowerCase() === String(name).trim().toLowerCase()
    );
    setLocal((s) => ({
      ...s,
      localidad_display: name,
      id_localidad: match ? match.id_localidad : "",
    }));
  };
  const selectTipoByName = (name) => {
    const match = tipos.find(
      (t) => t.nombre.toLowerCase() === String(name).trim().toLowerCase()
    );
    setLocal((s) => ({
      ...s,
      tipo_display: name,
      id_tipo_propiedad: match ? match.id_tipo_propiedad : "",
    }));
  };
  const toggleAmenity = (id) => {
    setLocal((s) => {
      const set = new Set(s.amenities);
      set.has(id) ? set.delete(id) : set.add(id);
      return { ...s, amenities: Array.from(set) };
    });
  };

  const toNonNeg = (v) => {
    if (v === "" || v === null || v === undefined) return "";
    const n = Number(v);
    if (!Number.isFinite(n)) return "";
    return Math.max(0, n);
  };
  const handleMinChange = (e) => {
    let val = e.target.value;
    if (val === "") return setLocal({ ...local, precio_min: "" });
    let min = toNonNeg(val);
    const max = local.precio_max === "" ? "" : toNonNeg(local.precio_max);
    if (max !== "" && min > max) min = max;
    setLocal({ ...local, precio_min: String(min) });
  };
  const handleMaxChange = (e) => {
    let val = e.target.value;
    if (val === "") return setLocal({ ...local, precio_max: "" });
    let max = toNonNeg(val);
    const min = local.precio_min === "" ? "" : toNonNeg(local.precio_min);
    if (min !== "" && max < min) max = min;
    setLocal({ ...local, precio_max: String(max) });
  };
  const blockMinus = (e) => {
    if (e.key === "-") e.preventDefault();
  };

  const commonInput =
    "border rounded-lg px-3 py-2 bg-white outline-none focus:ring-2";
  const commonInputStyle = { borderColor: AMBER_300 };
  const focusRingStyle = { boxShadow: `0 0 0 2px ${AMBER_300}55` };

  const apply = () => {
    const start = local.fecha_inicio ? new Date(local.fecha_inicio) : null;
    const end = local.fecha_fin ? new Date(local.fecha_fin) : null;
    const today = new Date(todayISO());
    if (!local.fecha_inicio || !local.fecha_fin)
      return alert("Debe seleccionar ambas fechas.");
    if (start < today)
      return alert("La fecha de inicio no puede ser anterior a hoy.");
    if (end < start)
      return alert(
        "La fecha de fin no puede ser anterior a la fecha de inicio."
      );
    if (local.rating_min && (local.rating_min < 1 || local.rating_min > 5))
      return alert("El rating debe estar entre 1 y 5.");

    onApply({
      fecha_inicio: local.fecha_inicio,
      fecha_fin: local.fecha_fin,
      id_localidad: local.id_localidad || undefined,
      huespedes: local.huespedes || undefined,
      precio_max:
        local.precio_max === "" ? undefined : Number(local.precio_max),
      id_tipo_propiedad: local.id_tipo_propiedad || undefined,
      precio_min:
        local.precio_min === "" ? undefined : Number(local.precio_min),
      rating_min: local.rating_min || undefined,
      amenities: local.amenities?.length
        ? local.amenities.join(",")
        : undefined,
      order_by: local.order_by || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        className="relative w-full max-w-3xl bg-white rounded-2xl shadow-xl p-6 max-h-[85vh] overflow-auto border"
        style={{ borderColor: AMBER_300 }}
      >
        <h3 className="text-xl font-semibold mb-4" style={{ color: TEXT_DARK }}>
          Filtros
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Fechas */}
          <label className="flex flex-col gap-1">
            <span className="text-sm text-slate-600">Fecha de inicio</span>
            <input
              type="date"
              min={todayISO()}
              value={local.fecha_inicio}
              onChange={(e) => {
                let start = e.target.value;
                if (start && start < todayISO()) start = todayISO();
                setLocal((prev) => {
                  const finOk =
                    prev.fecha_fin && prev.fecha_fin < start
                      ? start
                      : prev.fecha_fin;
                  return { ...prev, fecha_inicio: start, fecha_fin: finOk };
                });
              }}
              className={commonInput}
              style={commonInputStyle}
              onFocus={(e) => Object.assign(e.target.style, focusRingStyle)}
              onBlur={(e) => (e.target.style.boxShadow = "none")}
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm text-slate-600">Fecha de fin</span>
            <input
              type="date"
              min={local.fecha_inicio || todayISO()}
              value={local.fecha_fin}
              onChange={(e) =>
                setLocal({ ...local, fecha_fin: e.target.value })
              }
              className={commonInput}
              style={commonInputStyle}
              onFocus={(e) => Object.assign(e.target.style, focusRingStyle)}
              onBlur={(e) => (e.target.style.boxShadow = "none")}
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
              className={commonInput}
              style={commonInputStyle}
              onFocus={(e) => Object.assign(e.target.style, focusRingStyle)}
              onBlur={(e) => (e.target.style.boxShadow = "none")}
            />
            <datalist id="localidades-list">
              {localidades.map((l) => (
                <option key={l.id_localidad} value={l.nombre_localidad} />
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
              onChange={(e) =>
                setLocal({ ...local, huespedes: e.target.value })
              }
              className={commonInput}
              style={commonInputStyle}
              onFocus={(e) => Object.assign(e.target.style, focusRingStyle)}
              onBlur={(e) => (e.target.style.boxShadow = "none")}
            />
          </label>

          {/* Precio mín y máx */}
          <label className="flex flex-col gap-1">
            <span className="text-sm text-slate-600">Precio mínimo</span>
            <input
              type="number"
              inputMode="numeric"
              min="0"
              value={local.precio_min}
              onChange={handleMinChange}
              onKeyDown={blockMinus}
              className={commonInput}
              style={commonInputStyle}
              onFocus={(e) => Object.assign(e.target.style, focusRingStyle)}
              onBlur={(e) => (e.target.style.boxShadow = "none")}
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm text-slate-600">Precio máximo</span>
            <input
              type="number"
              inputMode="numeric"
              min={local.precio_min || 0}
              value={local.precio_max}
              onChange={handleMaxChange}
              onKeyDown={blockMinus}
              className={commonInput}
              style={commonInputStyle}
              onFocus={(e) => Object.assign(e.target.style, focusRingStyle)}
              onBlur={(e) => (e.target.style.boxShadow = "none")}
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
              className={commonInput}
              style={commonInputStyle}
              onFocus={(e) => Object.assign(e.target.style, focusRingStyle)}
              onBlur={(e) => (e.target.style.boxShadow = "none")}
            />
            <datalist id="tipos-list">
              {tipos.map((t) => (
                <option key={t.id_tipo_propiedad} value={t.nombre} />
              ))}
            </datalist>
          </label>

          {/* Rating */}
          <label className="flex flex-col gap-1">
            <span className="text-sm text-slate-600">Rating mínimo (1–5)</span>
            <input
              type="number"
              min="1"
              max="5"
              value={local.rating_min}
              onChange={(e) =>
                setLocal({ ...local, rating_min: e.target.value })
              }
              className={commonInput}
              style={commonInputStyle}
              onFocus={(e) => Object.assign(e.target.style, focusRingStyle)}
              onBlur={(e) => (e.target.style.boxShadow = "none")}
            />
          </label>

          {/* Amenities */}
          <div className="flex flex-col gap-2 md:col-span-2">
            <span className="text-sm text-slate-600">Características</span>
            <div className="flex flex-wrap gap-2">
              {amenities.map((a) => {
                const active = local.amenities.includes(a.id_caracteristica);
                return (
                  <button
                    key={a.id_caracteristica}
                    type="button"
                    onClick={() => toggleAmenity(a.id_caracteristica)}
                    className={`px-3 py-2 rounded-lg border transition ${
                      active ? "ring-2" : ""
                    }`}
                    style={{
                      borderColor: AMBER_300,
                      background: active ? PRIMARY_SOFT : "#FFFFFF",
                    }}
                  >
                    {a.nombre_caracteristica}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Orden */}
          <label className="flex flex-col gap-1 md:col-span-2">
            <span className="text-sm text-slate-600">Ordenar por</span>
            <select
              value={local.order_by}
              onChange={(e) => setLocal({ ...local, order_by: e.target.value })}
              className={commonInput}
              style={commonInputStyle}
              onFocus={(e) => Object.assign(e.target.style, focusRingStyle)}
              onBlur={(e) => (e.target.style.boxShadow = "none")}
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
            style={{ background: "#FFFFFF", borderColor: AMBER_300 }}
          >
            Cancelar
          </button>
          <button
            onClick={apply}
            className="px-4 py-2 rounded-lg text-white"
            style={{
              background: PRIMARY,
              boxShadow: "0 6px 18px rgba(248,194,77,.35)",
            }}
          >
            Aplicar
          </button>
        </div>
      </div>
    </div>
  );
}

/* ===================== Página principal ===================== */
export default function PropiedadesFiltradas() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [localidades, setLocalidades] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [amenities, setAmenities] = useState([]);
  const [list, setList] = useState([]);
  const [destacadas, setDestacadas] = useState([]);
  const [openFilters, setOpenFilters] = useState(false); // queda para uso futuro

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

  // Filtros base
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(FILTERS_URL);
        if (!res.ok) throw new Error("Error filtros");
        const data = await res.json();
        setTipos(data.tipos_propiedad || []);
        setAmenities(data.caracteristicas || []);
      } catch (e) {
        console.error(e);
        setTipos([]);
        setAmenities([]);
      }
    })();
  }, []);

  // Localidades
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${LOCALIDADES_URL}?q=`);
        if (res.ok) setLocalidades(await res.json());
      } catch (err) {
        console.error(err);
        setLocalidades([]);
      }
    })();
  }, []);

  // Resultados
  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      if (
        !filtros.fecha_inicio ||
        !filtros.fecha_fin ||
        !filtros.id_localidad ||
        !filtros.huespedes
      ) {
        setList([]);
        return;
      }
      const qs = new URLSearchParams(
        Object.entries(filtros).filter(([, v]) => v !== "" && v != null)
      );
      try {
        const res = await fetch(`${AVAILABLE_URL}?${qs.toString()}`, {
          signal: ctrl.signal,
        });
        const data = res.ok ? await res.json() : [];
        setList(Array.isArray(data) ? data : []);
      } catch (e) {
        if (e.name !== "AbortError") setList([]);
      }
    })();
    return () => ctrl.abort();
  }, [filtros]);

  // Destacadas
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(DESTACADAS_URL);
        if (res.ok) setDestacadas(await res.json());
      } catch {
        setDestacadas([]);
      }
    })();
  }, []);

  // Chips
  const chips = useMemo(() => {
    const out = [];
    if (filtros.fecha_inicio && filtros.fecha_fin)
      out.push(`Del ${filtros.fecha_inicio} al ${filtros.fecha_fin}`);
    if (filtros.huespedes) out.push(`${filtros.huespedes} huésped(es)`);
    if (filtros.id_localidad) {
      const loc = localidades.find(
        (l) => String(l.id_localidad) === String(filtros.id_localidad)
      );
      out.push(
        loc
          ? `Localidad: ${loc.nombre_localidad}`
          : `Localidad #${filtros.id_localidad}`
      );
    }
    if (filtros.precio_max) out.push(`Hasta $${filtros.precio_max}/noche`);
    return out;
  }, [filtros, localidades]);

  return (
    <div className="relative min-h-screen">
      {/* Fondo amarillo difuminado */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background: `
            radial-gradient(1200px 600px at 12% 10%, ${PRIMARY}55, transparent 60%),
            radial-gradient(900px 500px at 88% 30%, ${ORANGE_400}40, transparent 60%),
            linear-gradient(180deg, #FFF9E9 0%, #FCE9B9 60%, #FADB86 100%)
          `,
        }}
      />

      <Navbar />
      <div style={{ height: NAV_H }} />

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold" style={{ color: TEXT_DARK }}>
            Propiedades filtradas
          </h1>
          <span className="text-slate-700">{list.length} resultados</span>
        </div>

        {chips.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {chips.map((t, i) => (
              <span
                key={i}
                className="px-3 py-1 rounded-full text-sm border"
                style={{
                  background: PRIMARY_SOFT,
                  borderColor: AMBER_300,
                  color: TEXT_DARK,
                  boxShadow: "0 2px 10px rgba(248,194,77,.18)",
                }}
              >
                {t}
              </span>
            ))}
          </div>
        )}

        {list.length === 0 ? (
          destacadas.length > 0 ? (
            <>
              <p className="text-center text-slate-700 mt-10 mb-4">
                No se encontraron resultados, pero te mostramos propiedades
                destacadas:
              </p>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {destacadas.map((p) => (
                  <PropertyCard
                    key={p.id_propiedad}
                    image={
                      p.imagen_url ||
                      "https://via.placeholder.com/400x250?text=AlojaApp"
                    }
                    title={`${p.descripcion?.slice(0, 60) ?? "Propiedad"} – ${
                      p.localidad ?? ""
                    }`}
                    subtitle={`${p.ciudad ?? ""}${p.pais ? `, ${p.pais}` : ""}`}
                    rating={Number(p.rating ?? 0)}
                    onClick={() =>
                      window.location.assign(`/reserva?id=${p.id_propiedad}`)
                    } // 👈 esta línea
                  />
                ))}
              </div>
            </>
          ) : (
            <p className="text-center text-slate-700 mt-10">
              No se encontraron propiedades que coincidan con los filtros
              seleccionados.
            </p>
          )
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((p) => (
              <PropertyCard
                key={p.id_propiedad}
                image={
                  p.imagen_url ||
                  "https://via.placeholder.com/400x250?text=AlojaApp"
                }
                title={`${p.descripcion?.slice(0, 60) ?? "Propiedad"} – ${
                  p.localidad ?? ""
                }`}
                subtitle={`${p.ciudad ?? ""}${p.pais ? `, ${p.pais}` : ""}`}
                rating={Number(p.rating ?? 0)}
                onClick={() =>
                  window.location.assign(`/reserva?id=${p.id_propiedad}`)
                } // 👈 esta línea
              />
            ))}
          </div>
        )}
      </main>

      {/* Modal se conserva, pero no hay botón aquí para abrirlo */}
      <FiltersAdvancedModal
        open={openFilters}
        onClose={() => setOpenFilters(false)}
        initial={filtros}
        options={{ localidades, tipos, amenities }}
        onApply={(f) => {
          const next = { ...filtros, ...f };
          setOpenFilters(false);
          setFiltros(next);
          const qs = new URLSearchParams(
            Object.entries(next).filter(([, v]) => v !== "" && v != null)
          );
          setSearchParams(qs);
        }}
      />
    </div>
  );
}
