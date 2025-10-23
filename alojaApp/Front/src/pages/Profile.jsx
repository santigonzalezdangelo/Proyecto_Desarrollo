import React, { useEffect, useMemo, useState } from "react";
import Navbar from "../components/NavBar";

/** ====== Estilos base ====== */
const PRIMARY = "#F8C24D";
const TEXT_DARK = "#0F172A";
const TEXT_MUTED = "#334155";
const PAGE_BG = "#FFF6DB";
const NAV_HEIGHT = 72;

/** ====== Helpers de URL / Auth robustos ====== */
const RAW_API = import.meta.env.VITE_API_URL || "http://localhost:4000";
function withNoDoubleSlash(base, path) {
  return `${base.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
}
const CANDIDATE_BASES = [RAW_API, withNoDoubleSlash(RAW_API, "/api")];

async function tryFetchJSON(
  path,
  { useAuthHeader = true, method = "GET", body } = {}
) {
  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("jwt");

  let lastErr;
  for (const base of CANDIDATE_BASES) {
    const url = withNoDoubleSlash(base, path);

    if (useAuthHeader && token) {
      try {
        const r = await fetch(url, {
          method,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
          ...(body ? { body: JSON.stringify(body) } : {}),
        });
        if (r.ok) return await r.json();
        lastErr = new Error(`HTTP ${r.status} ${url}`);
      } catch (e) {
        lastErr = e;
      }
    }

    try {
      const r = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        ...(body ? { body: JSON.stringify(body) } : {}),
      });
      if (r.ok) return await r.json();
      lastErr = new Error(`HTTP ${r.status} ${url}`);
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr || new Error("No se pudo contactar al API");
}

/** ====== Otros helpers de UI/Data ====== */
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

/** ====== Detección de rol ====== */
const ROLE_ID_MAP = { 1: "Huésped", 2: "Anfitrión" };

function normalize(str = "") {
  return String(str)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}
function extractRoleName(current = {}) {
  const rawCandidates = [
    current?.id_rol,
    current?.idRol,
    current?.rol,
    current?.role,
    current?.nombre_rol,
    current?.rol_nombre,
    current?.tipo,
    current?.role_name,
    current?.user?.rol,
    current?.user?.role,
    current?.data?.id_rol,
    current?.data?.idRol,
    current?.data?.rol,
    current?.data?.role,
    current?.data?.nombre_rol,
    current?.roles,
    current?.data?.roles,
  ];
  const nameFromObj = (obj) => {
    if (obj && typeof obj === "object") {
      if (typeof obj.id === "number" && ROLE_ID_MAP[obj.id])
        return ROLE_ID_MAP[obj.id];
      return (
        obj.nombre ?? obj.name ?? obj.title ?? obj.descripcion ?? obj.role ?? ""
      );
    }
    return "";
  };
  for (let c of rawCandidates) {
    if (typeof c === "number" && ROLE_ID_MAP[c]) return ROLE_ID_MAP[c];
    if (typeof c === "string" && c.trim()) return c;
    if (c && typeof c === "object" && !Array.isArray(c)) {
      const n = nameFromObj(c);
      if (typeof n === "string" && n.trim()) return n;
    }
    if (Array.isArray(c) && c.length) {
      for (const it of c) {
        if (typeof it === "string" && it.trim()) return it;
        const n = nameFromObj(it);
        if (typeof n === "string" && n.trim()) return n;
      }
    }
  }
  return "";
}
function roleFromCurrent(current) {
  const raw = extractRoleName(current);
  const r = normalize(raw);
  if (
    r.includes("anfitrion") ||
    r.includes("host") ||
    r.includes("propiet") ||
    r.includes("dueno") ||
    r.includes("dueño") ||
    r === "2"
  ) {
    return "host";
  }
  return "guest";
}

/** ====== Componente principal ====== */
export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [edit, setEdit] = useState(false);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState(null);
  const [authInfo, setAuthInfo] = useState(null);
  const [form, setForm] = useState({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const current = await tryFetchJSON("/auth/current");
        if (cancelled) return;
        setAuthInfo(current?.data || current);

        const me = await tryFetchJSON("/users/me");
        if (cancelled) return;
        const userData = me.data || me;

        // teléfonos: soporta array o string único
        const phones = Array.isArray(userData.telefonos)
          ? userData.telefonos
          : [userData.telefono].filter(Boolean);

        setData(userData);
        setForm({
          nombre: userData.nombre || "",
          apellido: userData.apellido || "",
          dni: userData.dni || "",
          correo: userData.correo || userData.email || "",
          // NEW: lista de teléfonos
          telefonos: phones.length ? phones : [""],
          calle: userData.calle || "",
          numero: userData.numero || "",
          cbu: userData.cbu || "",
        });
      } catch (e) {
        console.error("[Perfil] Falla al cargar:", e);
        if (!cancelled)
          setError("No se pudo cargar el perfil. Iniciá sesión nuevamente.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const role = useMemo(() => roleFromCurrent(authInfo || {}), [authInfo]);
  const isHost = role === "host";

  const title = useMemo(
    () => `${data?.nombre ?? "Usuario"} ${data?.apellido ?? ""}`.trim(),
    [data]
  );

  function onChange(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  // ====== Teléfonos (dinámicos) ======
  function setPhone(idx, value) {
    setForm((f) => {
      const arr = [...(f.telefonos || [""])];
      arr[idx] = onlyDigits(value);
      return { ...f, telefonos: arr };
    });
  }

  function removePhone(idx) {
    setForm((f) => {
      const arr = [...(f.telefonos || [])];
      arr.splice(idx, 1);
      if (!arr.length) arr.push("");
      return { ...f, telefonos: arr };
    });
  }

  async function save() {
    setSaving(true);
    try {
      // normalizamos teléfonos: solo dígitos y sin vacíos
      const cleanedPhones = (form.telefonos || [])
        .map((t) => onlyDigits(t))
        .filter((t) => t.length > 0);

      const firstPhone = cleanedPhones[0] || "";

      // Solo enviamos campos visibles según rol
      const payload = isHost
        ? {
            nombre: form.nombre,
            apellido: form.apellido,
            dni: onlyDigits(form.dni),
            correo: form.correo,
            // compatibilidad: uno y muchos
            telefono: firstPhone,
            telefonos: cleanedPhones,
            calle: form.calle,
            numero: form.numero,
            cbu: onlyDigits(form.cbu).slice(0, 22),
          }
        : {
            nombre: form.nombre,
            apellido: form.apellido,
            dni: onlyDigits(form.dni),
            correo: form.correo,
          };

      const updated = await tryFetchJSON("/users/me", {
        method: "PUT",
        body: payload,
      });
      const u = updated.data || updated;
      setData(u);
      setEdit(false);
    } catch (e) {
      console.error("[Perfil] Error guardando:", e);
      alert("No se pudo guardar. Probá más tarde.");
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
        className="min-h-screen flex flex-col items-center justify-center"
        style={{ backgroundColor: PAGE_BG, color: TEXT_DARK }}
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
          {/* Panel izquierdo (form) */}
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
                  {title || "Tu nombre"}
                </h2>
                <p className="text-sm" style={{ color: TEXT_MUTED }}>
                  Miembro desde
                  {new Date(
                    data?.fecha_creacion || data?.created_at || Date.now()
                  ).toLocaleDateString()}
                </p>
                <p className="text-xs text-slate-500">
                  Rol: <b>{isHost ? "Anfitrión" : "Huésped"}</b>
                </p>
              </div>
            </div>

            {/* Campos por rol */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Siempre */}
              <Field
                label="Nombre"
                value={form.nombre}
                onChange={(v) => onChange("nombre", v)}
                disabled={!edit}
              />
              <Field
                label="Apellido"
                value={form.apellido}
                onChange={(v) => onChange("apellido", v)}
                disabled={!edit}
              />
              <Field
                label="DNI"
                value={form.dni}
                onChange={(v) => onChange("dni", onlyDigits(v))}
                disabled={!edit}
              />
              <Field label="Correo" value={form.correo} disabled={true} />

              {/* Solo anfitrión */}
              {isHost && (
                <>
                  {/* Calle y Número en la misma fila */}
                  <Field
                    label="Calle"
                    value={form.calle || ""}
                    onChange={(v) => onChange("calle", v)}
                    disabled={!edit}
                  />
                  <Field
                    label="Número"
                    value={form.numero || ""}
                    onChange={(v) => onChange("numero", v)}
                    disabled={!edit}
                  />

                  {/* Teléfonos: ocupa 2 columnas y va debajo */}
                  <div className="sm:col-span-2">
                    <span
                      className="uppercase tracking-wide text-[11px] opacity-70"
                      style={{ color: TEXT_MUTED }}
                    >
                      Teléfonos
                    </span>

                    <div className="mt-1 space-y-2">
                      {(form.telefonos || []).map((t, idx) => (
                        <div key={idx} className="flex gap-2">
                          <input
                            type="text"
                            value={t}
                            onChange={(e) => setPhone(idx, e.target.value)}
                            disabled={!edit}
                            className="w-full rounded-xl border px-3 py-2 outline-none transition bg-white focus:ring-2"
                            style={{
                              borderColor: "rgba(0,0,0,0.08)",
                              color: TEXT_DARK,
                            }}
                            placeholder="Ej.: 2215551234"
                          />
                          {edit && (form.telefonos?.length ?? 0) > 1 && (
                            <button
                              type="button"
                              onClick={() => removePhone(idx)}
                              className="px-3 rounded-xl border text-sm"
                              title="Quitar teléfono"
                            >
                              −
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <Field
                    label="CBU"
                    value={form.cbu || ""}
                    onChange={(v) =>
                      onChange("cbu", onlyDigits(v).slice(0, 22))
                    }
                    disabled={!edit}
                    helper={maskCBU(form.cbu)}
                  />
                  {/* placeholder para mantener grilla pareja */}
                  <div />
                </>
              )}
            </div>
          </div>

          {/* Panel derecho (resumen) */}
          <aside className="rounded-2xl bg-white shadow-md p-5 space-y-4">
            <h3 className="text-lg font-semibold" style={{ color: TEXT_DARK }}>
              Resumen
            </h3>

            {isHost && (
              <>
                <KeyValue
                  label="Localidad"
                  value={data?.localidad?.nombre || data?.localidad || "—"}
                />
                <KeyValue
                  label="Ciudad"
                  value={
                    data?.localidad?.ciudad?.nombre_ciudad ||
                    data?.ciudad ||
                    "—"
                  }
                />
                <KeyValue
                  label="País"
                  value={
                    data?.localidad?.ciudad?.pais?.nombre_pais ||
                    data?.pais ||
                    "—"
                  }
                />
                <div className="h-px bg-black/10 my-2" />
              </>
            )}

            <KeyValue
              label="Usuario #"
              value={String(data?.id_usuario || data?.id || "—")}
            />
            <KeyValue
              label="Miembro desde"
              value={new Date(
                data?.fecha_creacion || data?.created_at || Date.now()
              ).toLocaleDateString()}
            />
          </aside>
        </section>
      </main>
    </div>
  );
}

/** ====== Subcomponentes ====== */
function Field({ label, value, onChange, disabled, helper }) {
  return (
    <label className="block text-sm">
      <span
        className="uppercase tracking-wide text-[11px] opacity-70"
        style={{ color: TEXT_MUTED }}
      >
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
        {value || "—"}
      </span>
    </div>
  );
}
