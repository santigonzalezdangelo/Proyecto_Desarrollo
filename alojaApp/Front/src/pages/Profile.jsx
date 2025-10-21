import React, { useEffect, useMemo, useState } from "react";
import Navbar from "../components/NavBar";

const PRIMARY = "#F8C24D";
const TEXT_DARK = "#0F172A";
const TEXT_MUTED = "#334155";
const PAGE_BG = "#FFF6DB";
const NAV_HEIGHT = 72;

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";
const PROFILE_URL = `${API_BASE}/users/me`;

function classNames(...xs) {
  return xs.filter(Boolean).join(" ");
}
function onlyDigits(x = "") {
  return String(x).replace(/\D/g, "");
}
function initialsOf(name = "", last = "") {
  const a = (name?.[0] || "").toUpperCase();
  const b = (last?.[0] || "").toUpperCase();
  return `${a}${b}` || "U";
}
function maskCBU(cbu = "") {
  if (!cbu) return "";
  const s = String(cbu).replace(/\D/g, "");
  if (s.length <= 6) return s;
  return `${s.slice(0, 3)}-${s.slice(3, 6)} •••• •••• •••• ${s.slice(-3)}`;
}

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [edit, setEdit] = useState(false);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState(null);
  const [form, setForm] = useState({});
  const [errs, setErrs] = useState({});

  // 🚀 Cargar datos del usuario actual
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(PROFILE_URL, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const userData = json.data || json;

        if (!cancelled) {
          setData(userData);
          setForm(userData);
        }
      } catch (e) {
        console.error("[Perfil] Error al cargar:", e);
        if (!cancelled)
          setError("No se pudo cargar el perfil. Iniciá sesión nuevamente.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const title = useMemo(
    () => `${data?.nombre ?? "Usuario"} ${data?.apellido ?? ""}`.trim(),
    [data]
  );

  function onChange(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function save() {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(PROFILE_URL, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const updated = await res.json();
      setData(updated.data || updated);
      setEdit(false);
    } catch (e) {
      console.error("[Perfil] Error guardando:", e);
      setError("No se pudo guardar. Probá más tarde.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 grid place-items-center bg-white/50">
        <div className="rounded-2xl bg-white px-5 py-4 shadow text-slate-800">
          Cargando perfil…
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center bg-amber-50"
        style={{ color: TEXT_DARK }}
      >
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: PAGE_BG,
        minHeight: "100vh",
        paddingTop: NAV_HEIGHT + 16,
      }}
    >
      <Navbar active="perfil" />
      <header className="mx-auto max-w-7xl px-4 pt-8 pb-4 flex justify-between">
        <div>
          <h1 className="text-3xl font-extrabold" style={{ color: TEXT_DARK }}>
            Tu perfil
          </h1>
          <p className="text-base" style={{ color: TEXT_MUTED }}>
            Gestioná tus datos personales y de contacto.
          </p>
        </div>
        {!edit ? (
          <button
            onClick={() => setEdit(true)}
            className="px-4 py-2 rounded-xl font-semibold shadow-sm hover:shadow-md"
            style={{ backgroundColor: PRIMARY, color: TEXT_DARK }}
          >
            Editar perfil
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => setEdit(false)}
              className="px-4 py-2 rounded-xl font-semibold border"
              style={{
                background: "white",
                color: TEXT_DARK,
                borderColor: "rgba(0,0,0,0.08)",
              }}
            >
              Cancelar
            </button>
            <button
              onClick={save}
              disabled={saving}
              className="px-4 py-2 rounded-xl font-semibold shadow-sm hover:shadow-md"
              style={{ backgroundColor: PRIMARY, color: TEXT_DARK }}
            >
              {saving ? "Guardando…" : "Guardar cambios"}
            </button>
          </div>
        )}
      </header>

      <main className="mx-auto max-w-7xl px-4 pb-10">
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white shadow-md rounded-2xl p-5">
            <div className="mb-5 flex items-center gap-4">
              <div
                className="rounded-2xl flex items-center justify-center"
                style={{
                  width: 72,
                  height: 72,
                  background: "#FFF4D0",
                  color: TEXT_DARK,
                  fontWeight: 800,
                  fontSize: 22,
                }}
              >
                {initialsOf(data?.nombre, data?.apellido)}
              </div>
              <div>
                <h2
                  className="text-2xl font-extrabold"
                  style={{ color: TEXT_DARK }}
                >
                  {title}
                </h2>
                <p className="text-sm" style={{ color: TEXT_MUTED }}>
                  Miembro desde{" "}
                  {new Date(data?.fecha_creacion || Date.now()).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Nombre" value={form.nombre} onChange={(v) => onChange("nombre", v)} disabled={!edit} />
              <Field label="Apellido" value={form.apellido} onChange={(v) => onChange("apellido", v)} disabled={!edit} />
              <Field label="DNI" value={form.dni} onChange={(v) => onChange("dni", onlyDigits(v))} disabled={!edit} />
              <Field label="Correo" value={form.correo} disabled={true} />
              <Field label="Calle" value={form.calle || ""} onChange={(v) => onChange("calle", v)} disabled={!edit} />
              <Field label="Número" value={form.numero || ""} onChange={(v) => onChange("numero", v)} disabled={!edit} />
              <Field label="CBU" value={form.cbu || ""} onChange={(v) => onChange("cbu", onlyDigits(v).slice(0,22))} disabled={!edit} helper={maskCBU(form.cbu)} />
            </div>
          </div>

          <aside className="rounded-2xl bg-white shadow-md p-5 space-y-4">
            <h3 className="text-lg font-semibold" style={{ color: TEXT_DARK }}>
              Resumen
            </h3>
            <KeyValue label="Localidad" value={data?.localidad?.nombre || "—"} />
            <KeyValue label="Ciudad" value={data?.localidad?.ciudad?.nombre_ciudad || "—"} />
            <KeyValue label="País" value={data?.localidad?.ciudad?.pais?.nombre_pais || "—"} />
            <div className="h-px bg-black/10 my-2" />
            <KeyValue label="Usuario #" value={String(data?.id_usuario || "—")} />
            <KeyValue label="Miembro desde" value={new Date(data?.fecha_creacion || Date.now()).toLocaleDateString()} />
          </aside>
        </section>
      </main>
    </div>
  );
}

function Field({ label, value, onChange, disabled, helper }) {
  return (
    <label className="block text-sm">
      <span className="uppercase tracking-wide text-[11px] opacity-70" style={{ color: TEXT_MUTED }}>
        {label}
      </span>
      <input
        type="text"
        value={value ?? ""}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        className="mt-1 w-full rounded-xl border px-3 py-2 outline-none transition bg-white focus:ring-2"
        style={{ borderColor: "rgba(0,0,0,0.08)", color: TEXT_DARK }}
      />
      {helper && (
        <div className="mt-1 text-xs" style={{ color: TEXT_MUTED }}>
          {helper}
        </div>
      )}
    </label>
  );
}

function KeyValue({ label, value }) {
  return (
    <div className="flex justify-between text-sm">
      <span style={{ color: TEXT_MUTED }}>{label}</span>
      <span className="font-medium" style={{ color: TEXT_DARK }}>
        {value}
      </span>
    </div>
  );
}
