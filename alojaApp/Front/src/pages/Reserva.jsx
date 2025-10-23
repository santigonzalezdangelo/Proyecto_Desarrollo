import React, { useEffect, useMemo, useState } from "react";
import Navbar from "../components/NavBar";
import PropertyCard from "../components/PropertyCard";
import SearchButton from "../components/SearchButton";
import MapView from "../components/MapView";
import { socket } from "../lib/socket"; // Socket.IO client

const API_URL = "http://localhost:4000/api";
const CONFIRM_RESERVATION_URL =
  "http://localhost:4000/api/reservations/createReservation";
const CURRENT_USER_URL = "http://localhost:4000/api/auth/current";

/** Placeholders locales para no depender de DNS externos */
const FALLBACK_BIG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='800'><rect width='100%' height='100%' fill='#f1f5f9'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='36' fill='#64748b'>Imagen no disponible</text></svg>`
  );
const FALLBACK_CARD =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='500'><rect width='100%' height='100%' fill='#f1f5f9'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='28' fill='#64748b'>AlojaApp</text></svg>`
  );

/** Helper: emitir con callback y timeout para no colgarse si el server no responde */
function emitWithAck(sock, event, payload, timeoutMs = 7000) {
  return new Promise((resolve) => {
    let settled = false;
    const t = setTimeout(() => {
      if (!settled) {
        settled = true;
        resolve({ ok: false, error: "timeout" });
      }
    }, timeoutMs);

    try {
      sock.emit(event, payload, (ack) => {
        if (settled) return;
        settled = true;
        clearTimeout(t);
        resolve(ack);
      });
    } catch (e) {
      if (!settled) {
        settled = true;
        clearTimeout(t);
        resolve({ ok: false, error: e?.message || "emit-error" });
      }
    }
  });
}

