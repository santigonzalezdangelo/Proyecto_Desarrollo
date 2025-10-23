import { useEffect, useMemo, useState } from "react";
import { Calendar, MapPin, Clock, Home } from "lucide-react";
import Navbar from "./Navbar.jsx";

const API_URL = import.meta.env.VITE_API_URL;

/* ========================= Helpers de rutas ========================= */
const propertyUrl = (r) =>
  r?.property?.id ? `/propiedades/${r.property.id}` : "#";

/** Estado visual para la pill */
function mapStatus(etiqueta) {
  if (etiqueta === "activa") return "active";
  if (etiqueta === "proxima") return "upcoming";
  if (etiqueta === "finalizada") return "completed";
  if (etiqueta === "cancelada") return "cancelled";
  return "completed";
}

/* ========================= Subcomponentes ========================= */
function StatusPill({ status }) {
  const map = {
    active: "bg-emerald-50 text-emerald-700 border-emerald-200",
    completed: "bg-sky-50 text-sky-700 border-sky-200",
    cancelled: "bg-rose-50 text-rose-700 border-rose-200",
    upcoming: "bg-amber-50 text-amber-700 border-amber-200",
  };
  const label =
    {
      active: "ACTIVA",
      completed: "FINALIZADA",
      cancelled: "CANCELADA",
      upcoming: "PRÓXIMA",
    }[status] ?? status;

  return (
    <span
      className={`inline-flex items-center gap-1 border px-2.5 py-1 rounded-full text-xs font-medium ${
        map[status] || "bg-neutral-50 text-neutral-700 border-neutral-200"
      }`}
    >
      <Clock className="size-3.5" /> {label}
    </span>
  );
}

function warmTintClasses(status, highlight) {
  const base = "rounded-2xl shadow-sm hover:shadow-md transition border";
  if (status === "cancelled") return `${base} bg-rose-50 border-rose-200`;
  if (highlight)
    return `${base} bg-[#FFF6DB] border-[#FFE7A6] ring-1 ring-[#FFE7A6]`;
  if (status === "upcoming") return `${base} bg-[#FFF8E6] border-[#FFE7A6]`;
  if (status === "completed") return `${base} bg-[#FFF9EE] border-[#FFE7A6]`;
  return `${base} bg-[#FFF8E6] border-[#FFE7A6]`;
}

