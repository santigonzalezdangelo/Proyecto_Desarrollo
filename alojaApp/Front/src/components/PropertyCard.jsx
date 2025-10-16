const PLACEHOLDER = "https://via.placeholder.com/800x500?text=AlojaApp";

export default function PropertyCard({ image, title, subtitle, rating = 0 }) {
  const safeTitle = title || "Propiedad";
  return (
    <article className="overflow-hidden rounded-2xl shadow-md bg-white transition-transform duration-300 hover:scale-[1.03] hover:shadow-xl cursor-pointer">
      <div className="aspect-[16/10] w-full overflow-hidden bg-slate-100">
        <img
          src={image || PLACEHOLDER}
          alt={safeTitle}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 hover:scale-110"
          onError={(e) => {
            console.warn("Imagen rota:", e.currentTarget.src);
            if (e.currentTarget.src !== PLACEHOLDER) {
              e.currentTarget.src = PLACEHOLDER;
            }
          }}
          referrerPolicy="no-referrer"  // útil si el host bloquea por referrer (Drive, etc.)
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
    </article>
  );
}
