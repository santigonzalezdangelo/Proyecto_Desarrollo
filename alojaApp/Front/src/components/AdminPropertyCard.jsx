import React from 'react';
import { Link } from 'react-router-dom';

const AdminPropertyCard = ({ propiedad, onEliminar, onCambiarEstado }) => {
    const { 
        id_propiedad, 
        descripcion,
        precio_por_noche, 
        localidad_nombre,
        url_foto_principal,
        estado_publicacion
    } = propiedad;
    
    return (
        <div className="flex flex-col md:flex-row gap-5 p-5 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white">
            
            {/* Columna de Imagen */}
            <img 
                src={url_foto_principal || 'https://via.placeholder.com/150'} 
                alt={descripcion} 
                className="w-full md:w-48 h-40 object-cover rounded-lg shrink-0" 
            />
            
            {/* Columna de Información */}
            <div className="flex-grow flex flex-col">
                <h3 className="text-xl font-bold mb-1 text-slate-800">{descripcion}</h3>
                <p className="text-sm mb-3 text-slate-500">{localidad_nombre}</p>
                <div className="mt-auto">
                    <span className="text-xl font-bold text-slate-800">
                        ${precio_por_noche} <span className="text-sm font-normal text-slate-600">/noche</span>
                    </span>
                </div>
            </div>

            {/* Columna de Acciones */}
            <div className="flex flex-col justify-center gap-2 shrink-0 md:w-44">
                <span className={`text-center px-3 py-1 text-xs font-bold uppercase rounded-full mb-2 ${
                    estado_publicacion === 'PUBLICADO' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                }`}>
                    {estado_publicacion}
                </span>
                <Link 
                    to={`/propiedades/editar/${id_propiedad}`} 
                    className="text-center font-semibold text-sm py-2 px-3 rounded-lg text-white hover:opacity-90 transition-opacity" 
                    style={{ backgroundColor: "#EABA4B" }}
                >
                    📝 Editar
                </Link>
                
                {/* --- LÓGICA DE BOTÓN CORREGIDA Y DEFINITIVA --- */}
                <button
                    onClick={() => onCambiarEstado(id_propiedad, estado_publicacion === 'PUBLICADO' ? 'BORRADOR' : 'PUBLICADO')}
                    className={`text-center font-semibold text-sm py-2 px-3 rounded-lg text-white transition-colors ${
                        estado_publicacion === 'PUBLICADO' 
                            ? 'bg-yellow-500 hover:bg-yellow-600'  // Amarillo para "Despublicar"
                            : 'bg-green-600 hover:bg-green-700'    // VERDE para "Publicar"
                    }`}
                >
                    {estado_publicacion === 'PUBLICADO' ? '⏸️ Despublicar' : '▶️ Publicar'}
                </button>

                <button 
                    onClick={() => onEliminar(id_propiedad)} 
                    className="text-center font-semibold text-sm py-2 px-3 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
                >
                    🗑️ Eliminar
                </button>
            </div>
        </div>
    );
};

export default AdminPropertyCard;