import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, ChevronLeft } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "", confirm: "" });
  const [show, setShow] = useState({ p1: false, p2: false });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const DEFAULT_ROLE_ID = import.meta.env.VITE_DEFAULT_ROLE_ID; // ID del rol predeterminado para nuevos usuarios
  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const validEmail = (v) => /\S+@\S+\.\S+/.test(v);
  const passOk = form.password.length >= 8;
  const same = form.password === form.confirm;
  const canSubmit = validEmail(form.email) && passOk && same && !loading;

  const submit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setErr("");
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
        correo: form.email.trim(),
        password: form.password,
        id_rol: DEFAULT_ROLE_ID,   
  }),
        
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || "No se pudo registrar");
      }
      navigate("/login");
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
      <div className="relative w-full max-w-md">
        <Link
          to="/login"
          className="absolute -top-10 left-0 inline-flex items-center gap-1 text-sm text-neutral-600 hover:text-neutral-800"
        >
          <ChevronLeft className="size-4" /> Volver a Ingresar
        </Link>

        <div className="bg-white rounded-3xl shadow-2xl border border-neutral-100 p-8">
          <div className="flex flex-col items-center mb-6">
            <img
              src="/images/logo.png"
              alt="AlojaApp"
              className="object-contain"
              style={{ maxHeight: 48 }}
            />
            <h1 className="mt-3 text-2xl font-bold tracking-tight">Crear cuenta</h1>
            <p className="mt-1 text-sm text-neutral-600 text-center">
              Registrate para gestionar reservas o publicar propiedades.
            </p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-neutral-800 mb-1">
                Correo electrónico
              </label>
              <div className="flex items-center gap-2 rounded-xl border border-neutral-300 bg-white px-3 py-2 focus-within:ring-2 ring-amber-300">
                <Mail className="size-4 text-neutral-500" />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={onChange}
                  placeholder="usuario@dominio.com"
                  className="w-full outline-none text-sm"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-neutral-800 mb-1">
                Contraseña <span className="text-neutral-500 font-normal">(mínimo 8)</span>
              </label>
              <div className="flex items-center gap-2 rounded-xl border border-neutral-300 bg-white px-3 py-2 focus-within:ring-2 ring-amber-300">
                <Lock className="size-4 text-neutral-500" />
                <input
                  type={show.p1 ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={onChange}
                  placeholder="********"
                  className="w-full outline-none text-sm"
                  autoComplete="new-password"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => ({ ...s, p1: !s.p1 }))}
                  className="p-1 text-neutral-500"
                  aria-label="Mostrar/ocultar contraseña"
                >
                  {show.p1 ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {/* Confirm */}
            <div>
              <label className="block text-sm font-medium text-neutral-800 mb-1">
                Repetir contraseña
              </label>
              <div className="flex items-center gap-2 rounded-xl border border-neutral-300 bg-white px-3 py-2 focus-within:ring-2 ring-amber-300">
                <Lock className="size-4 text-neutral-500" />
                <input
                  type={show.p2 ? "text" : "password"}
                  name="confirm"
                  value={form.confirm}
                  onChange={onChange}
                  placeholder="********"
                  className="w-full outline-none text-sm"
                  autoComplete="new-password"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => ({ ...s, p2: !s.p2 }))}
                  className="p-1 text-neutral-500"
                  aria-label="Mostrar/ocultar contraseña"
                >
                  {show.p2 ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {!same && form.confirm && (
                <p className="mt-1 text-xs text-rose-600">Las contraseñas no coinciden.</p>
              )}
            </div>

            {err && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 text-rose-700 text-sm px-3 py-2">
                {err}
              </div>
            )}

            <button
              type="submit"
              disabled={!canSubmit}
              className={`w-full rounded-xl py-2.5 text-white text-sm font-medium transition
                ${canSubmit ? "bg-amber-600 hover:bg-amber-700" : "bg-amber-300 cursor-not-allowed"}`}
            >
              {loading ? "Creando cuenta..." : "Registrarme"}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-neutral-700">
            ¿Ya tenés cuenta?{" "}
            <Link to="/login" className="text-amber-700 font-medium hover:underline">
              Ingresar
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-neutral-500">© {new Date().getFullYear()} Aloja</p>
      </div>
    </div>
  );
}
