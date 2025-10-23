import { useEffect, useMemo, useState } from "react";
import { Calendar, MapPin, X, Star, Clock, Home } from "lucide-react";
import Navbar from "./NavBar"; // 👈 nombre exacto de tu archivo: NavBar.jsx

const API_URL = import.meta.env.VITE_API_URL; // ej: http://localhost:4000/api
const TEXT_DARK = "#1F2937";

/* ========================= Helpers de rutas ========================= */
const propertyUrl = (r) => (r?.property?.id ? `/propiedades/${r.property.id}` : "#");

const contactUrl = (r) => {
  // Tu payload no trae host. Dejamos fallback a soporte.
  return "/soporte";
};

function mapStatus(etiqueta) {
  // etiqueta del back: "activa" | "proxima" | "finalizada" | (opcional "cancelada")
  if (etiqueta === "activa") return "active";
  if (etiqueta === "proxima") return "upcoming";
  if (etiqueta === "finalizada") return "completed";
  if (etiqueta === "cancelada") return "cancelled";
  return "completed";
}

/* ========================= Subcomponentes ========================= */
function StatusPill({ status }) {
  const map = {
    active:    "bg-emerald-50 text-emerald-700 border-emerald-200",
    completed: "bg-sky-50 text-sky-700 border-sky-200",
    cancelled: "bg-rose-50 text-rose-700 border-rose-200",
    upcoming:  "bg-amber-50 text-amber-700 border-amber-200",
  };
  const label = { active:"ACTIVA", completed:"FINALIZADA", cancelled:"CANCELADA", upcoming:"PRÓXIMA" }[status] ?? status;
  return (
    <span className={`inline-flex items-center gap-1 border px-2.5 py-1 rounded-full text-xs font-medium ${map[status] || "bg-neutral-50 text-neutral-700 border-neutral-200"}`}>
      <Clock className="size-3.5" /> {label}
    </span>
  );
}

function StarRating({ value = 0, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1,2,3,4,5].map(n => (
        <button
          key={n}
          type="button"
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange?.(n)}
          className="p-1"
          aria-label={`Calificar ${n}`}
        >
          <Star className={`size-5 transition ${ (hover || value) >= n ? "fill-amber-400 text-amber-400" : "text-neutral-300" }`} />
        </button>
      ))}
    </div>
  );
}

/** Tinte cálido por estado */
function warmTintClasses(status, highlight) {
  const base = "rounded-2xl shadow-sm hover:shadow-md transition border";
  if (status === "cancelled") return `${base} bg-rose-50 border-rose-200`;
  if (highlight)              return `${base} bg-[#FFF6DB] border-[#FFE7A6] ring-1 ring-[#FFE7A6]`;
  if (status === "upcoming")  return `${base} bg-[#FFF8E6] border-[#FFE7A6]`;
  if (status === "completed") return `${base} bg-[#FFF9EE] border-[#FFE7A6]`;
  return `${base} bg-[#FFF8E6] border-[#FFE7A6]`;
}

