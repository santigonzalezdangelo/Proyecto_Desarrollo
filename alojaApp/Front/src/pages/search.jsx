// Front/src/pages/search.jsx
import React from "react";

export default function Search() {
  const params = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
  const q = {
    location: params.get("location") || "",
    checkIn: params.get("checkIn") || "",
    checkOut: params.get("checkOut") || "",
    guests: params.get("guests") || "",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#FFF6DB" }}>
      <div className="mx-auto max-w-5xl p-6">
        <h1 className="text-3xl font-bold mb-4">Resultados</h1>
        <p className="text-slate-700 mb-6">
          <strong>Destino:</strong> {q.location || "—"} · <strong>Llegada:</strong> {q.checkIn || "—"} ·{" "}
          <strong>Salida:</strong> {q.checkOut || "—"} · <strong>Huéspedes:</strong> {q.guests || "—"}
        </p>

        {/* TODO: acá harías el fetch a tu API/Strapi con estos parámetros */}
        <div className="rounded-xl bg-white p-6 shadow">Acá listarías las propiedades filtradas…</div>
      </div>
    </div>
  );
}
