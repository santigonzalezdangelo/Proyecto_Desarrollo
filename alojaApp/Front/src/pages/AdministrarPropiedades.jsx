import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';

// ====== TEMA / TOKENS DE COLOR ======
const PRIMARY_COLOR = "#F8C24D"; 
const SECONDARY_BG = "#FDF6E3";   
const TEXT_DARK = "#1e293b";      
const TEXT_MUTED = "#475569";     
const CARD_BG = "#FFFFFF";       
const GREEN_ACTION = "#16A34A";   
const RED_ACTION = "#DC2626";     

// ====== DATOS SIMULADOS (MOCK DATA) ======
const mockPropiedades = [
    { id_propiedad: 101, descripcion: 'Apartamento de Lujo en Microcentro', precio_por_noche: 150.00, localidad_nombre: 'CABA', url_foto_principal: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?&w=600', estado_publicacion: 'PUBLICADO' },
    { id_propiedad: 102, descripcion: 'Cabaña Rústica con Bosque Nativo', precio_por_noche: 250.50, localidad_nombre: 'Villa La Angostura', url_foto_principal: 'https://images.unsplash.com/photo-1585544375529-65544a13872c?&w=600', estado_publicacion: 'BORRADOR' },
    { id_propiedad: 103, descripcion: 'Casa Familiar en Barrio Tranquilo', precio_por_noche: 90.00, localidad_nombre: 'Mendoza', url_foto_principal: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?&w=600', estado_publicacion: 'PUBLICADO' },
];

// ====== COMPONENTE NAVBAR ======
function Navbar({ active = "mis-propiedades" }) {
    const items = [
        { key: "inicio", label: "Inicio", href: "/" },
        { key: "mis-propiedades", label: "Mis Propiedades", href: "/administrarPropiedades" },
        { key: "perfil", label: "Perfil", href: "/perfil" },
        { key: "logout", label: "Cerrar Sesión", href: "/logout" },
    ];
    return (
        <header className="sticky top-0 z-50 w-full shadow-md" style={{ backgroundColor: PRIMARY_COLOR }}>
            <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
                <a href="/" aria-label="Ir al inicio"><img src="/images/logo.png" alt="AlojaApp" className="object-contain" style={{ maxHeight: "70px" }} /></a>
                <nav className="flex items-center gap-6">
                    {items.map((it) => (
                        <Link key={it.key} to={it.href}
                           className={`text-base font-semibold transition-all duration-200 ${active === it.key ? 'pb-1 border-b-2' : 'opacity-80 hover:opacity-100'}`}
                           style={{ color: TEXT_DARK, borderColor: TEXT_DARK }}>
                            {it.label}
                        </Link>
                    ))}
                </nav>
            </div>
        </header>
    );
}

// ====== BARRA DE FILTROS Y ACCIONES ======
// AÑADIMOS el prop `onAdd` para que el botón llame a una función en lugar de navegar
function AdminSubNav({ searchText, onSearchChange, status, onStatusChange, onAdd }) {
    return (
        <div className="mb-8 p-4 rounded-xl shadow-lg" style={{ backgroundColor: SECONDARY_BG }}>
            <div className="flex flex-col md:flex-row items-center gap-4 w-full">
                <div className="flex flex-col sm:flex-row gap-4 w-full flex-grow">
                    <select
                        value={status}
                        onChange={onStatusChange}
                        className="w-full sm:w-auto p-3 border rounded-lg font-semibold focus:outline-none focus:ring-2"
                        style={{ borderColor: PRIMARY_COLOR, color: TEXT_DARK, '--tw-ring-color': PRIMARY_COLOR, backgroundColor: CARD_BG }}
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
                        style={{ borderColor: PRIMARY_COLOR, color: TEXT_DARK, '--tw-ring-color': PRIMARY_COLOR, backgroundColor: CARD_BG }}
                    />
                </div>
                {/* CAMBIO: De <Link> a <button> que llama a la función onAdd */}
                <button onClick={onAdd} className="w-full md:w-auto flex-shrink-0 flex items-center justify-center gap-2 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-transform hover:scale-105" style={{ backgroundColor: GREEN_ACTION }}>
                    <PlusIcon /> Añadir Propiedad
                </button>
            </div>
        </div>
    );
}

// ====== TARJETA DE PROPIEDAD ======
// AÑADIMOS el prop `onEdit` para que el botón de editar llame a una función
function AdminPropertyCard({ propiedad, onEliminar, onCambiarEstado, onEdit }) {
    const { id_propiedad, descripcion, precio_por_noche, localidad_nombre, url_foto_principal, estado_publicacion } = propiedad;
    const esPublicado = estado_publicacion === 'PUBLICADO';

    return (
        <div className="flex flex-col md:flex-row gap-6 p-5 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300" style={{ backgroundColor: CARD_BG }}>
            <img src={url_foto_principal || 'https://via.placeholder.com/150'} alt={descripcion} className="w-full md:w-52 h-44 object-cover rounded-lg shrink-0" />
            <div className="flex-grow flex flex-col">
                <h3 className="text-2xl font-bold mb-1" style={{ color: TEXT_DARK }}>{descripcion}</h3>
                <p className="text-base mb-3" style={{ color: TEXT_MUTED }}>{localidad_nombre}</p>
                <div className="mt-auto">
                    <span className="text-2xl font-bold" style={{ color: TEXT_DARK }}>${precio_por_noche} <span className="text-sm font-normal text-slate-600">/noche</span></span>
                </div>
            </div>
            <div className="flex flex-col justify-center gap-3 shrink-0 md:w-48">
                 <span className={`text-center px-3 py-1 text-sm font-bold uppercase rounded-full ${esPublicado ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {estado_publicacion}
                </span>
                {/* CAMBIO: De <Link> a <button> que llama a onEdit con la propiedad actual */}
                <button onClick={() => onEdit(propiedad)} className="text-center font-bold text-sm py-3 px-4 rounded-lg hover:opacity-90 transition-opacity" style={{ backgroundColor: PRIMARY_COLOR, color: TEXT_DARK }}>
                    📝 Editar Propiedad
                </button>
                <button
                    onClick={() => onCambiarEstado(id_propiedad, esPublicado ? 'BORRADOR' : 'PUBLICADO')}
                    className={`text-center font-bold text-sm py-3 px-4 rounded-lg text-white transition-colors ${esPublicado ? 'bg-slate-500 hover:bg-slate-600' : 'bg-green-600 hover:bg-green-700'}`}
                >
                    {esPublicado ? '⏸️ Despublicar' : '▶️ Publicar'}
                </button>
                <button onClick={() => onEliminar(id_propiedad)} className="text-center font-bold text-sm py-3 px-4 rounded-lg text-white transition-colors" style={{ backgroundColor: RED_ACTION }}>
                    🗑️ Eliminar
                </button>
            </div>
        </div>
    );
}

// ====== PÁGINA PRINCIPAL: ADMINISTRAR PROPIEDADES ======
export default function AdministrarPropiedades() {
    const [propiedades, setPropiedades] = useState(mockPropiedades);
    const [searchText, setSearchText] = useState("");
    const [filterStatus, setFilterStatus] = useState("TODOS");

    // --- NUEVO: ESTADO PARA GESTIONAR EL MODAL ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [propertyToEdit, setPropertyToEdit] = useState(null); // Si es `null`, es para crear. Si tiene un objeto, es para editar.

    const filteredPropiedades = useMemo(() => {
        return propiedades.filter(p => {
            const matchesSearch = p.descripcion.toLowerCase().includes(searchText.toLowerCase()) || p.localidad_nombre.toLowerCase().includes(searchText.toLowerCase());
            const matchesStatus = filterStatus === 'TODOS' || p.estado_publicacion === filterStatus;
            return matchesSearch && matchesStatus;
        });
    }, [propiedades, searchText, filterStatus]);
    
    // --- FUNCIONES PARA MANEJAR EL MODAL ---
    const handleOpenCreateModal = () => {
        setPropertyToEdit(null); // Limpiamos la propiedad a editar
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (propiedad) => {
        setPropertyToEdit(propiedad); // Guardamos la propiedad a editar
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setPropertyToEdit(null); // Limpiamos al cerrar
    };

    const handleSaveProperty = (savedProperty) => {
        if (savedProperty.id_propiedad) {
            // Es una actualización
            setPropiedades(prev => prev.map(p => 
                p.id_propiedad === savedProperty.id_propiedad ? savedProperty : p
            ));
        } else {
            // Es una creación
            const newProperty = { ...savedProperty, id_propiedad: Date.now() }; // Usamos Date.now() para un ID único en el mock
            setPropiedades(prev => [newProperty, ...prev]);
        }
        handleCloseModal();
    };

    // (Funciones de eliminar y cambiar estado sin cambios)
    const handleEliminar = (id) => { if (window.confirm(`¿Estás seguro?`)) { setPropiedades(prev => prev.filter(p => p.id_propiedad !== id)); } };
    const handleCambiarEstado = (id, nuevoEstado) => { setPropiedades(prev => prev.map(p => p.id_propiedad === id ? { ...p, estado_publicacion: nuevoEstado } : p)); };

    return (
        <div style={{ backgroundColor: SECONDARY_BG, minHeight: "100vh" }}>
            <Navbar active="mis-propiedades" />
            <main className="mx-auto max-w-7xl px-4 py-10">
                <h1 className="text-5xl font-extrabold mb-8" style={{ color: TEXT_DARK }}>
                    Panel de Propiedades
                </h1>
                
                <AdminSubNav 
                    searchText={searchText}
                    onSearchChange={(e) => setSearchText(e.target.value)}
                    status={filterStatus}
                    onStatusChange={(e) => setFilterStatus(e.target.value)}
                    onAdd={handleOpenCreateModal} // Conectamos el botón de añadir
                />

                <div className="space-y-8">
                    {filteredPropiedades.map(prop => (
                        <AdminPropertyCard 
                            key={prop.id_propiedad}
                            propiedad={prop}
                            onEliminar={handleEliminar}
                            onCambiarEstado={handleCambiarEstado}
                            onEdit={handleOpenEditModal} // Conectamos el botón de editar
                        />
                    ))}
                </div>
            </main>

            {/* --- RENDERIZADO DEL MODAL --- */}
            <PropertyEditModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSaveProperty}
                property={propertyToEdit}
            />
        </div>
    );
}

// ====== NUEVO: MODAL PARA CREAR Y EDITAR PROPIEDADES ======
function PropertyEditModal({ isOpen, onClose, onSave, property }) {
    // Estado interno del formulario
    const [formData, setFormData] = useState({});

    // Efecto para llenar el formulario cuando se abre para editar
    useEffect(() => {
        if (property) {
            setFormData(property); // Si hay una propiedad, la cargamos en el form
        } else {
            // Si no, reseteamos a un estado inicial para "crear"
            setFormData({
                descripcion: '',
                localidad_nombre: '',
                precio_por_noche: '',
                url_foto_principal: '',
                estado_publicacion: 'BORRADOR',
            });
        }
    }, [property, isOpen]); // Se ejecuta cuando la propiedad o la visibilidad del modal cambian

    if (!isOpen) return null; // No renderizar nada si está cerrado

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        // Validaciones básicas antes de guardar
        if (!formData.descripcion || !formData.precio_por_noche) {
            alert("La descripción y el precio son obligatorios.");
            return;
        }
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-8 m-4">
                <h2 className="text-3xl font-bold mb-6" style={{ color: TEXT_DARK }}>
                    {property ? 'Editar Propiedad' : 'Añadir Nueva Propiedad'}
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Campos del formulario */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-semibold mb-1" style={{ color: TEXT_MUTED }}>Descripción</label>
                        <input name="descripcion" value={formData.descripcion || ''} onChange={handleChange} className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2" style={{ borderColor: PRIMARY_COLOR, '--tw-ring-color': PRIMARY_COLOR }} />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1" style={{ color: TEXT_MUTED }}>Localidad</label>
                        <input name="localidad_nombre" value={formData.localidad_nombre || ''} onChange={handleChange} className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2" style={{ borderColor: PRIMARY_COLOR, '--tw-ring-color': PRIMARY_COLOR }} />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1" style={{ color: TEXT_MUTED }}>Precio por Noche</label>
                        <input type="number" name="precio_por_noche" value={formData.precio_por_noche || ''} onChange={handleChange} className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2" style={{ borderColor: PRIMARY_COLOR, '--tw-ring-color': PRIMARY_COLOR }} />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-semibold mb-1" style={{ color: TEXT_MUTED }}>URL de la Imagen Principal</label>
                        <input name="url_foto_principal" value={formData.url_foto_principal || ''} onChange={handleChange} className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2" style={{ borderColor: PRIMARY_COLOR, '--tw-ring-color': PRIMARY_COLOR }} />
                    </div>
                </div>

                <div className="mt-8 flex justify-end gap-4">
                    <button onClick={onClose} className="px-6 py-2 rounded-lg font-semibold border" style={{ color: TEXT_DARK, borderColor: TEXT_DARK }}>
                        Cancelar
                    </button>
                    <button onClick={handleSave} className="px-6 py-2 rounded-lg font-semibold text-white" style={{ backgroundColor: GREEN_ACTION }}>
                        {property ? 'Guardar Cambios' : 'Crear Propiedad'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ====== ÍCONO SVG ======
function PlusIcon() {
    return (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 5v14m-7-7h14" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>);
}