/* ========================= Card de Reserva ========================= */
function ReservationCard({ r, onCancel, onSendRating, highlight = false, compact = false }) {
  const nights = Math.max(1, Math.ceil((new Date(r.check_out) - new Date(r.check_in)) / (1000*60*60*24)));
  const total  = r.property?.price_per_night ? (r.property.price_per_night * nights) : null;

  const [ratingOpen, setRatingOpen] = useState(false);
  const [rating, setRating]         = useState(r.rating ?? 0);
  const [comment, setComment]       = useState("");
  const [confirmCancel, setConfirmCancel] = useState(false);

  const progress = (() => {
    const ci = +new Date(r.check_in), co = +new Date(r.check_out), now = +new Date();
    if (now <= ci) return 0; if (now >= co) return 100;
    return Math.min(100, Math.max(0, ((now - ci) / (co - ci)) * 100));
  })();

  return (
    <article className={`${warmTintClasses(r.status, highlight)} ${compact ? "p-4" : "p-5"}`}>
      <div className="flex items-start gap-4">
        <a href={propertyUrl(r)} aria-label="Ver publicación">
          <img
            src={"https://picsum.photos/seed/aloja/400/300"} // tu payload no trae imagen => placeholder
            alt={r.property?.title || "Propiedad"}
            className={`object-cover rounded-xl border border-white/60 ${compact ? "w-28 h-24" : "w-40 h-32"} hover:opacity-95 transition`}
            loading="lazy"
          />
        </a>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className={`font-semibold leading-tight truncate ${compact ? "text-[15px]" : "text-lg"}`}>
                {r.property?.title || "Propiedad"}
              </h3>
              <div className="mt-1 flex items-center gap-2 text-neutral-700 text-sm">
                <MapPin className="size-4" />
                <span className="truncate">—</span>
              </div>
            </div>
            <StatusPill status={r.status} />
          </div>

          <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-neutral-800">
            <div className="flex items-center gap-2">
              <Calendar className="size-4 text-neutral-600" />
              <span>{fmtDate(r.check_in)} — {fmtDate(r.check_out)} · {nights} {nights===1?"noche":"noches"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Home className="size-4 text-neutral-600" />
              <span>{r.guests ?? 1} {Number(r.guests)===1?"huésped":"huéspedes"}</span>
            </div>
          </div>

          {total !== null && (
            <div className="mt-3 text-[15px] font-medium text-neutral-900">
              Total estimado: ${total} <span className="text-neutral-600">({r.property.price_per_night}/noche)</span>
            </div>
          )}

          {r.status === "active" && (
            <div className="mt-3">
              <div className="h-2 w-full bg-white/70 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full transition-[width]" style={{ width: `${progress}%` }} />
              </div>
              <div className="mt-1 flex justify-between text-xs text-neutral-700">
                <span>Check-in</span>
                <span>Check-out</span>
              </div>
            </div>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-2 justify-end">
            {(r.status === "active" || r.status === "upcoming") && (
              <a
                href={contactUrl(r)}
                className="px-3.5 py-2 rounded-xl text-sm border border-neutral-300 text-neutral-800 hover:bg-white/60"
              >
                Contactar anfitrión
              </a>
            )}

            <button
              onClick={() => window.location.assign(`/reserva?id=${r.property.id}`)}
              className="px-3.5 py-2 rounded-xl text-sm border border-neutral-300 text-neutral-800 hover:bg-white/60"
            >
              Ver detalles
            </button>

            {r.status === "active" && !confirmCancel && (
              <button
                onClick={() => setConfirmCancel(true)}
                className="inline-flex items-center gap-2 border border-neutral-400 text-neutral-900 hover:bg-white/60 px-3.5 py-2 rounded-xl text-sm"
              >
                <X className="size-4" /> Cancelar
              </button>
            )}

            {confirmCancel && (
              <div className="w-full bg-rose-50 border border-rose-200 text-rose-800 rounded-xl px-3.5 py-2 flex items-center justify-between gap-2">
                <span className="text-sm">¿Seguro que querés cancelar esta reserva?</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { setConfirmCancel(false); onCancel?.(r); }}
                    className="px-3 py-2 rounded-lg text-sm bg-rose-600 text-white hover:bg-rose-700"
                  >
                    Sí, cancelar
                  </button>
                  <button
                    onClick={() => setConfirmCancel(false)}
                    className="px-3 py-2 rounded-lg text-sm border border-rose-300 text-rose-700 hover:bg-rose-100"
                  >
                    No, volver
                  </button>
                </div>
              </div>
            )}

            {r.status === "completed" && r.rating && (
              <div className="flex items-center gap-1 text-amber-500">
                {[...Array(r.rating)].map((_,i)=><Star key={i} className="size-4 fill-amber-400" />)}
                <span className="text-sm text-neutral-700 ml-1">Tu calificación</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

/* ========================= Página completa ========================= */
export default function GestionarReservas() {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // 1) usuario actual
        const r1 = await fetch(`${API_URL}/auth/current`, {
          credentials: "include",
          headers: { "Cache-Control": "no-store" },
        });
        if (!r1.ok) throw new Error("No autorizado");
        const current = await r1.json(); // { id_usuario } | { data: { id_usuario } }
        const userId = Number(current?.data?.id_usuario ?? current?.id_usuario);

        // 2) mis reservas
        const r2 = await fetch(`${API_URL}/reservations/myReservations/${userId}`, {
          credentials: "include",
          headers: { "Cache-Control": "no-store" },
        });
        const payload = await r2.json();

        // 3) adaptar {activas, historial} -> array de tarjetas
        const toCard = (x) => ({
          id: x.id_reserva,
          check_in: x.fecha_inicio,
          check_out: x.fecha_fin,
          guests: 1, // si luego guardás huéspedes, cámbialo
          status: mapStatus(x.etiqueta),
          property: {
            id: x.id_propiedad,
            title: x.nombre_propiedad ?? "Propiedad",
            price_per_night: Number(x.precio_por_noche ?? 0),
          },
          rating: x.rating ?? null, // tu payload no lo manda; queda null
        });

        const list = [
          ...(payload.activas   || []).map(toCard),
          ...(payload.historial || []).map(toCard),
        ];

        if (!cancelled) setReservas(list);
      } catch (err) {
        console.error("Error cargando reservas:", err);
        if (!cancelled) setReservas([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const all       = useMemo(() => reservas.map(r => ({ ...r, status: r.status || inferStatus(r) })), [reservas]);
  const activa    = useMemo(() => all.find(r => r.status === "active") || all.find(r => r.status === "upcoming"), [all]);
  const historial = useMemo(() => all.filter(r => r !== activa), [all, activa]);

  const onCancel = async (r) => {
    // tu API para cancelar puede ser distinta; la dejo comentada por si aún no existe:
    // await fetch(`${API_URL}/reservations/${r.id}/cancel`, { method: "PATCH", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ status: "cancelled" }) }).catch(()=>{});
    setReservas(prev => prev.map(x => x.id === r.id ? { ...x, status: "cancelled" } : x));
  };

  const onSendRating = async (r, rating, comment) => {
    if (!rating) return;
    // endpoint placeholder:
    // await fetch(`${API_URL}/reservations/${r.id}/rate`, { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ rating, comment }) }).catch(()=>{});
    setReservas(prev => prev.map(x => x.id === r.id ? { ...x, rating, status: "completed" } : x));
  };

  const freeCancelUntil = activa ? addHours(new Date(activa.check_in), -48) : null;

  return (
    <div className="relative min-h-screen bg-white">
      <Navbar /> {/* ✅ barra de navegación global */}

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 pt-[90px]">
        <h1 className="text-3xl font-extrabold tracking-tight mb-8">Mis Reservas</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-9 space-y-12">
            {/* === ACTIVA / PRÓXIMA === */}
            <section>
              <div className="flex items-center">
                <h2 className="text-sm font-semibold text-neutral-700 uppercase tracking-wide">Reserva activa</h2>
                <div className="h-px flex-1 ml-4 bg-neutral-200" />
              </div>

              <div className="mt-5">
                {loading ? <SkeletonCards /> : (
                  activa ? (
                    <ReservationCard r={activa} onCancel={onCancel} onSendRating={onSendRating} highlight />
                  ) : (
                    <p className="text-neutral-700 text-sm">No tenés reservas activas en este momento.</p>
                  )
                )}
              </div>
            </section>

            {/* === HISTORIAL === */}
            <section>
              <div className="flex items-center">
                <h2 className="text-sm font-semibold text-neutral-700 uppercase tracking-wide">Historial</h2>
                <div className="h-px flex-1 ml-4 bg-neutral-200" />
              </div>

              <div className="mt-5 space-y-5">
                {loading ? <SkeletonCards /> : (
                  historial.length ? historial.map(r => (
                    <ReservationCard key={r.id} r={r} onCancel={onCancel} onSendRating={onSendRating} compact />
                  )) : (
                    <p className="text-neutral-700 text-sm">Aún no tenés reservas previas.</p>
                  )
                )}
              </div>
            </section>
          </div>

          {/* === SIDEBAR === */}
          <aside className="lg:col-span-3 space-y-6 lg:pt-10">
            <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-sm">
              <h3 className="font-semibold">Resumen rápido</h3>
              <ul className="mt-3 space-y-2 text-sm text-neutral-700">
                <li className="flex justify-between"><span>Reservas activas</span><strong>{activa ? 1 : 0}</strong></li>
                <li className="flex justify-between"><span>Reservas previas</span><strong>{historial.length}</strong></li>
              </ul>
              {freeCancelUntil && (
                <div className="mt-4 rounded-xl bg-[#FFF8E6] border border-[#FFE7A6] p-3 text-neutral-900 text-sm">
                  Cancelación gratuita hasta <strong>{fmtDateTime(freeCancelUntil)}</strong>.
                </div>
              )}
            </div>

            <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-sm">
              <h3 className="font-semibold">Consejos</h3>
              <ul className="mt-3 list-disc pl-5 space-y-1 text-sm text-neutral-700">
                <li>Revisá horarios de check-in y check-out.</li>
                <li>Calificá tus estadías para ayudar a otros.</li>
                <li>Para cambios de fechas, contactá al anfitrión.</li>
              </ul>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

/* ========================= Helpers ========================= */
function fmtDate(s) {
  try { return new Date(s).toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" }); }
  catch { return s; }
}
function fmtDateTime(d) {
  try { return new Date(d).toLocaleString("es-AR", { day:"2-digit", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit" }); }
  catch { return String(d); }
}
function addHours(d, h) { const nd = new Date(d); nd.setHours(nd.getHours()+h); return nd; }
function inferStatus(r, now = new Date()) {
  const ci = new Date(r.check_in), co = new Date(r.check_out);
  if (r.status) return r.status;
  if (r.cancelled) return "cancelled";
  if (now >= ci && now < co) return "active";
  if (now < ci) return "upcoming";
  return "completed";
}
function SkeletonCards() {
  return (
    <div className="animate-pulse space-y-3">
      <div className="h-36 bg-neutral-200 rounded-2xl" />
      <div className="h-36 bg-neutral-200 rounded-2xl" />
    </div>
  );
}
