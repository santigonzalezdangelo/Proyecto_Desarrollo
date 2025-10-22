// src/pages/Home.jsx
import React, { useEffect, useState, useRef } from "react";
import Navbar from "../components/NavBar";
import PropertyCard from "../components/PropertyCard";
import SearchButton from "../components/SearchButton";

export default function Home() {
  const [localidades, setLocalidades] = useState([]);
  const [selectedLocalidad, setSelectedLocalidad] = useState(null);
  const [inputLocalidad, setInputLocalidad] = useState("");
  const [form, setForm] = useState({
    checkIn: "",
    checkOut: "",
    guests: 1,
    maxPrice: "",
  });
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔍 Buscar localidades desde el backend
  async function buscarLocalidades(q) {
    if (!q || q.length < 2) {
      setLocalidades([]);
      return;
    }
    try {
      const res = await fetch(
        `http://localhost:4000/api/localidades/search?q=${encodeURIComponent(q)}`
      );
      if (!res.ok) throw new Error("Error buscando localidades");
      const data = await res.json();
      setLocalidades(data);
    } catch (err) {
      console.error("Error buscando localidades:", err);
    }
  }

  // 🧭 Generar URL con id_localidad real
  function buildSearchURL() {
    const params = new URLSearchParams({
      fecha_inicio: form.checkIn || "",
      fecha_fin: form.checkOut || "",
      huespedes: form.guests || "",
      id_localidad: selectedLocalidad?.id_localidad || "",
    });

    if (form.maxPrice && String(form.maxPrice).trim() !== "") {
      params.set("precio_max", String(form.maxPrice));
    }

    return `/propiedades-filtradas?${params.toString()}`;
  }

  // 🚀 Redirigir al hacer clic en Buscar
  function handleSearch() {
    const url = buildSearchURL();
    if (!selectedLocalidad?.id_localidad) {
      alert("Seleccioná una localidad válida.");
      return;
    }
    window.location.assign(url);
  }

  // 🏡 Cargar propiedades destacadas
  useEffect(() => {
    async function fetchProperties() {
      try {
        const res = await fetch("http://localhost:4000/api/properties/destacadas");
        if (!res.ok) throw new Error("Error cargando destacadas");
        const data = await res.json();

        const arr = (data || []).map((p, i) => ({
          _key: p.id_propiedad || `p-${i}`,
          _titulo: p.descripcion || p.nombre || "Propiedad",
          _imagen:
            p.imagen_url ||
            p.imagen_principal ||
            "https://via.placeholder.com/400x250?text=AlojaApp",
          _sub: `${p.ciudad || ""}${p.pais ? ", " + p.pais : ""}`,
          _rating: Number(p.rating || 0),
        }));

        setItems(arr);
      } catch (err) {
        console.error("Error cargando propiedades destacadas:", err);
        setItems([]);
      } finally {
        setLoading(false);
      }
    }

    fetchProperties();
  }, []);

  return (
    <div className="min-h-screen bg-[#FFF6DB] pb-10">
      <Navbar active="inicio" />

      <section className="relative w-full pt-[90px] pb-10">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url(/images/fondoHome.png)" }}
        ></div>
        <div className="absolute inset-0 bg-[#F8C24D]/40"></div>

        <div className="relative max-w-6xl mx-auto p-6 flex flex-col gap-4">
          <h1 className="text-4xl font-extrabold text-white drop-shadow">
            Encontrá alojamientos en alquiler
          </h1>

          {/* 🔍 Barra de búsqueda */}
          <div className="bg-white p-5 rounded-2xl shadow-lg flex flex-wrap gap-4 items-end">
            {/* Localidad */}
            <div className="flex flex-col flex-1 min-w-[200px]">
              <label className="text-sm font-semibold mb-1">Localidad</label>
              <input
                type="text"
                list="localidades-list"
                placeholder="Ingresá una localidad"
                value={inputLocalidad}
                onChange={(e) => {
                  const val = e.target.value;
                  setInputLocalidad(val);
                  buscarLocalidades(val);
                  const match = localidades.find(
                    (l) => l.nombre.toLowerCase() === val.toLowerCase()
                  );
                  setSelectedLocalidad(match || null);
                }}
                className="border rounded-md px-3 py-2"
              />
              <datalist id="localidades-list">
                {localidades.map((l) => (
                  <option
                    key={l.id_localidad}
                    value={l.nombre}
                    data-id={l.id_localidad}
                  />
                ))}
              </datalist>
            </div>

            {/* Fechas */}
            <div className="flex flex-col">
              <label className="text-sm font-semibold mb-1">Check-in</label>
              <input
                type="date"
                value={form.checkIn}
                onChange={(e) => setForm({ ...form, checkIn: e.target.value })}
                className="border rounded-md px-3 py-2"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-semibold mb-1">Check-out</label>
              <input
                type="date"
                value={form.checkOut}
                onChange={(e) => setForm({ ...form, checkOut: e.target.value })}
                className="border rounded-md px-3 py-2"
              />
            </div>

            {/* Huéspedes */}
            <div className="flex flex-col">
              <label className="text-sm font-semibold mb-1">Huéspedes</label>
              <input
                type="number"
                min="1"
                value={form.guests}
                onChange={(e) => setForm({ ...form, guests: e.target.value })}
                className="border rounded-md px-3 py-2 w-24"
              />
            </div>
            {/* 💰 Precio máximo */}
            <div className="flex flex-col">
              <label className="text-sm font-semibold mb-1">Precio máximo</label>
              <input
                type="number"
                min="0"
                value={form.maxPrice}
                onChange={(e) =>
                  setForm({ ...form, maxPrice: e.target.value })
                }
                className="border rounded-md px-3 py-2 w-32"
                placeholder="Ej: 80000"
              />
            </div>


            {/* Botón */}
            <SearchButton onClick={handleSearch} label="Buscar" />
          </div>
        </div>
      </section>

      {/* 🏡 Propiedades destacadas */}
      {loading ? (
        <p className="text-center mt-8 text-slate-700">
          Cargando propiedades destacadas...
        </p>
      ) : items.length ? (
        <section className="max-w-6xl mx-auto px-4 py-10">
          <h2 className="text-2xl font-bold mb-6">Propiedades destacadas</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {items.map((p) => (
              <PropertyCard
                key={p._key}
                image={p._imagen}
                title={p._titulo}
                subtitle={p._sub}
                rating={p._rating}
              />
            ))}
          </div>
        </section>
      ) : (
        <p className="text-center mt-8 text-slate-700">
          No se encontraron propiedades destacadas.
        </p>
      )}
    </div>
  );
}
