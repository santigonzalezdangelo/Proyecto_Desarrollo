<<<<<<< HEAD
// src/pages/propiedades-encontradas.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import PropertyCard from "../components/PropertyCard";


// ✅ Base de la API (usa variable de entorno si existe)
console.log("[VITE] VITE_API_BASE =", import.meta.env?.VITE_API_BASE);

=======
import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';

// ====== CONFIGURACIÓN DE LA API (con Fetch) ======
const API_BASE = import.meta.env?.VITE_API_BASE || 'http://localhost:4000/api'; // Usa variable de entorno o un valor por defecto
>>>>>>> e85436122940efa5c43b059457ed867ed7f0cfef

// ... (El resto de los componentes Navbar, AdminSubNav, AdminPropertyCard no necesitan cambios) ...
// NOTE: Para brevedad, el código de los otros componentes se omite.
// El código completo está en el historial si lo necesitas.

function Navbar({ active = "mis-propiedades" }) {
    const items = [
        { key: "inicio", label: "Inicio", href: "/" },
        { key: "mis-propiedades", label: "Mis Propiedades", href: "/administrarPropiedades" },
        { key: "perfil", label: "Perfil", href: "/perfil" },
        { key: "logout", label: "Cerrar Sesión", href: "/logout" },
    ];
    return (
        <header className="sticky top-0 z-50 w-full shadow-md" style={{ backgroundColor: "#F8C24D" }}>
            <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
                <Link to="/" aria-label="Ir al inicio"><img src="/images/logo.png" alt="AlojaApp" className="object-contain" style={{ maxHeight: "70px" }} /></Link>
                <nav className="flex items-center gap-6">
                    {items.map((it) => (
                        <Link key={it.key} to={it.href}
                            className={`text-base font-semibold transition-all duration-200 ${active === it.key ? 'pb-1 border-b-2' : 'opacity-80 hover:opacity-100'}`}
                            style={{ color: "#1e293b", borderColor: "#1e293b" }}>
                            {it.label}
                        </Link>
                    ))}
                </nav>
            </div>
        </header>
    );
}

<<<<<<< HEAD
/* ===============================
   Navbar simple (logo + hamburguesa)
   =============================== */

=======
function AdminSubNav({ searchText, onSearchChange, status, onStatusChange, onAdd }) {
    return (
        <div className="mb-8 p-4 rounded-xl shadow-lg" style={{ backgroundColor: "#FDF6E3" }}>
            <div className="flex flex-col md:flex-row items-center gap-4 w-full">
                <div className="flex flex-col sm:flex-row gap-4 w-full flex-grow">
                    <select
                        value={status}
                        onChange={onStatusChange}
                        className="w-full sm:w-auto p-3 border rounded-lg font-semibold focus:outline-none focus:ring-2"
                        style={{ borderColor: "#F8C24D", color: "#1e293b", '--tw-ring-color': "#F8C24D", backgroundColor: "#FFFFFF" }}
                    >
                        <option value="TODOS">Todos los estados</option>
                        <option value="PUBLICADO">Publicado</option>
                        <option value="BORRADOR">Borrador</option>
                    </select>
                    <input
                        type="text"
                        placeholder="Buscar por descripción o localidad..."
                        value={searchText}
                        onChange={onSearchChange}
                        className="w-full flex-grow p-3 border rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2"
                        style={{ borderColor: "#F8C24D", color: "#1e293b", '--tw-ring-color': "#F8C24D", backgroundColor: "#FFFFFF" }}
                    />
                </div>
                <button onClick={onAdd} className="w-full md:w-auto flex-shrink-0 flex items-center justify-center gap-2 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-transform hover:scale-105" style={{ backgroundColor: "#16A34A" }}>
                    <PlusIcon /> Añadir Propiedad
                </button>
            </div>
        </div>
    );
}
>>>>>>> e85436122940efa5c43b059457ed867ed7f0cfef

