// // src/pages/Login.jsx (o donde lo uses)
// import { useState } from "react";

// const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
// const BG_IMAGE = import.meta.env.VITE_LOGIN_BG || ""; // opcional

// export default function Login() {
//   const [identifier, setIdentifier] = useState("");
//   const [password, setPassword] = useState("");
//   const [loading, setLoading]   = useState(false);
//   const [msg, setMsg] = useState("");

//   const onSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setMsg("");
//     try {
//       const r = await fetch(`${API_URL}/api/auth/login`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json", Accept: "application/json" },
//         credentials: "include",
//         body: JSON.stringify({ correo: identifier, password }),
//       });
//       const j = await r.json();
//       if (!r.ok) throw new Error(j?.error || `HTTP ${r.status}`);
//       // redirigí si querés: window.location.href = "/home";
//       window.location.href = "/home";
//     } catch (err) {
//       setMsg(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="relative min-h-screen overflow-hidden">
//       {/* Fondo (imagen opcional + capas) */}
//       {BG_IMAGE && (
//         <div
//           className="absolute inset-0 bg-cover bg-center -z-20"
//           style={{ backgroundImage: `url(${BG_IMAGE})` }}
//           aria-hidden
//         />
//       )}
//       <div className={`absolute inset-0 -z-10 ${BG_IMAGE ? "bg-white/70 backdrop-blur-[2px]" : "bg-gradient-to-br from-amber-50 via-amber-100 to-yellow-100"}`} />

//       {/* blobs decorativos suaves */}
//       <div className="pointer-events-none absolute -top-24 -left-16 h-80 w-80 rounded-full bg-amber-300/30 blur-3xl -z-10" />
//       <div className="pointer-events-none absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-orange-300/30 blur-3xl -z-10" />

//       {/* Contenedor centrado */}
//       <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-4">
//         <div className="w-full max-w-md">
//           {/* Card “glass” */}
//           <div className="rounded-2xl border border-white/60 bg-white/90 shadow-2xl backdrop-blur-md">
//             <div className="p-8 sm:p-10">
//               {/* Header */}
//               <div className="text-center">
//                 <div className="mx-auto grid h-12 w-12 place-content-center rounded-xl bg-amber-500 text-white shadow-lg shadow-amber-200/60">
//                   <span className="text-lg font-bold">A</span>
//                 </div>
//                 <h1 className="mt-4 text-2xl font-semibold tracking-tight text-neutral-800">
//                   ALOJA
//                 </h1>
//                 <p className="mt-2 text-sm leading-6 text-neutral-600">
//                   Accedé para gestionar tus reservas como huésped o publicar
//                   propiedades como anfitrión.
//                 </p>
//               </div>

//               {/* Form */}
//               <form onSubmit={onSubmit} className="mt-8 space-y-5">
//                 <div>
//                   <label className="block text-sm font-medium text-neutral-700">
//                     Ingrese usuario o mail
//                   </label>
//                   <input
//                     type="text"
//                     value={identifier}
//                     onChange={(e) => setIdentifier(e.target.value)}
//                     placeholder="usuario o correo@dominio.com"
//                     className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm shadow-sm placeholder:text-neutral-400 focus:border-amber-500 focus:outline-none focus:ring-4 focus:ring-amber-200"
//                     autoComplete="username"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-neutral-700">
//                     Ingrese contraseña
//                   </label>
//                   <input
//                     type="password"
//                     value={password}
//                     onChange={(e) => setPassword(e.target.value)}
//                     placeholder="********"
//                     className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm shadow-sm placeholder:text-neutral-400 focus:border-amber-500 focus:outline-none focus:ring-4 focus:ring-amber-200"
//                     autoComplete="current-password"
//                   />
//                 </div>

//                 <button
//                   type="submit"
//                   disabled={loading}
//                   className="group relative w-full transform rounded-xl bg-amber-600 px-4 py-3 text-sm font-medium text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-amber-700 hover:shadow-amber-300/50 focus:outline-none focus:ring-4 focus:ring-amber-200 disabled:cursor-not-allowed disabled:opacity-70"
//                 >
//                   {loading ? "Ingresando..." : "Ingresar"}
//                 </button>
//               </form>

//               {/* Footer */}
//               <div className="mt-5 text-center text-sm text-neutral-600">
//                 ¿No tenés cuenta?{" "}
//                 <a
//                   href="/register"
//                   className="font-medium text-amber-700 underline-offset-2 hover:underline"
//                 >
//                   Registrarse
//                 </a>
//               </div>

//               {msg && (
//                 <p className="mt-4 text-center text-sm text-red-600">{msg}</p>
//               )}
//             </div>
//           </div>

