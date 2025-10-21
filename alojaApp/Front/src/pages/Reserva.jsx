// src/pages/Reserva.jsx
import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import PropertyCard from "../components/PropertyCard";
import SearchButton from "../components/SearchButton";
import MapView from "../components/MapView";

const API_URL = "http://localhost:4000/api";
const CONFIRM_RESERVATION_URL = "http://localhost:4000/api/reservations/createReservation";
const CURRENT_USER_URL = "http://localhost:4000/api/auth/current";

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

  // 🔹 Cargar propiedad, usuario actual y recomendadas
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("id") || 1;

    async function fetchData() {
      try {
        setErrorMsg("");

        // 1️⃣ Traer usuario actual
        const userRes = await fetch(CURRENT_USER_URL, { credentials: "include" });
        if (userRes.ok) {
          const userData = await userRes.json();
          setUsuarioActual(userData);
        } else {
          console.warn("No se pudo obtener el usuario actual");
        }

        // 2️⃣ Propiedad actual
        const res = await fetch(`${API_URL}/properties/${id}`);
        if (!res.ok) throw new Error(`GET /properties/${id} -> ${res.status}`);
        const data = await res.json();
        setPropiedad(data);

        // 3️⃣ Recomendadas desde el backend
        const recRes = await fetch(`${API_URL}/properties/destacadas?excludeId=${id}`);
        if (!recRes.ok) throw new Error(`GET /properties/destacadas -> ${recRes.status}`);
        const recData = await recRes.json();
        setRecomendadas(recData);
      } catch (err) {
        console.error("Error cargando datos:", err);
        setErrorMsg("No pudimos cargar la propiedad. Intentá nuevamente.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // 💰 Calcular precio usando el endpoint del backend
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

  // 🏠 Crear reserva en el backend
  async function handleConfirmarReserva() {
    try {
      if (!usuarioActual?.id_usuario) {
        alert("Tenés que iniciar sesión para realizar una reserva.");
        return;
      }

      if (!form.fecha_inicio || !form.fecha_fin) {
        alert("Seleccioná ambas fechas antes de confirmar.");
        return;
      }

      const body = {
        id_usuario: usuarioActual.id_usuario,
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

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || "Error al crear la reserva");

      alert(`✅ Reserva creada correctamente.\nCódigo de reserva: ${data.id_reserva || "(sin código)"}`);
      setForm({ fecha_inicio: "", fecha_fin: "", precio_total: 0 });
    } catch (error) {
      console.error("Error al crear reserva:", error);
      alert(`❌ No se pudo crear la reserva: ${error.message}`);
    }
  }

  if (loading) return <p className="p-8 text-center">Cargando...</p>;
  if (errorMsg) return <p className="p-8 text-center">{errorMsg}</p>;
  if (!propiedad) return <p className="p-8 text-center">Propiedad no encontrada.</p>;

  return (
    <div className="min-h-screen bg-[#FFF6DB] pb-10">
      <Navbar active="inicio" />
      <div className="pt-[70px]">
        <header className="p-6 text-[#0F172A] font-bold text-xl" style={{ backgroundColor: "#F8C24D" }}>
          <div className="max-w-6xl mx-auto">{propiedad.nombre_de_fantasia || "Propiedad"}</div>
        </header>

        {/* 🏡 descripción + reserva */}
        <main className="max-w-6xl mx-auto px-4 py-10 grid md:grid-cols-2 gap-10">
          {/* IZQUIERDA: CARRUSEL */}
          <section className="flex flex-col gap-4">
            <div className="relative w-full rounded-2xl overflow-hidden shadow-lg">
              <img
                src={
                  propiedad.fotos?.[currentIndex]?.url_foto ||
                  "https://via.placeholder.com/1200x800?text=Imagen+no+disponible"
                }
                alt={`Foto ${currentIndex + 1}`}
                className="w-full h-auto object-cover rounded-2xl transition-all duration-500"
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
            <p className="text-slate-700">
              {propiedad.localidad}, {propiedad.ciudad}, {propiedad.pais}
            </p>
            <p className="font-semibold">💰 ${propiedad.precio_por_noche} por noche</p>
          </section>

          {/* DERECHA: FORMULARIO */}
          <section className="bg-white p-6 rounded-2xl shadow-lg flex flex-col gap-4 self-start">
            <h3 className="text-xl font-semibold">Reservar tu estadía</h3>

            <label className="flex flex-col gap-1">
              Fecha de inicio:
              <input
                type="date"
                value={form.fecha_inicio}
                onChange={(e) => setForm({ ...form, fecha_inicio: e.target.value })}
                className="border rounded px-3 py-2"
              />
            </label>

            <label className="flex flex-col gap-1">
              Fecha de fin:
              <input
                type="date"
                value={form.fecha_fin}
                min={form.fecha_inicio || undefined}
                onChange={(e) => setForm({ ...form, fecha_fin: e.target.value })}
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
      </div>
    </div>
  );
}