function AdminPropertyCard({ propiedad, onEliminar, onCambiarEstado, onEdit }) {
    const { id_propiedad, descripcion, precio_por_noche, localidad_nombre, tipo_propiedad_nombre, url_foto_principal, estado_publicacion } = propiedad;
    const esPublicado = estado_publicacion === 'PUBLICADO';

    return (
        <div className="flex flex-col md:flex-row gap-6 p-5 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300" style={{ backgroundColor: "#FFFFFF" }}>
            <img src={url_foto_principal || 'https://placehold.co/208x176/FDF6E3/1e293b?text=Sin+Imagen'} alt={descripcion} className="w-full md:w-52 h-44 object-cover rounded-lg shrink-0" />
            <div className="flex-grow flex flex-col">
                <h3 className="text-2xl font-bold mb-1" style={{ color: "#1e293b" }}>{descripcion}</h3>
                <p className="text-base font-medium" style={{ color: "#475569" }}>{tipo_propiedad_nombre}</p>
                <p className="text-sm mb-3" style={{ color: "#475569" }}>{localidad_nombre}</p>
                <div className="mt-auto">
                    <span className="text-2xl font-bold" style={{ color: "#1e293b" }}>${precio_por_noche} <span className="text-sm font-normal text-slate-600">/noche</span></span>
                </div>
            </div>
            <div className="flex flex-col justify-center gap-3 shrink-0 md:w-48">
                 <span className={`text-center px-3 py-1 text-sm font-bold uppercase rounded-full ${esPublicado ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {estado_publicacion}
                </span>
                <button 
                    onClick={() => onEdit(propiedad)} 
                    className="text-center font-bold text-sm py-3 px-4 rounded-lg hover:opacity-90 transition-opacity" 
                    style={{ backgroundColor: "#F8C24D", color: "#1e293b" }}
                >
                    📝 Editar Propiedad
                </button>
                <button
                    onClick={() => onCambiarEstado(id_propiedad, esPublicado ? 'BORRADOR' : 'PUBLICADO')}
                    className={`text-center font-bold text-sm py-3 px-4 rounded-lg text-white transition-colors ${esPublicado ? 'bg-slate-500 hover:bg-slate-600' : 'bg-green-600 hover:bg-green-700'}`}
                >
                    {esPublicado ? '⏸️ Despublicar' : '▶️ Publicar'}
                </button>
                <button onClick={() => onEliminar(id_propiedad)} className="text-center font-bold text-sm py-3 px-4 rounded-lg text-white transition-colors" style={{ backgroundColor: "#DC2626" }}>
                    🗑️ Eliminar
                </button>
            </div>
        </div>
    );
}

<<<<<<< HEAD
function FilterFab({ onClick }) {
  const TEXT_DARK = "#0F172A";
  return (
    <button
      type="button"
      aria-label="Abrir filtros"
      onClick={onClick}
      className="fixed rounded-xl shadow-lg hover:scale-105 transition-transform"
      style={{
        // alineado con tu navbar sin modificarlo
        top: 10,              // distancia desde arriba (navbar ~72px de alto → este valor se ve bien)
        right: 24,
           // margen derecho
        width: 52,
        height: 52,
        backgroundColor: "#EABA4B",
        color: TEXT_DARK,
        zIndex: 9999,         // por encima del navbar
      }}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
        {/* Ícono de filtros (3 sliders) */}
        <line x1="4" y1="5" x2="20" y2="5" stroke={TEXT_DARK} strokeWidth="2" strokeLinecap="round" />
        <circle cx="10" cy="5" r="2" fill={TEXT_DARK} />
        <line x1="4" y1="12" x2="20" y2="12" stroke={TEXT_DARK} strokeWidth="2" strokeLinecap="round" />
        <circle cx="16" cy="12" r="2" fill={TEXT_DARK} />
        <line x1="4" y1="19" x2="20" y2="19" stroke={TEXT_DARK} strokeWidth="2" strokeLinecap="round" />
        <circle cx="8" cy="19" r="2" fill={TEXT_DARK} />
      </svg>
    </button>
  );
}

=======
// ====== PÁGINA PRINCIPAL: ADMINISTRAR PROPIEDADES ======
export default function AdministrarPropiedades() {
    // ... (Estados sin cambios)
    const [propiedades, setPropiedades] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [filterStatus, setFilterStatus] = useState("TODOS");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [propertyToEdit, setPropertyToEdit] = useState(null);
>>>>>>> e85436122940efa5c43b059457ed867ed7f0cfef

    // Carga de propiedades (sin cambios)
    useEffect(() => {
        const fetchPropiedades = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await fetch(`${API_BASE}/properties/my-properties`, { credentials: 'include' });
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.error || `Error ${response.status}`);
                }
                const data = await response.json();
                const mappedData = data.map(p => ({
                    ...p,
                    localidad_nombre: p.localidad?.nombre || 'N/A',
                    tipo_propiedad_nombre: p.tipoPropiedad?.nombre || 'N/A',
                    url_foto_principal: p.fotos?.[0]?.url,
                    estado_publicacion: 'PUBLICADO'
                }));
                setPropiedades(mappedData);
            } catch (err) {
                console.error("Error al obtener propiedades:", err);
                setError(err.message || "Ocurrió un error inesperado.");
            } finally {
                setLoading(false);
            }
        };
        fetchPropiedades();
    }, []);
    
    // ... (El resto de la lógica de la página principal no necesita cambios) ...
    const filteredPropiedades = useMemo(() => {
        return propiedades.filter(p => {
            const matchesSearch = (p.descripcion || '').toLowerCase().includes(searchText.toLowerCase()) || (p.localidad_nombre || '').toLowerCase().includes(searchText.toLowerCase());
            const matchesStatus = filterStatus === 'TODOS' || p.estado_publicacion === filterStatus;
            return matchesSearch && matchesStatus;
        });
    }, [propiedades, searchText, filterStatus]);
    
    const handleOpenCreateModal = () => { setPropertyToEdit(null); setIsModalOpen(true); };
    const handleCloseModal = () => { setIsModalOpen(false); setPropertyToEdit(null); };
    const handleOpenEditModal = (propiedad) => {
        setPropertyToEdit(propiedad);
        setIsModalOpen(true);
    };
    
    const handleSaveProperty = async (savedPropertyData) => {
        const isEditing = !!propertyToEdit;
        const url = isEditing ? `${API_BASE}/properties/${propertyToEdit.id_propiedad}` : `${API_BASE}/properties`;
        const method = isEditing ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(savedPropertyData),
                credentials: 'include',
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Error ${response.status}`);
            }
            const savedData = await response.json();
            const formattedData = {
                ...savedData,
                localidad_nombre: savedData.localidad?.nombre || 'N/A',
                tipo_propiedad_nombre: savedData.tipoPropiedad?.nombre || 'N/A',
                url_foto_principal: savedData.fotos?.[0]?.url,
                estado_publicacion: 'PUBLICADO'
            };

            if (isEditing) {
                setPropiedades(prev => prev.map(p => p.id_propiedad === propertyToEdit.id_propiedad ? formattedData : p));
            } else {
                setPropiedades(prev => [formattedData, ...prev]);
            }
            handleCloseModal();
        } catch (err) {
            console.error("Error al guardar la propiedad:", err);
            alert(`Error: ${err.message}`);
        }
    };

    const handleEliminar = async (id) => {
        if (window.confirm(`¿Estás seguro de que quieres eliminar esta propiedad?`)) {
            try {
                const response = await fetch(`${API_BASE}/properties/${id}`, { method: 'DELETE', credentials: 'include' });
                if (!response.ok) {
                     const errorData = await response.json().catch(() => ({}));
                     throw new Error(errorData.message || `Error ${response.status}`);
                }
                setPropiedades(prev => prev.filter(p => p.id_propiedad !== id));
            } catch (err) {
                console.error("Error al eliminar la propiedad:", err);
                alert(`Error: ${err.message}`);
            }
        }
    };
    
    const handleCambiarEstado = (id, nuevoEstado) => { setPropiedades(prev => prev.map(p => p.id_propiedad === id ? { ...p, estado_publicacion: nuevoEstado } : p)); };

    return (
        <div style={{ backgroundColor: "#FDF6E3", minHeight: "100vh" }}>
            <Navbar active="mis-propiedades" />
            <main className="mx-auto max-w-7xl px-4 py-10">
                <h1 className="text-5xl font-extrabold mb-8" style={{ color: "#1e293b" }}>
                    Panel de Propiedades
                </h1>
                
                <AdminSubNav 
                    searchText={searchText}
                    onSearchChange={(e) => setSearchText(e.target.value)}
                    status={filterStatus}
                    onStatusChange={(e) => setFilterStatus(e.target.value)}
                    onAdd={handleOpenCreateModal}
                />
                
                {loading && <p className="text-center text-lg py-10" style={{color: "#475569"}}>Cargando tus propiedades...</p>}
                {error && <p className="text-center text-lg font-bold py-10" style={{color: "#DC2626"}}>{error}</p>}
                {!loading && !error && filteredPropiedades.length === 0 && (
                    <div className="text-center py-12">
                         <p className="text-xl" style={{color: "#475569"}}>No tienes propiedades registradas.</p>
                         <p className="mt-2" style={{color: "#475569"}}>Haz clic en "Añadir Propiedad" para empezar.</p>
                    </div>
                )}

<<<<<<< HEAD
  (async () => {
    try {
      // Armamos solo con claves definidas/no vacías
      const qs = new URLSearchParams(
        Object.fromEntries(
          Object.entries({
            // básicos
            fecha_inicio: filtros.fecha_inicio,
            fecha_fin: filtros.fecha_fin,
            huespedes: filtros.huespedes,
            id_localidad: filtros.id_localidad,
            // avanzados (solo los que hoy existen en tu UI)
            id_tipo_propiedad: filtros.id_tipo_propiedad,
            precio_min: filtros.precio_min,
            precio_max: filtros.precio_max,
            estancia_min: filtros.estancia_min,
            rating_min: filtros.rating_min,
            amenities: filtros.amenities, // CSV
            order_by: filtros.order_by,
          }).filter(([, v]) => v !== undefined && v !== null && String(v).trim() !== "")
        )
      );

      const url = `/api/properties/available?${qs.toString()}`;
      console.log("[FETCH] URL =>", url);
      console.log("[FETCH] filtros =>", Object.fromEntries(qs));

      const res = await fetch(url, { signal: ctrl.signal });
      if (!res.ok) {
        console.warn("[propiedades] Respuesta no OK:", res.status);
        setList([]);
        return;
      }

      const data = await res.json();

      const normalizados = (Array.isArray(data) ? data : []).map((p) => ({
        ...p,
        imagen_url:
          p.imagen_url ||
          p.url_foto ||
          p.foto?.nombre ||
          p.fotos?.[0]?.url_foto ||
          p.fotos?.[0]?.nombre ||
          p.foto_url,
      }));

      setList(normalizados);
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error("[propiedades] Error fetch:", err);
        setList([]);
      }
    }
  })();

  return () => ctrl.abort();
}, [filtros]);



  // chips de filtros (solo si existen → NO aparece “1 huéspedes” por defecto)
  const filterChips = useMemo(() => {
    const chips = [];
    if (filtros.fecha_inicio && filtros.fecha_fin)
      chips.push(`Del ${filtros.fecha_inicio} al ${filtros.fecha_fin}`);
    if (filtros.huespedes) chips.push(`${filtros.huespedes} huésped(es)`);
    if (filtros.id_localidad) chips.push(`Localidad #${filtros.id_localidad}`);
    if (filtros.precio_max) chips.push(`Hasta $${filtros.precio_max}/noche`);
    if (filtros.id_tipo_propiedad) chips.push(`Tipo #${filtros.id_tipo_propiedad}`);
    return chips;
  }, [filtros]);

  // arriba del return, define estas constantes (para que sea fácil ajustar)
