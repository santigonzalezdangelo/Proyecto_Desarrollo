const PLACEHOLDER = "https://via.placeholder.com/800x500?text=AlojaApp";

export default function PropertyCard({
  id,
  id_propiedad,        // ← puede venir con este nombre desde el backend
  image,
  title,
  subtitle,
  rating = 0,
  href,                // ← si lo querés forzar manualmente
  onClick,             // ← callback opcional
}) {
  const safeTitle = title || "Propiedad";
  const pid = id_propiedad ?? id; // resolvemos el id que tengamos
  const link = href || (pid != null ? `/reserva?id=${encodeURIComponent(pid)}` : null);

  const go = (e) => {
    if (onClick) {
      onClick(e, pid);
      return;
    }
    if (link) {
      // navegación sin depender del router
      window.location.assign(link);
    }
  };

  // Si hay link, usamos <a>; si no, dejamos <article>
  const Wrapper = link ? "a" : "article";
  const wrapperProps = link
    ? { href: link }
    : { role: "button", tabIndex: 0, onKeyDown: (e) => (e.key === "Enter" || e.key === " ") && go(e) };

  return (
    <Wrapper
      {...wrapperProps}
      onClick={go}
      className="block overflow-hidden rounded-2xl shadow-md bg-white transition-transform duration-300 hover:scale-[1.03] hover:shadow-xl cursor-pointer"
      aria-label={safeTitle}
    >
      <div className="aspect-[16/10] w-full overflow-hidden bg-slate-100">
        <img
          src={image || PLACEHOLDER}
          alt={safeTitle}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 hover:scale-110"
          onError={(e) => {
            if (e.currentTarget.src !== PLACEHOLDER) e.currentTarget.src = PLACEHOLDER;
          }}
          referrerPolicy="no-referrer"
        />
      </div>
      <div className="p-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-slate-900">{safeTitle}</h3>
          {subtitle && <p className="text-sm text-slate-600">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-1">
          ⭐<span className="text-sm font-medium">{Number(rating).toFixed(1)}</span>
        </div>
      </div>
    </Wrapper>
  );
}
