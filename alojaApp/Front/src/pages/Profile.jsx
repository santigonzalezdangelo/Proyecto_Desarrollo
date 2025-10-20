/* 
import { useAuth0 } from "@auth0/auth0-react";

export default function Profile() {
  const { user } = useAuth0();
  if (!user) return null;
  return (
    <div style={{ width: "80%", margin: "0 auto" }}>
      <h1>Perfil</h1>
      <img src={user.picture} alt={user.name} width={64} height={64} />
      <p>{user.name}</p>
      <p>{user.email}</p>
    </div>
  );
}
*/

// src/pages/Profile.jsx
// ------------------------------------------------------------
// Página de Perfil (mockeada) para AlojaApp
// - Estética alineada al Home/NavBar (amarillo #F8C24D)
// - Carga mock desde /public/mock/user_profile.json (si no existe, usa FALLBACK)
// - Permite editar campos salvo el correo (correo bloqueado)
// - Deja escrita (comentada) la conexión real a la API
// ------------------------------------------------------------

import React, { useEffect, useMemo, useState } from "react";
import Navbar from "../components/NavBar";

// ====== Tema / tokens (alineado con Home.jsx) ======
const PRIMARY = "#F8C24D";
const TEXT_DARK = "#0F172A";
const TEXT_MUTED = "#334155";
const PAGE_BG = PRIMARY; // fondo general
const NAV_HEIGHT = 72;   // alto navbar

// ====== Endpoints (mock + real comentado) ======
const MOCK_URL = "/mock/user_profile.json"; // poné este JSON en public/mock/
// const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";
// const PROFILE_URL = `${API_BASE}/usuarios/me`;

// ====== Utilidades ======
function classNames(...xs) { return xs.filter(Boolean).join(" "); }
function maskCBU(cbu = "") {
  if (!cbu) return "";
  const s = String(cbu).replace(/\D/g, "");
  if (s.length <= 6) return s;
  return `${s.slice(0, 3)}-${s.slice(3, 6)} •••• •••• •••• ${s.slice(-3)}`;
}
function onlyDigits(x = "") { return String(x).replace(/\D/g, ""); }
function initialsOf(name = "", last = "") {
  const a = (name?.[0] || "").toUpperCase();
  const b = (last?.[0] || "").toUpperCase();
  return `${a}${b}` || "U";
}

function validate(values) {
  const errs = {};
  if (!values.nombre?.trim()) errs.nombre = "Requerido";
  if (!values.apellido?.trim()) errs.apellido = "Requerido";
  if (!values.dni?.trim()) errs.dni = "Requerido";
  if (values.dni && !/^\d{6,10}$/.test(onlyDigits(values.dni))) errs.dni = "DNI inválido";
  if (!values.correo?.trim()) errs.correo = "Requerido";
  if (values.correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.correo)) errs.correo = "Correo inválido";
  if (values.cbu && !/^\d{22}$/.test(onlyDigits(values.cbu))) errs.cbu = "CBU debe tener 22 dígitos";
  // Teléfonos (si están): número requerido, códigos opcionales
  const telErrs = (values.telefonos || []).map((t) => {
    const te = {};
    if (!t.numero?.trim()) te.numero = "Requerido";
    if (t.codigo_pais && !/^\d{1,4}$/.test(onlyDigits(t.codigo_pais))) te.codigo_pais = "1–4 dígitos";
    if (t.codigo_area && !/^\d{1,6}$/.test(onlyDigits(t.codigo_area))) te.codigo_area = "1–6 dígitos";
    return te;
  });
  if (telErrs.some((x) => Object.keys(x).length)) errs.telefonos = telErrs;
  return errs;
}

