import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';

// ====== CONFIGURACIÓN DE LA API (con Fetch) ======
const API_BASE = import.meta.env?.VITE_API_BASE || 'http://localhost:4000/api'; 

// ====== TEMA / TOKENS DE COLOR ======
const PRIMARY_COLOR = "#F8C24D"; 
const SECONDARY_BG = "#FDF6E3";   
const TEXT_DARK = "#1e293b";       
const TEXT_MUTED = "#475569";      
const CARD_BG = "#FFFFFF";       
const GREEN_ACTION = "#16A34A";
const GREEN_SUCCESS_BG = "#ECFDF5";
const GREEN_SUCCESS_TEXT = "#065F46";
const RED_ACTION = "#DC2626";     
const RED_ERROR_BG = "#FEF2F2";
const RED_ERROR_TEXT = "#991B1B";
const BORDER_COLOR = "#CBD5E1";

// ====== COMPONENTES DE UI (Navbar, AdminSubNav, etc.) ======
function Navbar({ active = "mis-propiedades" }) {
    const items = [
        { key: "inicio", label: "Inicio", href: "/" },
        { key: "mis-propiedades", label: "Mis Propiedades", href: "/administrarPropiedades" },
        { key: "perfil", label: "Perfil", href: "/perfil" },
        { key: "logout", label: "Cerrar Sesión", href: "/login" },
    ];
    return (
        <header className="sticky top-0 z-50 w-full shadow-md" style={{ backgroundColor: PRIMARY_COLOR }}>
            <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
                <Link to="/" aria-label="Ir al inicio"><img src="/images/logo.png" alt="AlojaApp" className="object-contain" style={{ maxHeight: "70px" }} /></Link>
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
                        <option value="PUBLICADO" >Publicado</option>
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
                <button onClick={onAdd} className="w-full md:w-auto flex-shrink-0 flex items-center justify-center gap-2 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-transform hover:scale-105" style={{ backgroundColor: GREEN_ACTION }}>
                    <PlusIcon /> Añadir Propiedad
                </button>
            </div>
        </div>
    );
}

