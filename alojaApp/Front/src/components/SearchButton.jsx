import React from "react";

export default function SearchButton({ onClick, disabled, label = "Buscar" }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full md:w-auto px-6 py-3 rounded-xl font-semibold transition-all duration-300 active:scale-[0.97] ${
        disabled
          ? "opacity-60 cursor-not-allowed"
          : "hover:brightness-105 hover:shadow-lg hover:-translate-y-0.5"
      }`}
      style={{
        backgroundColor: "#F8C24D",
        color: "#0F172A",
      }}
      aria-label={label}
    >
      {label}
    </button>
  );
}
