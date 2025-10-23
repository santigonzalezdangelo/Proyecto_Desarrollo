import React from "react";
import { Link } from "react-router-dom";

const AdminPropertyCard = ({ propiedad, onEliminar }) => {
  const {
    id_propiedad,
    descripcion,
    precio_por_noche,
    localidad_nombre,
    url_foto_principal,
    estado_publicacion,
  } = propiedad;

  return (
    <div className="flex flex-col md:flex-row gap-5 p-5 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white">
      {/* Columna de Imagen */}
      <img
        src={url_foto_principal || "https://via.placeholder.com/150"}
        alt={descripcion}
        className="w-full md:w-48 h-40 object-cover rounded-lg shrink-0"
      />

      {/* Columna de Información */}
      <div className="flex-grow flex flex-col">
        <h3 className="text-xl font-bold mb-1 text-slate-800">{descripcion}</h3>
        <p className="text-sm mb-3 text-slate-500">{localidad_nombre}</p>
        <div className="mt-auto">
          <span className="text-xl font-bold text-slate-800">
            ${precio_por_noche}{" "}
            <span className="text-sm font-normal text-slate-600">/noche</span>
          </span>
        </div>
      </div>

      {/* Columna de Acciones */}
      <div className="flex flex-col justify-center items-end gap-3 shrink-0 md:w-48">
        <span
          className={`text-center px-3 py-1 text-xs font-bold uppercase rounded-full mb-2 ${
            estado_publicacion === "DISPONIBLE"
              ? "bg-green-100 text-green-800"
              : "bg-orange-100 text-orange-800"
          }`}
        >
          {estado_publicacion}
        </span>

        {/* Botones cuadrados con emojis */}
        <div className="flex flex-col gap-2">
          <Link
            to={`/propiedades/editar/${id_propiedad}`}
            className="w-12 h-12 flex items-center justify-center rounded-lg text-white hover:opacity-90 transition-opacity text-2xl"
            style={{ backgroundColor: "#EABA4B" }}
            title="Editar propiedad"
          >
            ✏️
          </Link>

          <button
            onClick={() => onEliminar(id_propiedad)}
            className="w-12 h-12 flex items-center justify-center rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors text-2xl"
            title="Eliminar propiedad"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminPropertyCard;