const NAV_H = 72;         // alto del Navbar (tu Navbar.jsx usa 72)
const NAV_PADX = 28;      // padding lateral interno del navbar
const MENU_BTN_W = 52;    // ancho del botón hamburguesa
const GAP = 10;           // separación entre el botón filtros y el hamburguesa
const RIGHT_OFFSET = NAV_PADX + MENU_BTN_W + GAP; // 28 + 52 + 10 = 90
const FILTER_BTN_SIZE = 52; // px
const NAV_Z = 200;        // igual que el Navbar

  return (
  <div style={{ background: PRIMARY + "20", minHeight: "100vh" }}>
    {/* Navbar fijo */}
    <Navbar />

    {/* BOTÓN DE FILTROS FIJO (a la izquierda del menú) */}
{/* BOTÓN DE FILTROS FIJO (alineado con el menú) */}
{/* BOTÓN DE FILTROS FIJO (alineado con el menú) */}
<button
  onClick={() => setOpenFilters(true)}
  className="flex items-center justify-center rounded-xl shadow-md hover:scale-105 active:scale-95 transition-transform"
  style={{
    position: "fixed",
    // centrado vertical perfecto: (alto navbar - alto botón) / 2
    top: (NAV_H - FILTER_BTN_SIZE) / 2,      // 72 - 48 = 12
    // a la izquierda del hamburguesa: padding der del navbar + ancho botón menú + gap
    right: RIGHT_OFFSET,                     // 28 + 52 + 10 = 90
    width: FILTER_BTN_SIZE,                  // 52 (o ponelo en 52 si lo querés igual al menú)
    height: FILTER_BTN_SIZE,
    backgroundColor: "#F8C24D",
    color: "#0F172A",
    zIndex: NAV_Z + 10,                      // 210 (encima del navbar)
    boxShadow: "0 10px 24px rgba(0,0,0,.16)",
  }}
  aria-label="Abrir filtros"
  title="Filtros"
>
  {/* Ícono filtros */}
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
    <line x1="4" y1="8"  x2="20" y2="8"  stroke="#0F172A" strokeWidth="2" strokeLinecap="round" />
    <circle cx="10" cy="8" r="2" fill="#0F172A" />
    <line x1="4" y1="12" x2="20" y2="12" stroke="#0F172A" strokeWidth="2" strokeLinecap="round" />
    <circle cx="15" cy="12" r="2" fill="#0F172A" />
    <line x1="4" y1="16" x2="20" y2="16" stroke="#0F172A" strokeWidth="2" strokeLinecap="round" />
    <circle cx="8" cy="16" r="2" fill="#0F172A" />
  </svg>
</button>



    {/* SPACER para que el contenido no quede debajo del navbar */}
    <div style={{ height: NAV_H }} />

    {/* ...tu <main> y resto de la página */}
    <main className="max-w-7xl mx-auto px-4 py-6">
  {list.length === 0 ? (
    <p className="text-center text-slate-600 mt-10">
      No se encontraron propiedades que coincidan con los filtros seleccionados.
    </p>
  ) : (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {list.map((p) => (
        <PropertyCard
          key={p.id_propiedad}
          image={
            p.imagen_url ||
            "https://via.placeholder.com/400x250?text=AlojaApp"
          }
          title={`${p.descripcion?.slice(0, 60) ?? "Propiedad"} – ${p.localidad ?? ""}`}
          subtitle={`${p.ciudad ?? ""}${p.pais ? `, ${p.pais}` : ""}`}
          rating={Number(p.rating ?? 0)}
          price={p.precio_por_noche}
          guests={p.cantidad_huespedes}
        />
      ))}
    </div>
  )}
</main>


    {/* Tu modal de filtros usa setOpenFilters(true/false) como ya tenías */}
    <FiltersModal
      open={openFilters}
      initial={filtros}
      onClose={() => setOpenFilters(false)}
onApply={(f) => {
  setOpenFilters(false);

  // Logueamos lo que viene del modal
  console.log("[FiltersModal] onApply ->", f);

  // Actualizamos el estado de filtros que usa el fetch
  setFiltros((prev) => ({
        // básicos (los preservo)
        fecha_inicio: prev.fecha_inicio,
        fecha_fin: prev.fecha_fin,
        id_localidad: prev.id_localidad,
        huespedes: prev.huespedes,

        // avanzados (vienen del modal)
        id_tipo_propiedad: f.tipo || undefined,
        precio_min: f.precio_min || undefined,
        precio_max: f.precio_max || undefined,
        estancia_min: f.estancia_min || undefined,
        rating_min: f.rating_min || undefined,
        amenities:
          Array.isArray(f.amenities) && f.amenities.length
            ? f.amenities.join(",")
            : (typeof f.amenities === "string" ? f.amenities : undefined),
        order_by: f.order_by || undefined,
      }));
    }}
    />
  </div>
);