function AdminPropertyCard({ propiedad, onEliminar, onCambiarEstado, onEdit }) {
    const { id_propiedad, descripcion, precio_por_noche, localidad_nombre, tipo_propiedad_nombre, url_foto_principal, estado_publicacion } = propiedad;
    const esPublicado = estado_publicacion === 'PUBLICADO';

    return (
        <div className="flex flex-col md:flex-row gap-6 p-5 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300" style={{ backgroundColor: CARD_BG }}>
            <img src={url_foto_principal || 'https://placehold.co/208x176/FDF6E3/1e293b?text=Sin+Imagen'} alt={descripcion} className="w-full md:w-52 h-44 object-cover rounded-lg shrink-0" />
            <div className="flex-grow flex flex-col">
                <h3 className="text-2xl font-bold mb-1" style={{ color: TEXT_DARK }}>{descripcion}</h3>
                <p className="text-base font-medium" style={{ color: TEXT_MUTED }}>{tipo_propiedad_nombre}</p>
                <p className="text-sm mb-3" style={{ color: TEXT_MUTED }}>{localidad_nombre}</p>
                <div className="mt-auto">
                    <span className="text-2xl font-bold" style={{ color: TEXT_DARK }}>${precio_por_noche} <span className="text-sm font-normal text-slate-600">/noche</span></span>
                </div>
            </div>
            <div className="flex flex-col justify-center gap-3 shrink-0 md:w-48">
                 <span className={`text-center px-3 py-1 text-sm font-bold uppercase rounded-full ${esPublicado ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {estado_publicacion}
                </span>
                <button 
                    onClick={() => onEdit(propiedad)} 
                    className="text-center font-bold text-sm py-3 px-4 rounded-lg hover:opacity-90 transition-opacity" 
                    style={{ backgroundColor: PRIMARY_COLOR, color: TEXT_DARK }}
                >
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
    const [propiedades, setPropiedades] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [filterStatus, setFilterStatus] = useState("TODOS");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [propertyToEdit, setPropertyToEdit] = useState(null);
    const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
    const [confirmation, setConfirmation] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {} });

    const showNotification = (message, type = 'success') => {
        setNotification({ show: true, message, type });
        setTimeout(() => {
            setNotification({ show: false, message: '', type: 'success' });
        }, 3000);
    };

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
                url_foto_principal: p.fotos?.find(f => f.principal)?.url_foto
                ? `${p.fotos.find(f => f.principal).url_foto}?f_auto,q_auto,dpr_auto`
                : p.fotos?.[0]?.url_foto
                    ? `${p.fotos[0].url_foto}?f_auto,q_auto,dpr_auto`
                    : undefined,
                estado_publicacion: 'PUBLICADO'
            }));
            setPropiedades(mappedData);
        } catch (err) {
            setError(err.message || "Ocurrió un error inesperado.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPropiedades();
    }, []);

    const filteredPropiedades = useMemo(() => {
        return propiedades.filter(p => {
            const matchesSearch = (p.descripcion || '').toLowerCase().includes(searchText.toLowerCase()) || (p.localidad_nombre || '').toLowerCase().includes(searchText.toLowerCase());
            const matchesStatus = filterStatus === 'TODOS' || p.estado_publicacion === filterStatus;
            return matchesSearch && matchesStatus;
        });
    }, [propiedades, searchText, filterStatus]);

    const handleOpenCreateModal = () => { setPropertyToEdit(null); setIsModalOpen(true); };
    const handleCloseModal = () => { setIsModalOpen(false); setPropertyToEdit(null); };
    const handleOpenEditModal = (propiedad) => { setPropertyToEdit(propiedad); setIsModalOpen(true); };
    
    // Nueva función para actualizar el estado del array de fotos desde el modal
    const handleUpdatePropertyPhotos = (propertyId, newPhotosArray) => {
        setPropiedades(prev => prev.map(p => {
            if (p.id_propiedad === propertyId) {
                // Buscar la nueva principal para actualizar la tarjeta
                const newPrincipalUrl = newPhotosArray.find(f => f.principal)?.url_foto || newPhotosArray?.[0]?.url_foto;
                return { 
                    ...p, 
                    fotos: newPhotosArray,
                    url_foto_principal: newPrincipalUrl
                };
            }
            return p;
        }));
    };

const handleSaveProperty = async (savedPropertyData, photoFiles, setPhotoFiles) => {
    const isEditing = !!propertyToEdit;
    const propertyUrl = isEditing ? `${API_BASE}/properties/updatePropertyById/${propertyToEdit.id_propiedad}` : `${API_BASE}/properties/createProperty`;
    const propertyMethod = isEditing ? 'PUT' : 'POST';

    try {
        // Convertir campos numéricos vacíos a null
        const payload = { ...savedPropertyData };
        if (payload.precio_por_noche === '') payload.precio_por_noche = null;
        if (payload.cantidad_huespedes === '') payload.cantidad_huespedes = null;
        if (payload.estancia_minima === '') payload.estancia_minima = null;
        if (payload.latitud === '') payload.latitud = null;
        if (payload.longitud === '') payload.longitud = null;

        const propertyResponse = await fetch(propertyUrl, {
            method: propertyMethod,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            credentials: 'include',
        });

        if (!propertyResponse.ok) {
            const errorData = await propertyResponse.json().catch(() => ({}));
            throw new Error(errorData.message || `Error ${propertyResponse.status}: No se pudo guardar`);
        }

        const savedDataResponse = await propertyResponse.json();
        const savedProperty = isEditing ? savedDataResponse : savedDataResponse.data;
        const propertyId = savedProperty.id_propiedad;

        // Subir fotos si hay
        if (photoFiles.length > 0) {
    if (photoFiles.length > 20) {
        showNotification('No se pueden subir más de 20 fotos.', 'error');
        return;
    }

    const formData = new FormData();

        for (const file of photoFiles) {
            // Convertimos cada archivo a URL temporal de Cloudinary optimizada
            formData.append('photos', file);
        }

        const photoUploadUrl = `${API_BASE}/photos/photo/${propertyId}`;

        const photoResponse = await fetch(photoUploadUrl, {
            method: 'POST',
            body: formData,
            credentials: 'include',
        });

        if (!photoResponse.ok) {
            console.error("Error subiendo fotos, pero propiedad guardada.");
            showNotification('Propiedad guardada, pero hubo un error al subir las fotos.', 'error');
        } else {
            setPhotoFiles([]); // Limpiar archivos nuevos después de subir
        }
    }

        await fetchPropiedades();
        handleCloseModal();
        showNotification('Propiedad guardada con éxito', 'success');

    } catch (err) {
        console.error("Error al guardar la propiedad:", err);
        showNotification(`Error: ${err.message}`, 'error');
    }
};

    const handleDeleteExistingPhoto = async (photoId, propertyId) => {
        try {
            const response = await fetch(`${API_BASE}/photos/deletePhoto/${photoId}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'No se pudo eliminar la foto');
            }
            setPropiedades(prev => prev.map(p => {
                if (p.id_propiedad === propertyId) {
                    const newPhotos = p.fotos.filter(f => f.id_foto !== photoId);
                    return { 
                        ...p, 
                        fotos: newPhotos,
                        url_foto_principal: newPhotos.find(f => f.principal)?.url_foto || newPhotos?.[0]?.url_foto
                    };
                }
                return p;
            }));
            if(propertyToEdit?.id_propiedad === propertyId) {
                setPropertyToEdit(prev => {
                    const newPhotos = prev.fotos.filter(f => f.id_foto !== photoId);
                    return {...prev, fotos: newPhotos };
                });
            }
            showNotification('Foto eliminada correctamente', 'success');
        } catch (err) {
            console.error("Error al eliminar la foto:", err);
            showNotification(`Error: ${err.message}`, 'error');
        }
    };

    const handleEliminar = (id) => {
        setConfirmation({
            isOpen: true, title: 'Confirmar Eliminación',
            message: '¿Estás seguro? Esta acción no se puede deshacer.',
            onConfirm: () => { 
                const performDelete = async () => {
                    try {
                        const url = `${API_BASE}/properties/deletePropertyById/${id}`;
                        const response = await fetch(url, { method: 'DELETE', credentials: 'include' });
                        if (!response.ok) {
                             const errorData = await response.json().catch(() => ({}));
                             throw new Error(errorData.message || `Error ${response.status}`);
                        }
                        setPropiedades(prev => prev.filter(p => p.id_propiedad !== id));
                        showNotification('Propiedad eliminada.', 'success');
                    } catch (err) { showNotification(`Error: ${err.message}`, 'error'); }
                };
                performDelete();
            }
        });
    };
    
    const handleCambiarEstado = (id, nuevoEstado) => { setPropiedades(prev => prev.map(p => p.id_propiedad === id ? { ...p, estado_publicacion: nuevoEstado } : p)); };

    return (
        <div style={{ backgroundColor: SECONDARY_BG, minHeight: "100vh" }}>
            <Navbar active="mis-propiedades" />
            <Notification message={notification.message} type={notification.type} show={notification.show} onClose={() => setNotification({ ...notification, show: false })} />
            <main className="mx-auto max-w-7xl px-4 py-10">
                <h1 className="text-5xl font-extrabold mb-8" style={{ color: TEXT_DARK }}>Panel de Propiedades</h1>
                <AdminSubNav searchText={searchText} onSearchChange={(e) => setSearchText(e.target.value)} status={filterStatus} onStatusChange={(e) => setFilterStatus(e.target.value)} onAdd={handleOpenCreateModal} />
                {loading && <p className="text-center text-lg py-10" style={{color: TEXT_MUTED}}>Cargando...</p>}
                {error && <p className="text-center text-lg font-bold py-10" style={{color: RED_ACTION}}>{error}</p>}
                {!loading && !error && filteredPropiedades.length === 0 && (<div className="text-center py-12"><p className="text-xl" style={{color: TEXT_MUTED}}>No tienes propiedades.</p><p className="mt-2" style={{color: TEXT_MUTED}}>Haz clic en "Añadir" para empezar.</p></div>)}
                {!loading && !error && filteredPropiedades.length > 0 && (<div className="space-y-8">{filteredPropiedades.map(prop => (<AdminPropertyCard key={prop.id_propiedad} propiedad={prop} onEliminar={handleEliminar} onCambiarEstado={handleCambiarEstado} onEdit={handleOpenEditModal}/>))}</div>)}
            </main>
            <PropertyEditModal 
                isOpen={isModalOpen} 
                onClose={handleCloseModal} 
                onSave={handleSaveProperty} 
                property={propertyToEdit} 
                showNotification={showNotification}
                onDeleteExistingPhoto={handleDeleteExistingPhoto}
                onUpdatePropertyPhotos={handleUpdatePropertyPhotos} 
            />
            <ConfirmationModal isOpen={confirmation.isOpen} onClose={() => setConfirmation({ ...confirmation, isOpen: false })} onConfirm={() => { confirmation.onConfirm(); setConfirmation({ ...confirmation, isOpen: false }); }} title={confirmation.title} message={confirmation.message} />
        </div>
    );
}

