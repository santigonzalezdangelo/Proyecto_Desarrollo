 import React, { useEffect, useState } from "react";
import PropertyCard from "../components/PropertyCard";

/**
 * Página de resultados de búsqueda – AlojaApp
 * Recupera los parámetros enviados desde Home.jsx y consulta el backend.
 */

export default function Search() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Extraer parámetros de la URL
    const params = new URLSearchParams(window.location.search);
    const fecha_inicio = params.get("fecha_inicio");
    const fecha_fin = params.get("fecha_fin");
    const huespedes = params.get("huespedes");
    const id_localidad = params.get("id_localidad");
    const precio_max = params.get("precio_max");

    // Construir query string solo con valores válidos
    const queryParams = new URLSearchParams();
    if (fecha_inicio) queryParams.append("fecha_inicio", fecha_inicio);
    if (fecha_fin) queryParams.append("fecha_fin", fecha_fin);
    if (huespedes) queryParams.append("huespedes", huespedes);
    if (id_localidad) queryParams.append("id_localidad", id_localidad);
    if (precio_max) queryParams.append("precio_max", precio_max);

    async function fetchProperties() {
      try {
        const response = await fetch(
          `http://localhost:4000/propiedades/disponibles?${queryParams.toString()}`
        );
        if (!response.ok) throw new Error(`Error ${response.status}`);
        const data = await response.json();
        setProperties(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error cargando propiedades:", err);
        setError("No se pudieron cargar las propiedades. Intenta nuevamente.");
      } finally {
        setLoading(false);
      }
    }

    fetchProperties();
  }, []);

  // === UI ===
  if (loading) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-20 text-center text-slate-600">
        Buscando propiedades disponibles...
      </section>
    );
  }

  if (error) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-20 text-center text-red-600">
        {error}
      </section>
    );
  }

  if (properties.length === 0) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-20 text-center text-slate-600">
        No se encontraron propiedades que coincidan con tu búsqueda.
      </section>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-3xl font-semibold text-slate-900 mb-6">
        Resultados de la búsqueda
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {properties.map((p) => (
          <PropertyCard
            key={p.id_propiedad}
            image={p.imagen_url || "https://via.placeholder.com/400x250?text=AlojaApp"}
            title={p.titulo || "Propiedad sin título"}
            subtitle={`${p.localidad || ""}${p.precio ? ` – $${p.precio}` : ""}`}
            rating={p.rating || p.puntuacion || 0}
          />
        ))}
      </div>
    </main>
  );
}