=======
                {!loading && !error && filteredPropiedades.length > 0 && (
                    <div className="space-y-8">
                        {filteredPropiedades.map(prop => (
                            <AdminPropertyCard 
                                key={prop.id_propiedad}
                                propiedad={prop}
                                onEliminar={handleEliminar}
                                onCambiarEstado={handleCambiarEstado}
                                onEdit={handleOpenEditModal}
                            />
                        ))}
                    </div>
                )}
            </main>

            <PropertyEditModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSaveProperty}
                property={propertyToEdit}
            />
        </div>
    );
}

// ====== MODAL PARA CREAR Y EDITAR PROPIEDADES (CORREGIDO) ======
function PropertyEditModal({ isOpen, onClose, onSave, property }) {
    const [formData, setFormData] = useState({});
    const [tipos, setTipos] = useState([]);
    const [localidades, setLocalidades] = useState([]);

    // --- Cargar Tipos y Localidades para los Selects ---
    useEffect(() => {
        const fetchDropdownData = async () => {
            if (!isOpen) return;
            try {
                // --- ¡AQUÍ ESTÁN LAS CORRECCIONES! ---
                // Juntamos el prefijo del 'index.routes.js' con la ruta del router específico
                const [tiposRes, localidadesRes] = await Promise.all([
                    fetch(`${API_BASE}/tipos-propiedad/getAllTiposPropiedad`), 
                    fetch(`${API_BASE}/localidades/getAllLocalidades`)      
                ]);

                if (!tiposRes.ok || !localidadesRes.ok) {
                    let errorMsg = 'No se pudieron cargar los datos para el formulario.';
                    if (!tiposRes.ok) console.error('Error en fetch /tipos-propiedad:', tiposRes.status, await tiposRes.text());
                    if (!localidadesRes.ok) console.error('Error en fetch /localidades:', localidadesRes.status, await localidadesRes.text());
                    throw new Error(errorMsg);
                }

                const tiposData = await tiposRes.json();
                const localidadesData = await localidadesRes.json();
                
                setTipos(tiposData);
                setLocalidades(localidadesData);

            } catch (error) {
                console.error("Error cargando datos para el modal:", error);
            }
        };
        fetchDropdownData();
    }, [isOpen]);

    // ... (El resto de la lógica del modal no necesita cambios) ...
    useEffect(() => {
        if (isOpen) {
            if (property) {
                setFormData({
                    descripcion: property.descripcion || '',
                    precio_por_noche: property.precio_por_noche || '',
                    cantidad_huespedes: property.cantidad_huespedes || 1,
                    calle: property.calle || '',
                    numero: property.numero || '',
                    latitud: property.latitud || '',
                    longitud: property.longitud || '',
                    id_tipo_propiedad: property.id_tipo_propiedad || '',
                    id_localidad: property.id_localidad || '',
                    reglas_de_la_casa: property.reglas_de_la_casa || '',
                    estancia_minima: property.estancia_minima || 1,
                });
            } else {
                setFormData({
                    descripcion: '',
                    precio_por_noche: '',
                    cantidad_huespedes: 1,
                    calle: '',
                    numero: '',
                    latitud: '',
                    longitud: '',
                    id_tipo_propiedad: '',
                    id_localidad: '',
                    reglas_de_la_casa: '',
                    estancia_minima: 1,
                });
            }
        }
    }, [property, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        const val = type === 'number' ? (value === '' ? '' : Number(value)) : value;
        setFormData(prev => ({ ...prev, [name]: val }));
    };

    const handleSave = () => {
        if (!formData.descripcion || !formData.precio_por_noche || !formData.calle || !formData.numero || !formData.id_localidad || !formData.id_tipo_propiedad || !formData.cantidad_huespedes) {
            alert("Por favor, completa los campos obligatorios (*).");
            return;
        }
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-60 overflow-y-auto p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full p-6 md:p-8 my-8">
                <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center" style={{ color: "#1e293b" }}>
                    {property ? 'Editar Propiedad' : 'Añadir Nueva Propiedad'}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                    <div className="sm:col-span-2">
                        <label className="block text-sm font-semibold mb-1" style={{ color: "#475569" }}>Descripción *</label>
                        <input name="descripcion" value={formData.descripcion || ''} onChange={handleChange} className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2" style={{ borderColor: "#F8C24D", '--tw-ring-color': "#F8C24D" }} />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1" style={{ color: "#475569" }}>Precio por Noche *</label>
                        <input type="number" step="0.01" name="precio_por_noche" value={formData.precio_por_noche || ''} onChange={handleChange} className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2" style={{ borderColor: "#F8C24D", '--tw-ring-color': "#F8C24D" }} />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1" style={{ color: "#475569" }}>Huéspedes Máximos *</label>
                        <input type="number" min="1" name="cantidad_huespedes" value={formData.cantidad_huespedes || ''} onChange={handleChange} className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2" style={{ borderColor: "#F8C24D", '--tw-ring-color': "#F8C24D" }} />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1" style={{ color: "#475569" }}>Calle *</label>
                        <input name="calle" value={formData.calle || ''} onChange={handleChange} className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2" style={{ borderColor: "#F8C24D", '--tw-ring-color': "#F8C24D" }} />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1" style={{ color: "#475569" }}>Número *</label>
                        <input name="numero" value={formData.numero || ''} onChange={handleChange} className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2" style={{ borderColor: "#F8C24D", '--tw-ring-color': "#F8C24D" }} />
                    </div>
                     <div>
                        <label className="block text-sm font-semibold mb-1" style={{ color: "#475569" }}>Tipo de Propiedad *</label>
                        <select name="id_tipo_propiedad" value={formData.id_tipo_propiedad || ''} onChange={handleChange} className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 bg-white" style={{ borderColor: "#F8C24D", '--tw-ring-color': "#F8C24D" }}>
                            <option value="" disabled>Selecciona un tipo</option>
                            {tipos.map(tipo => (
                                <option key={tipo.id_tipo_propiedad} value={tipo.id_tipo_propiedad}>{tipo.nombre}</option>
                            ))}
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-semibold mb-1" style={{ color: "#475569" }}>Localidad *</label>
                         <select name="id_localidad" value={formData.id_localidad || ''} onChange={handleChange} className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 bg-white" style={{ borderColor: "#F8C24D", '--tw-ring-color': "#F8C24D" }}>
                            <option value="" disabled>Selecciona una localidad</option>
                            {localidades.map(loc => (
                                <option key={loc.id_localidad} value={loc.id_localidad}>{loc.nombre}</option>
                            ))}
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-semibold mb-1" style={{ color: "#475569" }}>Estancia Mínima (noches)</label>
                        <input type="number" min="1" name="estancia_minima" value={formData.estancia_minima || ''} onChange={handleChange} className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2" style={{ borderColor: "#F8C24D", '--tw-ring-color': "#F8C24D" }} />
                    </div>
                     <div className="sm:col-span-2">
                        <label className="block text-sm font-semibold mb-1" style={{ color: "#475569" }}>Reglas de la Casa</label>
                        <textarea name="reglas_de_la_casa" value={formData.reglas_de_la_casa || ''} onChange={handleChange} rows="3" className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2" style={{ borderColor: "#F8C24D", '--tw-ring-color': "#F8C24D" }}></textarea>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1" style={{ color: "#475569" }}>Latitud</label>
                        <input type="number" step="any" name="latitud" value={formData.latitud || ''} onChange={handleChange} className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2" style={{ borderColor: "#F8C24D", '--tw-ring-color': "#F8C24D" }} />
                    </div>
                     <div>
                        <label className="block text-sm font-semibold mb-1" style={{ color: "#475569" }}>Longitud</label>
                        <input type="number" step="any" name="longitud" value={formData.longitud || ''} onChange={handleChange} className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2" style={{ borderColor: "#F8C24D", '--tw-ring-color': "#F8C24D" }} />
                    </div>
                </div>
                <div className="mt-8 flex flex-col sm:flex-row justify-end gap-4">
                    <button onClick={onClose} className="px-6 py-2 rounded-lg font-semibold border order-2 sm:order-1" style={{ color: "#1e293b", borderColor: "#1e293b" }}>
                        Cancelar
                    </button>
                    <button onClick={handleSave} className="px-6 py-2 rounded-lg font-semibold text-white order-1 sm:order-2" style={{ backgroundColor: "#16A34A" }}>
                        {property ? 'Guardar Cambios' : 'Crear Propiedad'}
                    </button>
                </div>
            </div>
        </div>
    );
}

function PlusIcon() {
    return (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 5v14m-7-7h14" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>);
>>>>>>> e85436122940efa5c43b059457ed867ed7f0cfef
}
