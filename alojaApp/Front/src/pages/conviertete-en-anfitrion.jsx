// src/pages/conviertete-en-anfitrion.jsx
import React, { useEffect, useMemo, useState } from "react";
import Navbar from "../components/NavBar";

const NAV_H = 72;
const PRIMARY = "#F8C24D";
const BORDER = "rgba(15,23,42,0.10)";
const TEXT_DARK = "#0F172A";
const TEXT_MUTED = "#334155";

/** ===== BASE URL en 4000 ===== */
const API_BASE = import.meta?.env?.VITE_API_BASE_URL || "http://localhost:4000/api";

/** ===== Endpoints existentes en tu back ===== */
const EP_ME       = `${API_BASE}/users/me`; 
const EP_BECOME      = `${API_BASE}/usesr/become-host`;               // GET/PUT perfil
// Los de ubicación pueden NO existir todavía; manejamos 404 con fallback:
const EP_PAISES   = `${API_BASE}/paises`;
const EP_CIUDADES = (idPais)   => `${API_BASE}/paises/${idPais}/ciudades`;
const EP_LOCALID  = (idCiudad) => `${API_BASE}/ciudades/${idCiudad}/localidades`;

const authHeaders = () => {
  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("jwt");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

function Row({ children, gap = 16 }) {
  return <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap }}>{children}</div>;
}
function Field({ label, children }) {
  return (
    <label style={{ display:"block" }}>
      <div style={{ fontSize:12, letterSpacing:0.2, color:TEXT_MUTED, marginBottom:6 }}>{label?.toUpperCase()}</div>
      {children}
    </label>
  );
}
function Input({ readOnly=false, ...props }) {
  return (
    <input
      {...props}
      readOnly={readOnly}
      style={{
        width:"100%", height:48, borderRadius:12, border:`1px solid ${BORDER}`,
        outline:"none", padding:"0 14px", background: readOnly ? "#F8FAFC" : "#FFF", color: TEXT_DARK
      }}
    />
  );
}
function Select(props) {
  return (
    <select
      {...props}
      style={{
        width:"100%", height:48, borderRadius:12, border:`1px solid ${BORDER}`,
        outline:"none", padding:"0 12px", background:"#FFF", color:TEXT_DARK, appearance:"none"
      }}
    />
  );
}