/* ========================= Card de Reserva ========================= */
function ReservationCard({ r, highlight = false, compact = false }) {
  const nights = Math.max(
    1,
    Math.ceil(
      (new Date(r.check_out) - new Date(r.check_in)) / (1000 * 60 * 60 * 24)
    )
  );

  const total =
    typeof r?.property?.price_per_night === "number"
      ? r.property.price_per_night * nights
      : null;

  const progress = (() => {
    const ci = +new Date(r.check_in);
    const co = +new Date(r.check_out);
    const now = +new Date();
    if (now <= ci) return 0;
    if (now >= co) return 100;
    return Math.min(100, Math.max(0, ((now - ci) / (co - ci)) * 100));
  })();

  const photo = r?.property?.photo || r?.property?.cover || null; // viene del endpoint /photos/cover/:id

  return (
    <article
      className={`${warmTintClasses(r.status, highlight)} ${
        compact ? "p-4" : "p-5"
      }`}
    >
      <div className="flex items-start gap-4">
        <a href={propertyUrl(r)} aria-label="Ver publicación">
          {photo ? (
            <img
              src={photo}
              alt={r?.property?.title ?? ""}
              className={`object-cover rounded-xl border border-white/60 ${
                compact ? "w-28 h-24" : "w-40 h-32"
              } hover:opacity-95 transition`}
              loading="lazy"
            />
          ) : (
            <div
              className={`bg-neutral-200 rounded-xl border border-white/60 ${
                compact ? "w-28 h-24" : "w-40 h-32"
              }`}
            />
          )}
        </a>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3
                className={`font-semibold leading-tight truncate ${
                  compact ? "text-[15px]" : "text-lg"
                }`}
              >
                {r?.property?.title ?? ""}
              </h3>
              <div className="mt-1 flex items-center gap-2 text-neutral-700 text-sm">
                <MapPin className="size-4" />
                <span className="truncate">{r?.property?.location ?? ""}</span>
              </div>
            </div>
            <StatusPill status={r.status} />
          </div>

          <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-neutral-800">
            <div className="flex items-center gap-2">
              <Calendar className="size-4 text-neutral-600" />
              <span>
                {fmtDate(r.check_in)} — {fmtDate(r.check_out)} · {nights}{" "}
                {nights === 1 ? "noche" : "noches"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Home className="size-4 text-neutral-600" />
              <span>
                {r?.guests ?? 1}{" "}
                {Number(r?.guests ?? 1) === 1 ? "huésped" : "huéspedes"}
              </span>
            </div>
          </div>

          {total !== null && (
            <div className="mt-3 text-[15px] font-medium text-neutral-900">
              Total estimado: ${total}{" "}
              <span className="text-neutral-600">
                ({r.property.price_per_night}/noche)
              </span>
            </div>
          )}

          {r.status === "active" && (
            <div className="mt-3">
              <div className="h-2 w-full bg-white/70 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-[width]"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="mt-1 flex justify-between text-xs text-neutral-700">
                <span>Check-in</span>
                <span>Check-out</span>
              </div>
            </div>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-2 justify-end">
            <button
              onClick={() =>
                r?.property?.id &&
                window.location.assign(`/reserva?id=${r.property.id}`)
              }
              disabled={!r?.property?.id}
              className={`px-3.5 py-2 rounded-xl text-sm border ${
                r?.property?.id
                  ? "border-neutral-300 text-neutral-800 hover:bg-white/60"
                  : "border-neutral-200 text-neutral-400 cursor-not-allowed"
              }`}
            >
              Ver detalles
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

/* ========================= Página completa ========================= */
export default function GestionarReservas() {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let aborted = false;
    (async () => {
      try {
        // 1) Usuario actual
        const r1 = await fetch(`${API_URL}/auth/current`, {
          credentials: "include",
          headers: { "Cache-Control": "no-store" },
        });
        if (!r1.ok) throw new Error("No autorizado");
        const current = await r1.json();
        const userId = Number(current?.data?.id_usuario ?? current?.id_usuario);

        // 2) Mis reservas
        const r2 = await fetch(
          `${API_URL}/reservations/myReservations/${userId}`,
          {
            credentials: "include",
            headers: { "Cache-Control": "no-store" },
          }
        );
        if (!r2.ok) throw new Error("No se pudieron obtener las reservas");
        const payload = await r2.json();

        // 3) Normalizar reservas
        const toCard = (x) => ({
          id: x.id_reserva,
          check_in: x.fecha_inicio,
          check_out: x.fecha_fin,
          guests: x.cantidad_huespedes ?? 1,
          status: mapStatus(x.etiqueta),
          property: {
            id: x.id_propiedad,
            title: x.nombre_propiedad,
            location: x.ubicacion_propiedad,
            price_per_night:
              typeof x.precio_por_noche === "number"
                ? x.precio_por_noche
                : undefined,
            photo: undefined, // se completa desde /photos/cover/:id
            cover: undefined,
          },
          rating: x.rating ?? null,
        });

        const baseList = [
          ...(payload?.activas ?? []).map(toCard),
          ...(payload?.historial ?? []).map(toCard),
        ];

        // 4) Completar cada propiedad: datos + cover
        const ids = [
          ...new Set(baseList.map((r) => r.property?.id).filter(Boolean)),
        ];
        const propMap = await fetchManyProperties(ids);

        const merged = baseList.map((r) => {
          const p = propMap.get(r.property.id) || {};
          return {
            ...r,
            property: {
              ...r.property,
              id: r.property.id,
              title: p.title ?? p.nombre ?? r.property.title,
              location: p.location ?? p.ubicacion ?? r.property.location,
              price_per_night:
                typeof r.property.price_per_night === "number"
                  ? r.property.price_per_night
                  : typeof p.price_per_night === "number"
                  ? p.price_per_night
                  : typeof p.precio_por_noche === "number"
                  ? p.precio_por_noche
                  : undefined,
              photo: p.photo ?? p.cover ?? undefined, // viene del endpoint /photos/cover
              cover: p.cover ?? undefined,
            },
          };
        });

        if (!aborted) setReservas(merged);
      } catch (e) {
        console.error("Error cargando reservas:", e);
        if (!aborted) setReservas([]);
      } finally {
        if (!aborted) setLoading(false);
      }
    })();
    return () => {
      aborted = true;
    };
  }, []);

  const all = useMemo(
    () => reservas.map((r) => ({ ...r, status: r.status || inferStatus(r) })),
    [reservas]
  );
  const activa = useMemo(
    () =>
      all.find((r) => r.status === "active") ||
      all.find((r) => r.status === "upcoming"),
    [all]
  );
  const historial = useMemo(
    () => all.filter((r) => r !== activa),
    [all, activa]
  );

  return (
    <div className="relative min-h-screen bg-white">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 pt-[90px]">
        <h1 className="text-3xl font-extrabold tracking-tight mb-8">
          Mis Reservas
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-9 space-y-12">
            {/* === ACTIVA / PRÓXIMA === */}
            <section>
              <div className="flex items-center">
                <h2 className="text-sm font-semibold text-neutral-700 uppercase tracking-wide">
                  Reserva activa
                </h2>
                <div className="h-px flex-1 ml-4 bg-neutral-200" />
              </div>

              <div className="mt-5">
                {loading ? (
                  <SkeletonCards />
                ) : activa ? (
                  <ReservationCard r={activa} highlight />
                ) : (
                  <p className="text-neutral-700 text-sm">
                    No tenés reservas activas en este momento.
                  </p>
                )}
              </div>
            </section>

            {/* === HISTORIAL === */}
            <section>
              <div className="flex items-center">
                <h2 className="text-sm font-semibold text-neutral-700 uppercase tracking-wide">
                  Historial
                </h2>
                <div className="h-px flex-1 ml-4 bg-neutral-200" />
              </div>

              <div className="mt-5 space-y-5">
                {loading ? (
                  <SkeletonCards />
                ) : historial.length ? (
                  historial.map((r) => (
                    <ReservationCard key={r.id} r={r} compact />
                  ))
                ) : (
                  <p className="text-neutral-700 text-sm">
                    Aún no tenés reservas previas.
                  </p>
                )}
              </div>
            </section>
          </div>

          {/* === SIDEBAR === */}
          <aside className="lg:col-span-3 space-y-6 lg:pt-10">
            {/* 👇 Consejos arriba */}
            <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-sm">
              <h3 className="font-semibold">Consejos</h3>
              <ul className="mt-3 list-disc pl-5 space-y-1 text-sm text-neutral-700">
                <li>Revisá horarios de check-in y check-out.</li>
                <li>Calificá tus estadías para ayudar a otros.</li>
                <li>Para cambios de fechas, contactá al anfitrión.</li>
              </ul>
            </div>

            {/* Resumen rápido (sin bloque de “Cancelación gratuita…”) */}
            <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-sm">
              <h3 className="font-semibold">Resumen rápido</h3>
              <ul className="mt-3 space-y-2 text-sm text-neutral-700">
                <li className="flex justify-between">
                  <span>Reservas activas</span>
                  <strong>{activa ? 1 : 0}</strong>
                </li>
                <li className="flex justify-between">
                  <span>Reservas previas</span>
                  <strong>{historial.length}</strong>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

/* ========================= Helpers ========================= */
// Trae propiedad completa + portada desde /photos/cover/:propertyId
async function fetchManyProperties(ids = []) {
  const map = new Map();
  await Promise.all(
    ids.map(async (id) => {
      // Propiedad
      const r = await fetch(`${API_URL}/properties/${id}`, {
        credentials: "include",
        headers: { "Cache-Control": "no-store" },
      });

      const prop = r.ok ? (await r.json().catch(() => ({})))?.data ?? {} : {};

      // Cover
      const rc = await fetch(`${API_URL}/photos/cover/${id}`, {
        credentials: "include",
        headers: { "Cache-Control": "no-store" },
      });

      if (rc.ok) {
        const jc = await rc.json().catch(() => ({}));
        const coverUrl = jc?.data?.url_foto ?? jc?.url_foto;
        if (coverUrl) {
          prop.cover = coverUrl;
          prop.photo = coverUrl; // lo usa la card
          prop.image_url = coverUrl; // por si lo necesitás en otras vistas
        }
      }

      map.set(id, prop);
    })
  );
  return map;
}

function fmtDate(s) {
  try {
    return new Date(s).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return s;
  }
}
function inferStatus(r, now = new Date()) {
  const ci = new Date(r.check_in);
  const co = new Date(r.check_out);
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