// ====== MODAL PARA CREAR Y EDITAR PROPIEDADES ======
function PropertyEditModal({ isOpen, onClose, onSave, property, showNotification, onDeleteExistingPhoto, onUpdatePropertyPhotos }) {
    const [formData, setFormData] = useState({});
    const [tipos, setTipos] = useState([]);
    const [localidades, setLocalidades] = useState([]);
    const [photoFiles, setPhotoFiles] = useState([]);
    const [existingModalPhotos, setExistingModalPhotos] = useState([]); 

    useEffect(() => {
        const fetchDropdownData = async () => {
            if (!isOpen) return;
            try {
                const [tiposRes, localidadesRes] = await Promise.all([
                    fetch(`${API_BASE}/tipos-propiedad/getAllTiposPropiedad`),
                    fetch(`${API_BASE}/localidades/getAllLocalidades`)
                ]);
                if (!tiposRes.ok || !localidadesRes.ok) throw new Error('No se pudieron cargar datos para el formulario.');
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

    useEffect(() => {
        if (isOpen) {
            setPhotoFiles([]); // Limpia archivos nuevos al abrir el modal
            if (property) {
                setExistingModalPhotos(property.fotos || []); 
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
                setExistingModalPhotos([]);
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
            showNotification("Por favor, completa todos los campos obligatorios (*).", "error"); 
            return;
        }
        onSave(formData, photoFiles, setPhotoFiles); // Pasamos setPhotoFiles para limpiar después
    };

    const handleSetPhotoAsPrincipal = async (photoId, propertyId) => {
        if (!propertyId) return showNotification('Error: ID de propiedad no disponible.', 'error');

        try {
            // Verificar si la foto clickeada ya es principal
            const isAlreadyPrincipal = existingModalPhotos.find(p => p.id_foto === photoId)?.principal;

            const response = await fetch(`${API_BASE}/photos/setPhotoAsPrincipal/${photoId}`, {
                method: 'PUT',
                credentials: 'include',
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'No se pudo establecer la foto como principal');
            }
            // Crear el nuevo array con la foto principal actualizada
            const newPhotosArray = existingModalPhotos.map(photo => ({
                ...photo,
                principal: photo.id_foto === photoId ? !isAlreadyPrincipal : false
            }));
            // Actualizar el estado local del modal
            setExistingModalPhotos(newPhotosArray);
            // Notificar al componente padre con el array actualizado
            onUpdatePropertyPhotos(propertyId, newPhotosArray);

            showNotification('Foto principal actualizada correctamente', 'success');

        } catch (err) {
            console.error("Error al establecer foto principal:", err);
            showNotification(`Error: ${err.message}`, 'error');
        }
    };
    // Wrapper para onDeleteExistingPhoto para actualizar el estado local del modal
    const handleDeletePhotoFromModal = async (photoId, propertyId) => {
        await onDeleteExistingPhoto(photoId, propertyId);
        setExistingModalPhotos(prevPhotos => prevPhotos.filter(f => f.id_foto !== photoId));
    };


    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-60 overflow-y-auto p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 md:p-8 my-8">
                <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center" style={{ color: TEXT_DARK }}>
                    {property ? 'Editar Propiedad' : 'Añadir Nueva Propiedad'}
                </h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                    {/* --- Campos de la propiedad --- */}
                    <div className="sm:col-span-2">
                        <label className="block text-sm font-semibold mb-1" style={{ color: TEXT_MUTED }}>Descripción *</label>
                        <input name="descripcion" value={formData.descripcion || ''} onChange={handleChange} className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2" style={{ borderColor: PRIMARY_COLOR, '--tw-ring-color': PRIMARY_COLOR }} />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1" style={{ color: TEXT_MUTED }}>Precio por Noche *</label>
                        <input type="number" step="0.01" name="precio_por_noche" value={formData.precio_por_noche || ''} onChange={handleChange} className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2" style={{ borderColor: PRIMARY_COLOR, '--tw-ring-color': PRIMARY_COLOR }} />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1" style={{ color: TEXT_MUTED }}>Huéspedes Máximos *</label>
                        <input type="number" min="1" name="cantidad_huespedes" value={formData.cantidad_huespedes || ''} onChange={handleChange} className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2" style={{ borderColor: PRIMARY_COLOR, '--tw-ring-color': PRIMARY_COLOR }} />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1" style={{ color: TEXT_MUTED }}>Calle *</label>
                        <input name="calle" value={formData.calle || ''} onChange={handleChange} className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2" style={{ borderColor: PRIMARY_COLOR, '--tw-ring-color': PRIMARY_COLOR }} />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1" style={{ color: TEXT_MUTED }}>Número *</label>
                        <input name="numero" value={formData.numero || ''} onChange={handleChange} className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2" style={{ borderColor: PRIMARY_COLOR, '--tw-ring-color': PRIMARY_COLOR }} />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1" style={{ color: TEXT_MUTED }}>Tipo de Propiedad *</label>
                        <select name="id_tipo_propiedad" value={formData.id_tipo_propiedad || ''} onChange={handleChange} className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 bg-white" style={{ borderColor: PRIMARY_COLOR, '--tw-ring-color': PRIMARY_COLOR }}>
                            <option value="" disabled>Selecciona un tipo</option>
                            {tipos.map(tipo => (<option key={tipo.id_tipo_propiedad} value={tipo.id_tipo_propiedad}>{tipo.nombre}</option>))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1" style={{ color: TEXT_MUTED }}>Localidad *</label>
                        <select name="id_localidad" value={formData.id_localidad || ''} onChange={handleChange} className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 bg-white" style={{ borderColor: PRIMARY_COLOR, '--tw-ring-color': PRIMARY_COLOR }}>
                            <option value="" disabled>Selecciona una localidad</option>
                            {localidades.map(loc => (<option key={loc.id_localidad} value={loc.id_localidad}>{loc.nombre}</option>))}
                        </select>
                    </div>
                    <div className="sm:col-span-2">
                        <label className="block text-sm font-semibold mb-1" style={{ color: TEXT_MUTED }}>Reglas de la Casa</label>
                        <textarea name="reglas_de_la_casa" value={formData.reglas_de_la_casa || ''} onChange={handleChange} rows="3" className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2" style={{ borderColor: PRIMARY_COLOR, '--tw-ring-color': PRIMARY_COLOR }}></textarea>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1" style={{ color: TEXT_MUTED }}>Latitud</label>
                        <input type="number" step="any" name="latitud" value={formData.latitud || ''} onChange={handleChange} className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2" style={{ borderColor: PRIMARY_COLOR, '--tw-ring-color': PRIMARY_COLOR }} />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1" style={{ color: TEXT_MUTED }}>Longitud</label>
                        <input type="number" step="any" name="longitud" value={formData.longitud || ''} onChange={handleChange} className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2" style={{ borderColor: PRIMARY_COLOR, '--tw-ring-color': PRIMARY_COLOR }} />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1" style={{ color: TEXT_MUTED }}>Estancia Mínima (noches)</label>
                        <input type="number" min="1" name="estancia_minima" value={formData.estancia_minima || ''} onChange={handleChange} className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2" style={{ borderColor: PRIMARY_COLOR, '--tw-ring-color': PRIMARY_COLOR }} />
                    </div>
                    <div className="sm:col-span-1">
                        <label className="block text-sm font-semibold mb-1" style={{ color: TEXT_MUTED }}>Fotos (Máx. 20)</label>
                        <PhotoUploader 
                            newFiles={photoFiles} 
                            setNewFiles={setPhotoFiles} 
                            existingPhotos={existingModalPhotos}
                            onDeleteExisting={handleDeletePhotoFromModal}
                            propertyId={property?.id_propiedad}
                            onSetPrincipal={handleSetPhotoAsPrincipal}
                            maxFiles={20} 
                        />
                    </div>
                </div>

                <div className="mt-8 flex flex-col sm:flex-row justify-end gap-4">
                    <button onClick={onClose} className="px-6 py-2 rounded-lg font-semibold border order-2 sm:order-1" style={{ color: TEXT_DARK, borderColor: TEXT_DARK }}>Cancelar</button>
                    <button onClick={handleSave} className="px-6 py-2 rounded-lg font-semibold text-white order-1 sm:order-2" style={{ backgroundColor: GREEN_ACTION }}>{property ? 'Guardar Cambios' : 'Crear Propiedad'}</button>
                </div>
            </div>
        </div>
    );
}

// ====== COMPONENTE PARA CARGA DE FOTOS (ACTUALIZADO) ======
function PhotoUploader({ newFiles, setNewFiles, existingPhotos = [], onDeleteExisting, propertyId, maxFiles = 20, onSetPrincipal }) {
    const [previews, setPreviews] = useState([]);
    const fileInputRef = React.useRef(null);

    useEffect(() => {
        const generatePreviews = async () => {
            const existingPreviews = existingPhotos.map(photo => ({
                id: photo.id_foto,
                name: photo.nombre_foto,
                url: photo.url_foto ? `${photo.url_foto}?f_auto,q_auto,dpr_auto` : undefined,
                isExisting: true,
                principal: photo.principal // Incluir estado principal
            }));

            const newFilePreviews = [];
            for (const file of newFiles) {
                if (file.type.startsWith('image/')) {
                    const previewUrl = await readFileAsDataURL(file);
                    newFilePreviews.push({ name: file.name, url: previewUrl, isExisting: false, principal: false });
                }
            }
            setPreviews([...existingPreviews, ...newFilePreviews]);
        };
        generatePreviews();
    }, [newFiles, existingPhotos]);

    const readFileAsDataURL = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => resolve(event.target.result);
            reader.onerror = (error) => reject(error);
            reader.readAsDataURL(file);
        });
    };

    const handleFiles = (incomingFiles) => {
        const filesToAdd = Array.from(incomingFiles);
        if (newFiles.length + existingPhotos.length + filesToAdd.length > maxFiles) {
            alert(`No puedes subir más de ${maxFiles} fotos en total.`);
            return;
        }
        setNewFiles(prev => [...prev, ...filesToAdd]);
    };

    const handleDrop = (e) => {
        e.preventDefault(); e.stopPropagation();
        e.currentTarget.style.borderColor = BORDER_COLOR;
        if (e.dataTransfer.files?.length) {
            handleFiles(e.dataTransfer.files);
            e.dataTransfer.clearData();
        }
    };

    const handleDragOver = (e) => { e.preventDefault(); e.stopPropagation(); e.currentTarget.style.borderColor = PRIMARY_COLOR; };
    const handleDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); e.currentTarget.style.borderColor = BORDER_COLOR; };
    
    const handleSelectFiles = (e) => {
        if (e.target.files?.length) {
            handleFiles(e.target.files);
            e.target.value = null; 
        }
    };

    const handleRemove = (item) => {
        if (item.isExisting) {
            onDeleteExisting(item.id, propertyId);
        } else {
            setNewFiles(prev => prev.filter(file => file.name !== item.name));
        }
    };

    return (
        <div>
            <div
                onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-gray-400"
                style={{ borderColor: BORDER_COLOR, minHeight: '100px', display: 'flex', flexDirection:'column', justifyContent:'center', alignItems:'center' }}
            >
                <input type="file" multiple accept="image/*" onChange={handleSelectFiles} ref={fileInputRef} style={{ display: 'none' }} />
                 <UploadIcon />
                <p style={{ color: TEXT_MUTED, marginTop:'8px' }}>Arrastra fotos o haz clic (Máx. {maxFiles})</p>
            </div>

            {previews.length > 0 && (
                <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {previews.map((preview) => (
                        <div key={preview.id || preview.name} className="relative group">
                            <img src={preview.url} alt={preview.name} className="w-full h-20 object-cover rounded" />

                            {/* BOTÓN/ICONO DE ESTRELLA (Principal) */}
                            {preview.isExisting && (
                                <div className="absolute top-0 left-0 m-1 p-0.5 bg-black bg-opacity-40 rounded-full cursor-pointer opacity-80 group-hover:opacity-100 transition-opacity">
                                    <StarIcon 
                                        isPrincipal={preview.principal} 
                                        onClick={(e) => { 
                                            e.stopPropagation();
                                            if (!preview.principal) {
                                                onSetPrincipal(preview.id, propertyId);
                                            }
                                        }} 
                                    />
                                </div>
                            )}

                            {/* Botón de Eliminar */}
                            <button 
                                onClick={(e) => { e.stopPropagation(); handleRemove(preview); }}
                                className="absolute top-0 right-0 m-1 p-0.5 bg-red-600 text-white rounded-full text-xs leading-none opacity-0 group-hover:opacity-100 transition-opacity" 
                                aria-label="Eliminar foto"
                            >
                                &#x2715;
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ====== ÍCONOS SVG ======
function PlusIcon() { return (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 5v14m-7-7h14" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>); }
function UploadIcon() { return (<svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: TEXT_MUTED }}> <path d="M12 16.5V9.5M12 9.5L15 12.5M12 9.5L9 12.5M16 16.5H19C20.1046 16.5 21 15.6046 21 14.5V11.5C21 7.35786 17.6421 4 13.5 4H10.5C6.35786 4 3 7.35786 3 11.5V14.5C3 15.6046 3.89543 16.5 5 16.5H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>); }
function StarIcon({ isPrincipal = false, onClick }) { 
    return (
        <svg 
            onClick={onClick}
            className={`cursor-pointer transition-colors ${isPrincipal ? 'text-yellow-400' : 'text-white opacity-75 hover:text-yellow-300'}`} 
            width="20" height="20" viewBox="0 0 24 24" fill={isPrincipal ? PRIMARY_COLOR : "currentColor"} 
            stroke={isPrincipal ? PRIMARY_COLOR : "currentColor"} 
            xmlns="http://www.w3.org/2000/svg"
        >
            <path 
                d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" 
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
                fill={isPrincipal ? PRIMARY_COLOR : "none"}
                style={{ stroke: isPrincipal ? PRIMARY_COLOR : 'none', fill: isPrincipal ? PRIMARY_COLOR : 'none' }}
            />
            {/* Relleno para que se vea dorado, utilizando la propiedad fill en el SVG principal */}
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill={isPrincipal ? PRIMARY_COLOR : "none"} />
        </svg>
    );
}
function Notification({ message, type, show, onClose }) { return ( <div className={`fixed top-5 right-5 z-[100] transition-all duration-300 ${show ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}> <div className="flex items-center gap-4 p-4 rounded-lg shadow-lg" style={{ backgroundColor: type === 'success' ? GREEN_SUCCESS_BG : RED_ERROR_BG, color: type === 'success' ? GREEN_SUCCESS_TEXT : RED_ERROR_TEXT }}> <span className="font-bold text-xl">{type === 'success' ? '✓' : '✗'}</span> <p className="font-semibold">{message}</p> <button onClick={onClose} className="font-bold text-2xl leading-none">&times;</button> </div> </div> ); }
function ConfirmationModal({ isOpen, onClose, onConfirm, title, message }) { if (!isOpen) return null; return ( <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black bg-opacity-50"> <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6 m-4"> <h3 className="text-xl font-bold mb-4" style={{ color: TEXT_DARK }}>{title}</h3> <p className="mb-6" style={{ color: TEXT_MUTED }}>{message}</p> <div className="flex justify-end gap-4"> <button onClick={onClose} className="px-5 py-2 rounded-lg font-semibold border" style={{ color: TEXT_DARK, borderColor: TEXT_DARK }}> Cancelar </button> <button onClick={onConfirm} className="px-5 py-2 rounded-lg font-semibold text-white" style={{ backgroundColor: RED_ACTION }}> Confirmar </button> </div> </div> </div> ); }
