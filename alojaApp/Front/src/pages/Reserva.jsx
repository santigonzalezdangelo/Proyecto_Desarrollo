import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import PropertyCard from "../components/PropertyCard";
import SearchButton from "../components/SearchButton";
import MapView from "../components/MapView";

const API_URL = "http://localhost:4000/api";

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

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("id") || 1;

    // 🧱 MOCK con anfitrión + reseña
    const mockPropiedad = {
      id_propiedad: id,
      nombre_de_fantasia: "Obelisco View Apartment",
      descripcion: "Moderno departamento frente al Obelisco con vistas panorámicas.",
      precio_por_noche: 95,
      localidad: "Buenos Aires",
      ciudad: "CABA",
      pais: "Argentina",
      latitud: -34.6037,
      longitud: -58.3816,
      fotos: [
        {
          id_url: 1,
          nombre: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200",
        },
      ],
      anfitrion: {
        nombre: "María Agustina",
        foto: "https://randomuser.me/api/portraits/women/68.jpg",
        puntuacion: 4.92,
        evaluaciones: 25,
        años: 6,
      },
      calificaciones: [
        {
          id_calificacion: 1,
          nombre_huesped: "Lucía Fernández",
          puntuacion: 5,
          comentario:
            "Excelente ubicación y limpieza impecable. María fue muy amable y respondió rápido a todo.",
          fecha: "2024-09-10",
        },
      ],
    };

    const mockRecomendadas = [
      {
        id_propiedad: 101,
        imagen_url: "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=800",
        titulo: "Loft en Palermo",
        subtitulo: "Cerca del subte, ideal para parejas",
        rating: 4.7,
      },
      {
        id_propiedad: 102,
        imagen_url: "https://images.unsplash.com/photo-1505691723518-36a5ac3be353?w=800",
        titulo: "Casa en Bariloche",
        subtitulo: "Vista al lago Nahuel Huapi",
        rating: 4.9,
      },
    ];

    setTimeout(() => {
      setPropiedad(mockPropiedad);
      setRecomendadas(mockRecomendadas);
      setLoading(false);
    }, 400);

    /*
    🔌 CONEXIÓN REAL (DESCOMENTAR CUANDO EL BACKEND FUNCIONE)
    async function fetchData() {
      try {
        // 🔹 Propiedad actual
        const res = await fetch(`${API_URL}/propiedades/${id}`);
        const data = await res.json();
        setPropiedad(data);

        // 🔹 Recomendadas desde el backend (excluye la actual)
        const recRes = await fetch(`${API_URL}/propiedades/destacadas?excludeId=${id}`);
        const recData = await recRes.json();
        setRecomendadas(recData);
      } catch (err) {
        console.error("Error cargando datos:", err);
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

  const inicio = new Date(form.fecha_inicio);
  const fin = new Date(form.fecha_fin);

  // 🧩 Validación: la fecha de fin debe ser posterior a la de inicio
  if (fin <= inicio) {
    alert("La fecha de fin debe ser posterior a la fecha de inicio.");
    return;
  }

  setCalculando(true);

  const dias = Math.ceil(Math.abs(fin - inicio) / (1000 * 60 * 60 * 24));
  const precioTotal = dias * (propiedad?.precio_por_noche || 0);

  setTimeout(() => {
    setForm((f) => ({ ...f, precio_total: precioTotal }));
    setCalculando(false);
  }, 300);
}


  if (loading) return <p className="p-8 text-center">Cargando...</p>;

  const comentario = propiedad.calificaciones?.[0]; // mostramos solo uno

  return (
    <div className="min-h-screen bg-[#FFF6DB] pb-10">
      <Navbar active="inicio" />
        <div className="pt-[70px]"> {/* ajusta la altura del navbar */}
          <header
            className="p-6 text-[#0F172A] font-bold text-xl"
            style={{ backgroundColor: "#F8C24D" }}
          >
            <div className="max-w-6xl mx-auto">{propiedad.nombre_de_fantasia}</div>
          </header>
        {/* 🏡 descripción + reserva */}
        <main className="max-w-6xl mx-auto px-4 py-10 grid md:grid-cols-2 gap-10">
          {/* IZQUIERDA: CARRUSEL */}
          <section className="flex flex-col gap-4">
            <img
              src={propiedad.fotos?.[0]?.nombre}
              alt={propiedad.nombre_de_fantasia}
              className="rounded-2xl shadow-lg w-full h-auto"
            />
            <h2 className="text-2xl font-bold mt-2">{propiedad.descripcion}</h2>
            <p className="text-slate-700">
              {propiedad.localidad}, {propiedad.ciudad}, {propiedad.pais}
            </p>
            <p className="font-semibold">💰 ${propiedad.precio_por_noche} por noche</p>

            {propiedad.puntuacion_promedio > 0 && (
              <p className="text-lg text-yellow-600 font-semibold flex items-center gap-2">
                ⭐ {propiedad.puntuacion_promedio.toFixed(1)} / 5
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
              onClick={() => alert("Reserva simulada")}
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
                  Anfitrión: {propiedad.anfitrion?.nombre}{" "}
                  {propiedad.anfitrion?.apellido}
                </h4>
                <p className="text-sm text-slate-600"></p>
              </div>
            </div>

            {/* 💬 COMENTARIOS */}
            {propiedad.calificaciones?.length > 0 && (
              <div className="border-t border-black/10 pt-4">
                <h3 className="text-xl font-semibold mb-2">Comentarios</h3>
                {propiedad.calificaciones.map((c) => (
                  <div
                    key={c.id_calificacion}
                    className="flex items-start gap-3 mb-4"
                  >
                    <img
                      src="https://randomuser.me/api/portraits/women/44.jpg"
                      alt="Huésped"
                      className="w-12 h-12 rounded-full object-cover shadow-sm"
                    />
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
