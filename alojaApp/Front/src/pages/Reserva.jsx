// src/pages/Reserva.jsx
import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import PropertyCard from "../components/PropertyCard";
import SearchButton from "../components/SearchButton";
import MapView from "../components/MapView";

const API_URL = "http://localhost:4000/api";
const CONFIRM_RESERVATION_URL = "http://localhost:4000/api/reservations/createReservation";

export default function Reserva() {
  const [propiedad, setPropiedad] = useState(null);
  const [recomendadas, setRecomendadas] = useState([]);
  const [form, setForm] = useState({
    fecha_inicio: "",
    fecha_fin: "",
    precio_total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [calculando, setCalculando] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("id") || 1;

    async function fetchData() {
      try {
        setErrorMsg("");

        // 1) Propiedad actual
        const res = await fetch(`${API_URL}/properties/${id}`);
        if (!res.ok) throw new Error(`GET /properties/${id} -> ${res.status}`);
        const data = await res.json();
        setPropiedad(data);

        // 2) Recomendadas desde el backend (excluye la actual)
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

  if (loading) return <p className="p-8 text-center">Cargando...</p>;
  if (errorMsg) return <p className="p-8 text-center">{errorMsg}</p>;
  if (!propiedad) return <p className="p-8 text-center">Propiedad no encontrada.</p>;

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

              {/* Flechas */}
              {propiedad.fotos?.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setCurrentIndex((prev) =>
                        prev === 0 ? propiedad.fotos.length - 1 : prev - 1
                      )
                    }
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white text-[#0F172A] rounded-full w-10 h-10 flex items-center justify-center shadow-md"
                    aria-label="Anterior"
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
                    aria-label="Siguiente"
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

            {propiedad.puntuacion_promedio > 0 && (
              <p className="text-lg text-yellow-600 font-semibold flex items-center gap-2">
                ⭐ {Number(propiedad.puntuacion_promedio).toFixed(1)} / 5
                <span className="text-sm text-slate-700">
                  ({propiedad.calificaciones?.length || 0} reseñas)
                </span>
              </p>
            )}
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
              onClick={() => fetch(CONFIRM_RESERVATION_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id_usuario: propiedad.id_anfitrion,
                  id_propiedad: propiedad.id_propiedad,
                  fecha_inicio: form.fecha_inicio,})})}
              disabled={form.precio_total <= 0}
              label="Confirmar reserva"
            />
          </section>
        </main>

        {/* 🗺️ mapa + anfitrión + comentarios */}
        <section className="max-w-6xl mx-auto px-4 py-10 grid md:grid-cols-2 gap-10 items-start">
          {/* 🗺️ mapa */}
          <div className="relative z-0">
            <MapView
              lat={parseFloat(propiedad.latitud)}
              lng={parseFloat(propiedad.longitud)}
              title={propiedad.nombre_de_fantasia}
            />
          </div>

          {/* 🧍 anfitrión + comentarios */}
          <div className="flex flex-col gap-8 justify-start bg-[#FFF6DB] p-4 rounded-2xl">
            {/* anfitrión */}
            <div className="flex items-center gap-4">
              <img
                src="https://via.placeholder.com/150?text=Anfitrion"
                alt={propiedad.anfitrion?.nombre}
                className="w-24 h-24 rounded-full object-cover shadow-md"
              />
              <div>
                <h4 className="font-semibold text-lg">
                  Anfitrión: {propiedad.anfitrion?.nombre} {propiedad.anfitrion?.apellido}
                </h4>
              </div>
            </div>

            {/* 💬 COMENTARIOS */}
            {propiedad.calificaciones?.length > 0 && (
              <div className="border-t border-black/10 pt-4">
                <h3 className="text-xl font-semibold mb-2">Comentarios</h3>
                {propiedad.calificaciones.map((c) => (
                  <div key={c.id_calificacion} className="flex items-start gap-3 mb-4">
                    <img
                      src="https://randomuser.me/api/portraits/women/44.jpg"
                      alt="Huésped"
                      className="w-12 h-12 rounded-full object-cover shadow-sm"
                    />
                    <div>
                      <p className="font-semibold text-slate-800">⭐ {c.puntuacion}</p>
                      <p className="text-slate-700 mt-1 italic">"{c.comentario}"</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {new Date(c.fecha).toLocaleDateString("es-AR")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* 🌟 recomendados */}
        <section className="max-w-6xl mx-auto px-4 py-12">
          <h3 className="text-2xl font-bold mb-6">Recomendados para vos</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recomendadas.map((r) => (
              <PropertyCard
                key={r.id_propiedad}
                image={r.imagen_url}
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