export default function Reserva() {
  const [propiedad, setPropiedad] = useState(null);
  const [recomendadas, setRecomendadas] = useState([]);
  const [form, setForm] = useState({
    fecha_inicio: "",
    fecha_fin: "",
    precio_total: 0,
  });
  const [usuarioActual, setUsuarioActual] = useState(null);
  const [loading, setLoading] = useState(true);
  const [calculando, setCalculando] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");

  // textarea grande fijo para mensaje al anfitrión
  const [mensajeHost, setMensajeHost] = useState("");
  const [enviandoMsg, setEnviandoMsg] = useState(false);

  // Estado de conexión del socket
  const [isSocketConnected, setIsSocketConnected] = useState(socket.connected);
  useEffect(() => {
    // reflejar estado inicial por las dudas
    setIsSocketConnected(socket.connected);

    const onConnect = () => {
      console.log("[socket] front conectado", socket.id);
      setIsSocketConnected(true);
    };
    const onDisconnect = () => {
      console.log("[socket] front desconectado");
      setIsSocketConnected(false);
    };
    const onConnectError = (err) => {
      console.warn("[socket] connect_error:", err?.message);
      setIsSocketConnected(false);
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);
    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onConnectError);
    };
  }, []);

  // Cargar propiedad + usuario + recomendadas
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("id") || 1;

    async function fetchData() {
      try {
        setErrorMsg("");

        // usuario actual
        const userRes = await fetch(CURRENT_USER_URL, {
          credentials: "include",
        });
        if (userRes.ok) {
          const userData = await userRes.json();
          setUsuarioActual(userData);
        } else {
          setUsuarioActual(null);
        }

        // propiedad
        const res = await fetch(`${API_URL}/properties/${id}`);
        if (!res.ok) throw new Error(`GET /properties/${id} -> ${res.status}`);
        const data = await res.json();
        setPropiedad(data);

        // recomendadas
        const recRes = await fetch(
          `${API_URL}/properties/destacadas?excludeId=${id}`
        );
        if (recRes.ok) {
          const recData = await res.json().catch(() => []);
          // en caso de que el endpoint no devuelva JSON, fallback
          setRecomendadas(Array.isArray(recData) ? recData : []);
        } else {
          setRecomendadas([]);
        }
      } catch (err) {
        console.error("Error cargando datos:", err);
        setErrorMsg("No pudimos cargar la propiedad. Intentá nuevamente.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Calcular precio
  async function handleCalcular() {
    if (!form.fecha_inicio || !form.fecha_fin) {
      alert("Por favor, seleccioná ambas fechas.");
      return;
    }
    setCalculando(true);
    try {
      const url = `${API_URL}/properties/precio?id_propiedad=${propiedad.id_propiedad}&fecha_inicio=${form.fecha_inicio}&fecha_fin=${form.fecha_fin}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`GET /properties/precio -> ${res.status}`);
      const data = await res.json();
      setForm((f) => ({ ...f, precio_total: data.precio_total }));
    } catch (err) {
      console.error("Error al calcular precio:", err);
      alert("Error al calcular el precio.");
    } finally {
      setCalculando(false);
    }
  }

  // Confirmar reserva
  async function handleConfirmarReserva() {
    try {
      if (!meId) {
        alert("Tenés que iniciar sesión para realizar una reserva.");
        return;
      }
      if (!form.fecha_inicio || !form.fecha_fin) {
        alert("Seleccioná ambas fechas antes de confirmar.");
        return;
      }
      const body = {
        id_usuario: meId,
        id_propiedad: propiedad.id_propiedad,
        fecha_inicio: new Date(form.fecha_inicio).toISOString(),
        fecha_fin: new Date(form.fecha_fin).toISOString(),
      };
      const res = await fetch(CONFIRM_RESERVATION_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        credentials: "include",
      });
      if (res.status === 409) {
        const data = await res.json();
        alert(`⚠️ ${data.error}`);
        return;
      }
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error creando reserva");
      }
      const reserva = await res.json();
      alert(
        `✅ Reserva creada correctamente.\nCódigo: ${
          reserva.id_reserva || "(sin código)"
        }`
      );
      setForm({ fecha_inicio: "", fecha_fin: "", precio_total: 0 });
    } catch (err) {
      console.error("Error al crear reserva:", err);
      alert(`❌ No se pudo crear la reserva: ${err.message}`);
    }
  }

  // Iniciales del anfitrión
  function getInitials(nombre, apellido) {
    const n = nombre?.charAt(0)?.toUpperCase() || "";
    const a = apellido?.charAt(0)?.toUpperCase() || "";
    return n + a;
  }

  // ID del usuario actual
  const meId = useMemo(() => {
    const u = usuarioActual || {};
    return Number(u?.data?.id_usuario ?? u?.id_usuario ?? u?.id ?? NaN);
  }, [usuarioActual]);

  // ID del anfitrión (prueba varias claves comunes)
  const hostId = useMemo(() => {
    const p = propiedad || {};
    const candidatos = [
      p?.anfitrion?.id_usuario ?? null, // include del usuario
      p?.id_anfitrion ?? null, // FK en propiedades
      p?.id_usuario ?? null, // alias de compat del backend
      p?.anfitrion?.id ?? null,
      p?.propietario?.id_usuario ?? null,
      p?.id_propietario ?? null,
    ];
    for (const v of candidatos) {
      const n = Number(v);
      if (Number.isFinite(n) && n > 0) return n;
    }
    if (p?.anfitrion) console.log("[DEBUG anfitrión payload]", p.anfitrion);
    return null;
  }, [propiedad]);

  // Enviar mensaje al anfitrión (NO abre chat aquí)
  async function handleEnviarMensajeAlHost(e) {
    e?.preventDefault?.();
    const text = mensajeHost.trim();

    console.log(
      "[DM] meId:",
      meId,
      "hostId:",
      hostId,
      "socket.connected:",
      isSocketConnected
    );

    if (!text) return;

    if (!hostId) {
      alert("No se pudo identificar al anfitrión.");
      return;
    }

    if (!isSocketConnected) {
      alert("Conexión de chat no disponible. Reintentá en unos segundos.");
      return;
    }

    const payload = { from: Number(meId), to: Number(hostId), text };
    console.log("[DM] sending payload:", payload);

    setEnviandoMsg(true);
    try {
      const ack = await emitWithAck(socket, "dm:send", payload, 7000);
      console.log("[DM] ack:", ack);

      if (!ack || !ack.ok) {
        alert(
          `No se pudo enviar el mensaje${ack?.error ? `: ${ack.error}` : ""}.`
        );
        return;
      }

      setMensajeHost("");

      if (meId === hostId) {
        console.warn(
          "[DM] Mensaje a uno mismo: si el server no hace eco al emisor, no verás notificación."
        );
      }
    } finally {
      setEnviandoMsg(false);
    }
  }

  if (loading) return <p className="p-8 text-center">Cargando...</p>;
  if (errorMsg) return <p className="p-8 text-center">{errorMsg}</p>;
  if (!propiedad)
    return <p className="p-8 text-center">Propiedad no encontrada.</p>;

  return (
    <div className="min-h-screen bg-[#FFF6DB] pb-10">
      <Navbar active="inicio" />
      <div className="pt-[70px]">
        <header
          className="p-6 text-[#0F172A] font-bold text-xl"
          style={{ backgroundColor: "#F8C24D" }}
        >
          <div className="max-w-6xl mx-auto">
            {propiedad.nombre_de_fantasia || "Propiedad"}
          </div>
        </header>

        {/* descripción + reserva */}
        <main className="max-w-6xl mx-auto px-4 py-10 grid md:grid-cols-2 gap-10">
          {/* IZQ: imagen/carrusel */}
          <section className="flex flex-col gap-4">
            <div className="relative w-full rounded-2xl overflow-hidden shadow-lg">
              <img
                src={propiedad.fotos?.[currentIndex]?.url_foto || FALLBACK_BIG}
                alt={`Foto ${currentIndex + 1}`}
                className="w-full h-auto object-cover rounded-2xl transition-all duration-500"
                onError={(e) => {
                  e.currentTarget.src = FALLBACK_BIG;
                }}
              />
              {propiedad.fotos?.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setCurrentIndex((prev) =>
                        prev === 0 ? propiedad.fotos.length - 1 : prev - 1
                      )
                    }
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white text-[#0F172A] rounded-full w-10 h-10 flex items-center justify-center shadow-md"
                  >
                    ‹
                  </button>
                  <button
                    onClick={() =>
                      setCurrentIndex((prev) =>
                        prev === propiedad.fotos.length - 1 ? 0 : prev + 1
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white text-[#0F172A] rounded-full w-10 h-10 flex items-center justify-center shadow-md"
                  >
                    ›
                  </button>
                </>
              )}
            </div>

            <h2 className="text-2xl font-bold mt-2">{propiedad.descripcion}</h2>
            <p>
              {[propiedad.ciudad, propiedad.pais].filter(Boolean).join(", ")}
            </p>
            <p className="font-semibold">
              💰 ${propiedad.precio_por_noche} por noche
            </p>

            {Number(propiedad.puntuacion_promedio) > 0 && (
              <p className="text-lg text-yellow-600 font-semibold flex items-center gap-2">
                ⭐ {Number(propiedad.puntuacion_promedio).toFixed(1)} / 5
                <span className="text-sm text-slate-700">
                  ({(propiedad.calificaciones || []).length} reseñas)
                </span>
              </p>
            )}
          </section>

          {/* DER: formulario reserva */}
          <section className="bg-white p-6 rounded-2xl shadow-lg flex flex-col gap-4 self-start">
            <h3 className="text-xl font-semibold">Reservar tu estadía</h3>

            <label className="flex flex-col gap-1">
              Fecha de inicio:
              <input
                type="date"
                value={form.fecha_inicio}
                onChange={(e) =>
                  setForm({ ...form, fecha_inicio: e.target.value })
                }
                className="border rounded px-3 py-2"
              />
            </label>

            <label className="flex flex-col gap-1">
              Fecha de fin:
              <input
                type="date"
                value={form.fecha_fin}
                min={form.fecha_inicio || undefined}
                onChange={(e) =>
                  setForm({ ...form, fecha_fin: e.target.value })
                }
                className="border rounded px-3 py-2"
              />
            </label>

            <SearchButton
              onClick={handleCalcular}
              disabled={!form.fecha_inicio || !form.fecha_fin || calculando}
              label={calculando ? "Calculando..." : "Calcular precio"}
            />

            {form.precio_total > 0 && (
              <p className="text-lg font-semibold">
                Precio total: ${form.precio_total.toLocaleString()}
              </p>
            )}

            <SearchButton
              onClick={handleConfirmarReserva}
              disabled={form.precio_total <= 0}
              label="Confirmar reserva"
            />
          </section>
        </main>

        {/* mapa + anfitrión + mensaje fijo */}
        <section className="max-w-6xl mx-auto px-4 py-10 grid md:grid-cols-2 gap-10 items-start">
          {/* mapa */}
          <div className="relative z-0">
            <MapView
              lat={parseFloat(propiedad.latitud)}
              lng={parseFloat(propiedad.longitud)}
              title={propiedad.nombre_de_fantasia}
            />
          </div>

          {/* anfitrión + textarea */}
          <div className="flex flex-col gap-6 justify-start bg-[#FFF6DB] p-4 rounded-2xl">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-[#FFF1C1] text-[#0F172A] font-bold text-lg shadow-md">
                {getInitials(
                  propiedad.anfitrion?.nombre,
                  propiedad.anfitrion?.apellido
                )}
              </div>
              <div className="w-full">
                <h4 className="font-semibold text-lg">
                  Anfitrión: {propiedad.anfitrion?.nombre}{" "}
                  {propiedad.anfitrion?.apellido}
                </h4>

                {/* textarea grande fijo */}
                <form onSubmit={handleEnviarMensajeAlHost} className="mt-3">
                  <textarea
                    value={mensajeHost}
                    onChange={(e) => setMensajeHost(e.target.value)}
                    placeholder="Escribí un mensaje para el anfitrión…"
                    className="w-full min-h-[140px] resize-vertical border rounded-xl bg-white px-3 py-2 text-[15px] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#F8C24D]"
                  />
                  <div className="mt-2 flex items-center justify-between gap-3">
                    {/* pista de estado para depurar */}
                    <div className="text-xs text-slate-600">
                      {!hostId && <span>Sin ID de anfitrión. </span>}
                      {!isSocketConnected && <span>Chat desconectado. </span>}
                    </div>
                    <button
                      type="submit"
                      // dejamos que se pueda intentar enviar; el handler valida y alerta
                      disabled={enviandoMsg || !mensajeHost.trim()}
                      className="px-4 py-2 rounded-lg bg-black text-white disabled:opacity-50"
                    >
                      {enviandoMsg ? "Enviando…" : "Enviar"}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* comentarios */}
            <div
              className="max-h-60 overflow-y-auto pr-2 space-y-3"
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: "#F8C24D #FFF6DB",
              }}
            >
              {(propiedad.calificaciones || []).map((c) => (
                <div
                  key={c.id_calificacion || Math.random()}
                  className="flex items-start gap-3 border-b border-slate-200 pb-2"
                >
                  <div>
                    <p className="font-semibold text-slate-800">
                      ⭐ {c.puntuacion}
                    </p>
                    <p className="text-slate-700 mt-1 italic">
                      "{c.comentario}"
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {new Date(c.fecha).toLocaleDateString("es-AR")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* recomendados */}
        <section className="max-w-6xl mx-auto px-4 py-12">
          <h3 className="text-2xl font-bold mb-6">Recomendados para vos</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recomendadas.map((r) => (
              <PropertyCard
                key={r.id_propiedad}
                id_propiedad={r.id_propiedad}
                image={r.imagen_url || FALLBACK_CARD}
                title={r.titulo}
                subtitle={r.subtitulo}
                rating={r.rating}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