export default function ConvierteteEnAnfitrion() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState("");
  const [okMsg, setOkMsg]     = useState("");

  // Perfil (solo lectura)
  const [me, setMe] = useState({ nombre:"", apellido:"", dni:"", correo:"" });

  // Editables permitidos por tu PUT
  const [calle, setCalle] = useState("");
  const [numero, setNumero] = useState("");
  const [cbu, setCbu] = useState("");
  const [telefono, setTelefono] = useState("");

  // Ubicación encadenada (si los endpoints existen)
  const [paises, setPaises] = useState([]);
  const [ciudades, setCiudades] = useState([]);
  const [localidades, setLocalidades] = useState([]);
  const [paisId, setPaisId] = useState("");
  const [ciudadId, setCiudadId] = useState("");
  const [localidadId, setLocalidadId] = useState("");
  const [ubicacionApiOk, setUbicacionApiOk] = useState(true); // si /paises 404 → false

  // Fallback visual (no se envía al back)
  const [paisTxt, setPaisTxt] = useState("");
  const [ciudadTxt, setCiudadTxt] = useState("");
  const [localidadTxt, setLocalidadTxt] = useState("");

  /** ====== Traer perfil ====== */
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(EP_ME, {
          headers: { ...authHeaders() },
          credentials: "include", // por si usás cookie en requireAuth
        });

        const json = await r.json().catch(() => ({}));
        if (!r.ok || json?.success === false) {
          throw new Error(json?.message ? `(${r.status}) ${json.message}` : `(${r.status}) No pude cargar tu perfil`);
        }

        const u = json.data || json;
        setMe({
          nombre:  u?.nombre  ?? "",
          apellido:u?.apellido?? "",
          dni:     u?.dni     ?? "",
          correo:  u?.correo  ?? u?.email ?? "",
          rol:     u?.rol ?? u?.nombre_rol ?? "",   
        });

        setCalle(u?.calle ?? "");
        setNumero(u?.numero ?? "");
        setCbu(u?.cbu ?? "");
        setTelefono(u?.telefono ?? "");

        // si tu perfil trae ids guardados:
        if (u?.id_pais) setPaisId(String(u.id_pais));
        if (u?.id_ciudad) setCiudadId(String(u.id_ciudad));
        if (u?.id_localidad) setLocalidadId(String(u.id_localidad));
      } catch (e) {
        setError(e.message || "Error al cargar datos");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /** ====== Cargar países (si existe la ruta) ====== */
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(EP_PAISES, { headers: { ...authHeaders() }, credentials: "include" });
        if (r.status === 404) {
          setUbicacionApiOk(false); // no existe /paises → usar fallback de inputs
          return;
        }
        const j = await r.json();
        if (!r.ok || j?.success === false) throw new Error(j?.message || "No pude cargar países");
        setPaises(Array.isArray(j) ? j : (j?.data ?? []));
        setUbicacionApiOk(true);
      } catch {
        setUbicacionApiOk(false);
      }
    })();
  }, []);

  /** ====== País → Ciudades ====== */
  useEffect(() => {
    if (!ubicacionApiOk || !paisId) { setCiudades([]); setCiudadId(""); setLocalidades([]); setLocalidadId(""); return; }
    (async () => {
      try {
        const r = await fetch(EP_CIUDADES(paisId), { headers: { ...authHeaders() }, credentials: "include" });
        const j = await r.json();
        if (!r.ok || j?.success === false) throw new Error(j?.message || "No pude cargar ciudades");
        setCiudades(Array.isArray(j) ? j : (j?.data ?? []));
        setCiudadId(""); setLocalidades([]); setLocalidadId("");
      } catch (e) {
        setError(e.message || "Error cargando ciudades");
      }
    })();
  }, [paisId, ubicacionApiOk]);

  /** ====== Ciudad → Localidades ====== */
  useEffect(() => {
    if (!ubicacionApiOk || !ciudadId) { setLocalidades([]); setLocalidadId(""); return; }
    (async () => {
      try {
        const r = await fetch(EP_LOCALID(ciudadId), { headers: { ...authHeaders() }, credentials: "include" });
        const j = await r.json();
        if (!r.ok || j?.success === false) throw new Error(j?.message || "No pude cargar localidades");
        setLocalidades(Array.isArray(j) ? j : (j?.data ?? []));
      } catch (e) {
        setError(e.message || "Error cargando localidades");
      }
    })();
  }, [ciudadId, ubicacionApiOk]);

  /** ====== Validaciones ====== */
  const cbuOk = useMemo(() => /^\d{22}$/.test((cbu || "").replace(/\s+/g, "")), [cbu]);
  const puedeGuardar = useMemo(() => {
    // Si el API de ubicación no existe, solo pedimos calle, numero y CBU
    if (!ubicacionApiOk) return !!(calle && numero && cbuOk);
    return !!(calle && numero && cbuOk && localidadId);
  }, [calle, numero, cbuOk, localidadId, ubicacionApiOk]);

  /** ====== Guardar (PUT /users/me) ====== */
  async function handleSubmit(e) {
    e.preventDefault();
    setOkMsg(""); setError("");
    if (!puedeGuardar) return;

    try {
      setSaving(true);
      const body = {
        calle,
        numero: Number(numero),
        cbu: (cbu || "").replace(/\s+/g, ""),
        telefono,
        ...(ubicacionApiOk && localidadId ? { id_localidad: Number(localidadId) } : {}),
      };

      const r = await fetch(EP_BECOME, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        credentials: "include",
        body: JSON.stringify({
          calle,
          numero: Number(numero),
          telefono,                               // si agregaste teléfono en el form
          cbu: (cbu || "").replace(/\s+/g, ""),
          ...(ubicacionApiOk && localidadId ? { id_localidad: Number(localidadId) } : {}),
        }),
      });

      const j = await r.json().catch(() => ({}));
      if (!r.ok || j?.success === false) throw new Error(j?.message || "No se pudo actualizar el perfil");
      setOkMsg("Perfil actualizado correctamente.");
    } catch (e) {
      setError(e.message || "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  return (
  <>
    <Navbar />
    {/* Espaciador para evitar que la Navbar tape el título */}
    <div style={{ height: NAV_H }} />

    {/* 🔹 Contenedor general SIN scroll (fijo) */}
    <div
      style={{
        background: "#FFF6DB",
        width: "100%",
        height: `calc(100vh - ${NAV_H}px)`, // ocupa toda la pantalla menos la navbar
        overflow: "hidden", // 🔸 bloquea scroll global
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* 🔹 Contenedor del formulario CON scroll interno */}
      <div
        style={{
          width: "100%",
          maxWidth: 920,
          height: "90%", // visible casi toda la pantalla
          overflowY: "auto", // 🔸 scroll SOLO acá
          background: "#fff",
          borderRadius: 20,
          border: `1px solid ${BORDER}`,
          padding: "32px 24px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        }}
      >
        <h1 style={{ margin: 0, fontSize: 36, color: TEXT_DARK }}>
          Conviértete en anfitrión
        </h1>
        <p style={{ marginTop: 8, color: TEXT_MUTED }}>
          Completa tu información para empezar a publicar alojamientos.
        </p>

        {error && (
          <div style={{ color: "#B91C1C", margin: "12px 0" }}>{error}</div>
        )}
        {okMsg && (
          <div style={{ color: "#166534", margin: "12px 0" }}>{okMsg}</div>
        )}

        {loading ? (
          <div style={{ color: TEXT_MUTED }}>Cargando…</div>
        ) : (
          <form onSubmit={handleSubmit}>
            <Row>
              <Field label="Nombre"><Input value={me.nombre} readOnly /></Field>
              <Field label="Apellido"><Input value={me.apellido} readOnly /></Field>
            </Row>
            <div style={{ height: 14 }} />
            <Row>
              <Field label="DNI"><Input value={me.dni} readOnly /></Field>
              <Field label="Correo"><Input value={me.correo} readOnly /></Field>
            </Row>

            <div style={{ height: 22 }} />
            <Row>
              <Field label="Calle">
                <Input
                  value={calle}
                  onChange={(e) => setCalle(e.target.value)}
                  placeholder="Ej: Av. Siempre Viva"
                />
              </Field>
              <Field label="Número">
                <Input
                  value={numero}
                  onChange={(e) =>
                    setNumero(e.target.value.replace(/[^\d]/g, ""))
                  }
                  placeholder="742"
                />
              </Field>
            </Row>

            <div style={{ height: 14 }} />
            <Field label="Teléfono">
              <Input
                value={telefono}
                onChange={(e) =>
                  setTelefono(e.target.value.replace(/[^\d+]/g, ""))
                }
                placeholder="+54 11 5555 5555"
              />
            </Field>

            <div style={{ height: 14 }} />
            <Field label="CBU (22 dígitos)">
              <Input
                value={cbu}
                inputMode="numeric"
                maxLength={22}
                onChange={(e) => {
                  const onlyDigits = e.target.value.replace(/[^\d]/g, "");
                  setCbu(onlyDigits.slice(0, 22));
                }}
                placeholder="0000000000000000000000"
              />
              {!cbu || cbuOk ? null : (
                <div style={{ marginTop: 6, fontSize: 12, color: "#B45309" }}>
                  El CBU debe tener 22 dígitos.
                </div>
              )}
            </Field>

            {/* Ubicación */}
            <div style={{ height: 14 }} />
            {ubicacionApiOk ? (
              <>
                <Row>
                  <Field label="País">
                    <Select
                      value={paisId}
                      onChange={(e) => setPaisId(e.target.value)}
                    >
                      <option value="">Selecciona un país…</option>
                      {paises.map((p) => (
                        <option
                          key={p.id_pais || p.id}
                          value={String(p.id_pais ?? p.id)}
                        >
                          {p.nombre_pais ?? p.nombre}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Ciudad">
                    <Select
                      value={ciudadId}
                      onChange={(e) => setCiudadId(e.target.value)}
                      disabled={!paisId}
                    >
                      <option value="">
                        {paisId
                          ? "Selecciona una ciudad…"
                          : "Primero el país"}
                      </option>
                      {ciudades.map((c) => (
                        <option
                          key={c.id_ciudad || c.id}
                          value={String(c.id_ciudad ?? c.id)}
                        >
                          {c.nombre_ciudad ?? c.nombre}
                        </option>
                      ))}
                    </Select>
                  </Field>
                </Row>

                <div style={{ height: 14 }} />
                <Field label="Localidad">
                  <Select
                    value={localidadId}
                    onChange={(e) => setLocalidadId(e.target.value)}
                    disabled={!ciudadId}
                  >
                    <option value="">
                      {ciudadId
                        ? "Selecciona una localidad…"
                        : "Primero la ciudad"}
                    </option>
                    {localidades.map((l) => (
                      <option
                        key={l.id_localidad || l.id}
                        value={String(l.id_localidad ?? l.id)}
                      >
                        {l.nombre_localidad ?? l.nombre}
                      </option>
                    ))}
                  </Select>
                </Field>
              </>
            ) : (
              <>
                <Row>
                  <Field label="País (texto)">
                    <Input
                      value={paisTxt}
                      onChange={(e) => setPaisTxt(e.target.value)}
                      placeholder="Argentina"
                    />
                  </Field>
                  <Field label="Ciudad (texto)">
                    <Input
                      value={ciudadTxt}
                      onChange={(e) => setCiudadTxt(e.target.value)}
                      placeholder="La Plata"
                    />
                  </Field>
                </Row>
                <div style={{ height: 14 }} />
                <Field label="Localidad (texto)">
                  <Input
                    value={localidadTxt}
                    onChange={(e) => setLocalidadTxt(e.target.value)}
                    placeholder="Villa Elisa"
                  />
                </Field>
                <div style={{ marginTop: 8, fontSize: 12, color: "#B45309" }}>
                  Nota: tu API de ubicación respondió 404. Estos campos son solo
                  visuales por ahora.
                </div>
              </>
            )}

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: 22,
                paddingBottom: 8,
              }}
            >
              <button
                type="submit"
                disabled={!puedeGuardar || saving}
                style={{
                  height: 48,
                  padding: "0 18px",
                  borderRadius: 12,
                  border: "none",
                  background:
                    puedeGuardar && !saving ? PRIMARY : "#E2E8F0",
                  color:
                    puedeGuardar && !saving ? "#0F172A" : "#94A3B8",
                  fontWeight: 700,
                  cursor:
                    puedeGuardar && !saving ? "pointer" : "not-allowed",
                }}
              >
                {saving ? "Guardando…" : "Guardar cambios"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  </>
);


}