//           {/* Créditos / mini texto opcional */}
//           <p className="mt-6 text-center text-xs text-neutral-500">
//             © {new Date().getFullYear()} Aloja
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }


// src/pages/Login.jsx
import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function Login() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword]   = useState("");
  const [loading, setLoading]     = useState(false);
  const [msg, setMsg]             = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    try {
      const r = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        credentials: "include",
        body: JSON.stringify({ correo: identifier, password }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error || `HTTP ${r.status}`);
      setMsg(`Bienvenido, rol: ${j.rol || "—"}`);
      window.location.href = ("/");
    } catch (err) {
      setMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    // FONDO BLANCO — sin header/ribbon
    <div className="min-h-screen bg-white text-neutral-800">
      {/* Luces suaves (no es header) */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-[-8rem] top-[-6rem] h-64 w-64 rounded-full bg-amber-200/20 blur-3xl" />
        <div className="absolute right-[-10rem] bottom-[-8rem] h-72 w-72 rounded-full bg-yellow-300/20 blur-3xl" />
      </div>

      {/* Contenido */}
      <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-4">
        <div className="w-full max-w-md">
          {/* CARD LIMPIA (sin borde raro) */}
          <div className="rounded-[28px] bg-white p-0 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.35)] ring-1 ring-black/5">
            <div className="p-8 sm:p-10">
                      <div className="text-center">
                      <img
                        src="/images/logo2.png"
                        alt="Aloja logo"
                        className="mx-auto h-12 w-12 object-contain"
                        loading="lazy"
                      />
                      <h2 className="mt-4 text-2xl font-semibold tracking-tight">ALOJA</h2>
                      <p className="mt-2 text-sm text-neutral-600">
                        Accedé para gestionar tus reservas como huésped o publicar propiedades como anfitrión.
                      </p>
                      </div>

                      {/* FORM */}
              <form onSubmit={onSubmit} className="mt-8 space-y-5">
                <div className="relative">
                  <label htmlFor="identifier" className="mb-1 block text-sm font-medium text-neutral-700">
                    Ingrese usuario o mail
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 opacity-70">
                      <svg width="18" height="18" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M12 12a5 5 0 1 0-5-5a5 5 0 0 0 5 5m0 2c-5 0-9 2.5-9 5.5V22h18v-2.5C21 16.5 17 14 12 14" />
                      </svg>
                    </span>
                    <input
                      id="identifier"
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="usuario o correo@dominio.com"
                      autoComplete="username"
                      className="w-full rounded-xl border border-neutral-200 bg-white px-10 py-3 text-sm shadow-sm placeholder:text-neutral-400 focus:border-amber-500 focus:outline-none focus:ring-4 focus:ring-amber-200"
                    />
                  </div>
                </div>

                <div className="relative">
                  <label htmlFor="password" className="mb-1 block text-sm font-medium text-neutral-700">
                    Ingrese contraseña
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 opacity-70">
                      <svg width="18" height="18" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M17 8h-1V6a4 4 0 1 0-8 0v2H7a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2m-6 7.73V17h2v-1.27a2 2 0 1 0-2 0M9 8V6a3 3 0 1 1 6 0v2z" />
                      </svg>
                    </span>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="********"
                      autoComplete="current-password"
                      className="w-full rounded-xl border border-neutral-200 bg-white px-10 py-3 text-sm shadow-sm placeholder:text-neutral-400 focus:border-amber-500 focus:outline-none focus:ring-4 focus:ring-amber-200"
                    />
                  </div>
                </div>

                {/* BOTÓN */}
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full overflow-hidden rounded-xl bg-amber-600 px-4 py-3 text-sm font-medium text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-amber-700 hover:shadow-amber-300/50 focus:outline-none focus:ring-4 focus:ring-amber-200 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <span className="relative z-[1]">{loading ? "Ingresando..." : "Ingresar"}</span>
                  <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                </button>
              </form>

              {/* ESTADOS */}
              {msg && (
                <p
                  className={`mt-4 rounded-lg px-3 py-2 text-center text-sm ${
                    /bienvenido/i.test(msg)
                      ? "bg-green-50 text-green-700 ring-1 ring-green-200"
                      : "bg-red-50 text-red-700 ring-1 ring-red-200"
                  }`}
                >
                  {msg}
                </p>
              )}

              {/* FOOTER */}
              <div className="mt-6 text-center text-sm text-neutral-600">
                ¿No tenés cuenta?{" "}
                <a href="/register" className="font-medium text-amber-700 underline-offset-2 hover:underline">
                  Registrarse
                </a>
              </div>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-neutral-500">
            © {new Date().getFullYear()} Aloja
          </p>
        </div>
      </div>
    </div>
  );
}
