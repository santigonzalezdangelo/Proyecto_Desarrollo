import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";

const NAV_H = 72;
const PRIMARY = "#F8C24D";
const BORDER = "rgba(15,23,42,0.10)";
const TEXT_DARK = "#0F172A";
const TEXT_MUTED = "#334155";

/* ============ API BASE (robusta) ============ */
function normalizeApiBase(raw) {
  if (!raw) return "";
  let url = String(raw).trim();
  if (!/^https?:\/\//i.test(url)) url = `http://${url}`;
  return url.replace(/\/+$/g, ""); // quitar barras finales
}
const RAW_API = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";
const API_BASE = normalizeApiBase(RAW_API);

/* ============ Endpoints ============ */
const EP_ME = `${API_BASE}/users/me`; // GET y PUT
const EP_UPGRADE = `${API_BASE}/users/upgradeToHost`; // POST

/* ============ UI helpers ============ */
function Row({ children, gap = 16 }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap }}>
      {children}
    </div>
  );
}
function Field({ label, children }) {
  return (
    <label style={{ display: "block" }}>
      <div
        style={{
          fontSize: 12,
          letterSpacing: 0.2,
          color: TEXT_MUTED,
          marginBottom: 6,
        }}
      >
        {label?.toUpperCase()}
      </div>
      {children}
    </label>
  );
}
function Input({ readOnly = false, ...props }) {
  return (
    <input
      {...props}
      readOnly={readOnly}
      style={{
        width: "100%",
        height: 48,
        borderRadius: 12,
        border: `1px solid ${BORDER}`,
        outline: "none",
        padding: "0 14px",
        background: readOnly ? "#F8FAFC" : "#FFF",
        color: TEXT_DARK,
      }}
    />
  );
}

/* ============ helpers de datos ============ */
const pick = (o, keys, def = "") => {
  for (const k of keys) {
    const v = o?.[k];
    if (v !== undefined && v !== null && String(v).trim() !== "") return v;
  }
  return def;
};
const normalizeUser = (raw) => {
  const u = raw?.data?.user ?? raw?.user ?? raw?.data ?? raw ?? {};
  return {
    id: u.id_usuario ?? u.id ?? u.user_id ?? null,
    nombre: pick(u, ["nombre", "first_name", "name"]),
    apellido: pick(u, ["apellido", "last_name", "surname"]),
    dni: String(
      pick(u, ["dni", "documento", "nro_doc", "numero_documento"], "")
    ),
    correo: pick(u, ["correo", "email", "username"]),
    calle: u.calle ?? "",
    numero: u.numero ?? "",
    telefono: u.telefono ?? "",
    cbu: u.cbu ?? "",
  };
};

export default function ConvierteteEnAnfitrion() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [okMsg, setOkMsg] = useState("");

  // Solo lectura desde /users/me
  const [me, setMe] = useState({
    id: null,
    nombre: "",
    apellido: "",
    dni: "",
    correo: "",
  });

  // Editables enviados en PUT /users/me
  const [calle, setCalle] = useState("");
  const [numero, setNumero] = useState("");
  const [telefono, setTelefono] = useState(""); // solo números
  const [cbu, setCbu] = useState("");

  /* ===== GET /users/me ===== */
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(EP_ME, {
          method: "GET",
          credentials: "include", // cookie httpOnly
          headers: { Accept: "application/json" },
        });
        const j = await r.json().catch(() => ({}));
        if (!r.ok || j?.success === false) {
          throw new Error(
            j?.message || `(${r.status}) No pude cargar tu perfil`
          );
        }
        const u = normalizeUser(j);
        setMe({
          id: u.id,
          nombre: u.nombre,
          apellido: u.apellido,
          dni: u.dni,
          correo: u.correo,
        });
        // precargar si ya existían; si vienen nulos quedan vacíos
        setCalle(u.calle ?? "");
        setNumero(u.numero ?? "");
        setTelefono(u.telefono ?? "");
        setCbu(u.cbu ?? "");
      } catch (e) {
        setError(e.message || "Error al cargar datos");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ===== Validaciones simples ===== */
  const cbuOk = useMemo(
    () => !cbu || /^\d{22}$/.test((cbu || "").replace(/\s+/g, "")),
    [cbu]
  );
  const puedeGuardar = useMemo(
    () => !!(me.id && calle && numero && cbuOk),
    [me.id, calle, numero, cbuOk]
  );

  /* ===== SUBMIT: PUT /users/me  -> POST /users/upgradeToHost -> redirect ===== */
  async function handleSubmit(e) {
    e.preventDefault();
    setOkMsg("");
    setError("");
    if (!puedeGuardar) return;

    try {
      setSaving(true);

      // 1) PUT datos de perfil
      const bodyPut = {
        // id_usuario lo determina la cookie; si tu back requiere explícito, descomenta:
        // id_usuario: me.id,
        calle,
        numero: Number(numero),
        telefono: (telefono || "").replace(/[^\d]/g, ""), // SOLO números
        cbu: (cbu || "").replace(/\s+/g, ""),
      };

      const rPut = await fetch(EP_ME, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(bodyPut),
      });
      const jPut = await rPut.json().catch(() => ({}));
      if (!rPut.ok || jPut?.success === false) {
        throw new Error(jPut?.message || "No se pudieron actualizar los datos");
      }

      // 2) POST upgrade a anfitrión (usa id_usuario del perfil)
      const rUp = await fetch(EP_UPGRADE, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ id_usuario: me.id }),
      });
      const jUp = await rUp.json().catch(() => ({}));
      if (!rUp.ok || jUp?.success === false) {
        throw new Error(jUp?.message || "No se pudo convertir a anfitrión");
      }

      // 3) OK → redirect a Home
      setOkMsg("¡Datos actualizados y rol de anfitrión asignado!");
      navigate("/", { replace: true });
    } catch (e) {
      setError(e.message || "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Navbar />
      <div style={{ height: NAV_H }} />

      <div
        style={{
          background: "#FFF6DB",
          width: "100%",
          height: `calc(100vh - ${NAV_H}px)`,
          overflow: "hidden",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 920,
            height: "90%",
            overflowY: "auto",
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
              {/* SOLO LECTURA (GET /users/me) */}
              <Row>
                <Field label="Nombre">
                  <Input value={me.nombre} readOnly />
                </Field>
                <Field label="Apellido">
                  <Input value={me.apellido} readOnly />
                </Field>
              </Row>
              <div style={{ height: 14 }} />
              <Row>
                <Field label="DNI">
                  <Input value={me.dni} readOnly />
                </Field>
                <Field label="Correo">
                  <Input value={me.correo} readOnly />
                </Field>
              </Row>

              {/* EDITABLES (PUT /users/me) */}
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
              <Field label="Teléfono (solo números)">
                <Input
                  value={telefono}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  onChange={(e) =>
                    setTelefono(e.target.value.replace(/[^\d]/g, ""))
                  }
                  placeholder="2215555555"
                  maxLength={20}
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

              {/* === Ubicación comentada (no existe) === */}
              {/*
              // País/Ciudad/Localidad - sin endpoints por ahora
              */}

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
                    background: puedeGuardar && !saving ? PRIMARY : "#E2E8F0",
                    color: puedeGuardar && !saving ? "#0F172A" : "#94A3B8",
                    fontWeight: 700,
                    cursor: puedeGuardar && !saving ? "pointer" : "not-allowed",
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