// ====== Mock fallback (por si no existe el archivo en /public) ======
const FALLBACK = {
  id_usuario: 1,
  nombre: "Natalia",
  apellido: "Perez",
  dni: "40111222",
  correo: "nati@example.com",
  calle: "Av. Siempre Viva",
  numero: "742",
  cbu: "2850590940090418123456",
  fecha_creacion: "2025-08-01T13:22:40.000Z",
  rol: { id_rol: 2, nombre_rol: "usuario" },
  localidad: {
    id_localidad: 15,
    nombre_localidad: "Villa Elisa",
    ciudad: { id_ciudad: 7, nombre_ciudad: "La Plata", pais: { id_pais: 1, nombre_pais: "Argentina" } },
  },
  telefonos: [
    { id_telefono: 1, codigo_pais: "54", codigo_area: "221", numero: "5551234" }
  ],
};

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [edit, setEdit] = useState(false);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState(FALLBACK);

  // Form local (copia editable)
  const [form, setForm] = useState(FALLBACK);
  const [errs, setErrs] = useState({});

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true); setError("");
      try {
        // 1) Intentar mock desde /public/mock/user_profile.json
        const res = await fetch(MOCK_URL, { cache: "no-store" });
        if (!res.ok) throw new Error("HTTP " + res.status);
        const json = await res.json();
        if (!cancelled) {
          setData(json || FALLBACK);
          setForm(json || FALLBACK);
        }
      } catch (e) {
        console.warn("[Perfil] No se pudo cargar el mock, usando FALLBACK:", e?.message);
        if (!cancelled) {
          setData(FALLBACK);
          setForm(FALLBACK);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();

    return () => { cancelled = true; };
  }, []);

  const title = useMemo(() => {
    return `${data?.nombre ?? "Usuario"} ${data?.apellido ?? ""}`.trim();
  }, [data]);

  function onChange(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function onChangeTel(idx, field, value) {
    setForm((f) => {
      const copy = [...(f.telefonos || [])];
      copy[idx] = { ...copy[idx], [field]: value };
      return { ...f, telefonos: copy };
    });
  }

  function addPhone() {
    setForm((f) => ({ ...f, telefonos: [...(f.telefonos || []), { codigo_pais: "", codigo_area: "", numero: "" }] }));
  }
  function removePhone(idx) {
    setForm((f) => ({ ...f, telefonos: (f.telefonos || []).filter((_, i) => i !== idx) }));
  }

  function cancelEdit() {
    setForm(data);
    setErrs({});
    setEdit(false);
  }

  async function save() {
    const v = validate(form);
    setErrs(v);
    if (Object.keys(v).length) return;

    setSaving(true);
    try {
      // =======================================
      // Conexión real (dejada escrita y comentada)
      // const res = await fetch(PROFILE_URL, {
      //   method: "PUT",
      //   headers: { "Content-Type": "application/json" },
      //   credentials: "include",
      //   body: JSON.stringify(form),
      // });
      // if (!res.ok) throw new Error("HTTP " + res.status);
      // const updated = await res.json();
      // setData(updated);
      // setForm(updated);
      // =======================================

      // Simulación local (como si la API respondiera OK)
      await new Promise((r) => setTimeout(r, 600));
      setData(form);
      setEdit(false);
    } catch (e) {
      console.error("[Perfil] Error guardando:", e);
      setError("No se pudo guardar. Probá más tarde.");
    } finally {
      setSaving(false);
    }
  }

  // ====== Render ======
  return (
    <div style={{ backgroundColor: PAGE_BG, minHeight: "100vh", paddingTop: NAV_HEIGHT + 16 }}>
      <Navbar active="perfil" />

      <main className="mx-auto max-w-5xl px-4 py-8">
        {/* Header */}
        <section className="mb-6 flex items-center gap-4">
          <div
            className="rounded-2xl shadow-md bg-white p-4 flex items-center gap-4"
            style={{ minWidth: 0 }}
          >
            <div
              className="rounded-2xl flex items-center justify-center"
              style={{ width: 72, height: 72, background: "#FFF4D0", color: TEXT_DARK, fontWeight: 800, fontSize: 22 }}
            >
              {initialsOf(data?.nombre, data?.apellido)}
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-extrabold" style={{ color: TEXT_DARK }}>{title || "Perfil"}</h1>
              <p className="text-sm" style={{ color: TEXT_MUTED }}>
                Miembro desde {new Date(data?.fecha_creacion || Date.now()).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex-1" />
          {!edit ? (
            <button
              onClick={() => setEdit(true)}
              className="px-4 py-2 rounded-xl font-semibold shadow-md transition hover:shadow-lg"
              style={{ backgroundColor: PRIMARY, color: TEXT_DARK }}
            >
              Editar perfil
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={cancelEdit}
                className="px-4 py-2 rounded-xl font-semibold border"
                style={{ backgroundColor: "white", color: TEXT_DARK, borderColor: "rgba(0,0,0,0.08)" }}
              >
                Cancelar
              </button>
              <button
                onClick={save}
                disabled={saving}
                className={classNames(
                  "px-4 py-2 rounded-xl font-semibold shadow-md transition",
                  saving ? "opacity-60 cursor-not-allowed" : "hover:shadow-lg"
                )}
                style={{ backgroundColor: PRIMARY, color: TEXT_DARK }}
              >
                {saving ? "Guardando…" : "Guardar cambios"}
              </button>
            </div>
          )}
        </section>

        {error && (
          <div className="mb-4 rounded-xl border px-4 py-3 text-sm" style={{ background: "#FFF2F2", borderColor: "#FCA5A5", color: "#991B1B" }}>
            {error}
          </div>
        )}

        {/* Card principal */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna izquierda: datos personales */}
          <div className="lg:col-span-2 rounded-2xl bg-white shadow-md p-5 overflow-hidden">
            <h2 className="text-lg font-semibold mb-4" style={{ color: TEXT_DARK }}>Datos personales</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Nombre" value={form.nombre} onChange={(v) => onChange("nombre", v)} disabled={!edit} error={errs.nombre} />
              <Field label="Apellido" value={form.apellido} onChange={(v) => onChange("apellido", v)} disabled={!edit} error={errs.apellido} />
              <Field label="DNI" value={form.dni} onChange={(v) => onChange("dni", onlyDigits(v))} disabled={!edit} error={errs.dni} />
              <Field
                label="Correo"
                value={form.correo}
                onChange={() => {}}
                disabled={true}
                error={errs.correo}
                type="email"
                helper="Campo no apto a modificaciones."
              />
              <Field label="Calle" value={form.calle || ""} onChange={(v) => onChange("calle", v)} disabled={!edit} />
              <Field label="Número" value={form.numero || ""} onChange={(v) => onChange("numero", v)} disabled={!edit} />
              <Field label="CBU" value={form.cbu || ""} onChange={(v) => onChange("cbu", onlyDigits(v).slice(0,22))} disabled={!edit} placeholder="22 dígitos" helper={maskCBU(form.cbu)} error={errs.cbu} />
            </div>

            {/* Teléfonos */}
            <div className="mt-6">
              <h3 className="text-base font-semibold mb-2" style={{ color: TEXT_DARK }}>Teléfonos</h3>
              <div className="space-y-3">
                {(form.telefonos || []).map((t, idx) => {
                  const terr = (errs.telefonos && errs.telefonos[idx]) || {};
                  return (
                    // Layout responsive: grid en mobile, flex en sm+
                    <div key={idx} className="grid grid-cols-12 gap-3 sm:flex sm:items-end sm:gap-3">
                      {/* Código país */}
                      <div className="col-span-4 sm:w-28">
                        <Field
                          small
                          label="Código país"
                          value={t.codigo_pais || ""}
                          onChange={(v) => onChangeTel(idx, "codigo_pais", onlyDigits(v))}
                          disabled={!edit}
                          error={terr.codigo_pais}
                          placeholder="54"
                        />
                      </div>

                      {/* Código área */}
                      <div className="col-span-4 sm:w-32">
                        <Field
                          small
                          label="Código área"
                          value={t.codigo_area || ""}
                          onChange={(v) => onChangeTel(idx, "codigo_area", onlyDigits(v))}
                          disabled={!edit}
                          error={terr.codigo_area}
                          placeholder="221"
                        />
                      </div>

                      {/* Número */}
                      <div className="col-span-12 sm:flex-1 min-w-0">
                        <Field
                          label="Número"
                          value={t.numero || ""}
                          onChange={(v) => onChangeTel(idx, "numero", onlyDigits(v))}
                          disabled={!edit}
                          error={terr.numero}
                          placeholder="5551234"
                        />
                      </div>

                      {/* Botón eliminar */}
                      {edit && (
                        <div className="col-span-12 sm:w-auto sm:self-end">
                          <button
                            type="button"
                            onClick={() => removePhone(idx)}
                            className="px-3 py-2 rounded-xl border text-sm whitespace-nowrap shrink-0"
                            style={{ background: "white", color: TEXT_DARK, borderColor: "rgba(0,0,0,0.08)" }}
                          >
                            Eliminar
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
                {edit && (
                  <button
                    type="button"
                    onClick={addPhone}
                    className="px-3 py-2 rounded-xl font-semibold border text-sm"
                    style={{ background: "white", color: TEXT_DARK, borderColor: "rgba(0,0,0,0.08)" }}
                  >
                    + Agregar teléfono
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Columna derecha: ubicación y meta */}
          <aside className="rounded-2xl bg-white shadow-md p-5 space-y-4">
            <h2 className="text-lg font-semibold" style={{ color: TEXT_DARK }}>Ubicación</h2>
            <KeyValue label="Localidad" value={data?.localidad?.nombre_localidad || "—"} />
            <KeyValue label="Ciudad" value={data?.localidad?.ciudad?.nombre_ciudad || "—"} />
            <KeyValue label="País" value={data?.localidad?.ciudad?.pais?.nombre_pais || "—"} />
            <div className="h-px bg-black/10 my-2" />
            <KeyValue label="Usuario #" value={String(data?.id_usuario || "—")} />
            <KeyValue label="Miembro desde" value={new Date(data?.fecha_creacion || Date.now()).toLocaleDateString()} />
          </aside>
        </section>
      </main>

      <footer className="mt-16 border-t border-black/10" style={{ backgroundColor: "#FFF4D0" }}>
        <div className="mx-auto max-w-7xl px-4 py-8 text-sm text-slate-700 flex items-center justify-between">
          <span>© {new Date().getFullYear()} AlojaApp</span>
        </div>
      </footer>

      {loading && (
        <div className="fixed inset-0 grid place-items-center" style={{ background: "rgba(255, 255, 255, 0.35)" }}>
          <div className="rounded-2xl bg-white px-5 py-4 shadow" style={{ color: TEXT_DARK }}>Cargando perfil…</div>
        </div>
      )}
    </div>
  );
}

// ====== Subcomponentes ======
function Field({ label, value, onChange, disabled, placeholder, helper, error, type = "text", small = false }) {
  return (
    <label className={classNames("block", small ? "text-sm" : "text-base")}>
      <span className="uppercase tracking-wide text-[11px] opacity-70" style={{ color: TEXT_MUTED }}>{label}</span>
      <input
        type={type}
        value={value ?? ""}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        className={classNames(
          "mt-1 w-full rounded-xl border px-3 py-2 outline-none transition",
          disabled ? "bg-slate-50" : "bg-white focus:ring-2",
        )}
        style={{ borderColor: "rgba(0,0,0,0.08)", color: TEXT_DARK }}
      />
      {helper ? (
        <div className="mt-1 text-xs" style={{ color: TEXT_MUTED }}>{helper}</div>
      ) : null}
      {error ? (
        <div className="mt-1 text-xs" style={{ color: "#B91C1C" }}>{error}</div>
      ) : null}
    </label>
  );
}

function KeyValue({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1">
      <span className="text-sm" style={{ color: TEXT_MUTED }}>{label}</span>
      <span className="text-sm font-medium" style={{ color: TEXT_DARK }}>{value}</span>
    </div>
  );
}
