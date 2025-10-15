import React from "react";

export default function PropertyCard({ image, title, subtitle, rating }) {
  return (
    <article
      className="overflow-hidden rounded-2xl shadow-md bg-white transition-transform duration-300 hover:scale-[1.03] hover:shadow-xl cursor-pointer"
    >
      <div className="aspect-[16/10] w-full overflow-hidden">
        <img
          src={image}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-300 hover:scale-110"
        />
      </div>
      <div className="p-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          {subtitle && <p className="text-sm text-slate-600">{subtitle}</p>}
        </div>
        {typeof rating === "number" && (
          <div className="flex items-center gap-1" aria-label={`Calificación ${rating} de 5`}>
            ⭐<span className="text-sm font-medium">{rating.toFixed(1)}</span>
          </div>
        )}
      </div>
    </article>
  );
}
