import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { loginRequest } from "../api/auth";

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/chat";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [demoError, setDemoError] = useState(null);

  async function handleDemo() {
    setDemoError(null);
    setDemoLoading(true);
    try {
      const data = await loginRequest(
        import.meta.env.VITE_DEMO_EMAIL,
        import.meta.env.VITE_DEMO_PASSWORD,
      );
      login(data.token);
      navigate("/chat", { replace: true });
    } catch {
      setDemoError("Error al cargar el demo, intenta de nuevo");
    } finally {
      setDemoLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await loginRequest(email, password);
      login(data.token);
      navigate(from, { replace: true });
    } catch {
      setError("Credenciales incorrectas. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">

      {/* Lado izquierdo */}
      <div className="hidden lg:flex w-[54%] bg-[#1E3A5F] flex-col justify-between p-14 relative overflow-hidden">

        {/* Círculos decorativos */}
        <div className="absolute top-[-60px] left-[-60px] w-64 h-64 rounded-full bg-[#185FA5] opacity-30"/>
        <div className="absolute bottom-[-80px] right-[-80px] w-80 h-80 rounded-full bg-[#2563EB] opacity-20"/>
        <div className="absolute top-16 right-24 w-32 h-32 rounded-full bg-[#378ADD] opacity-15"/>

        {/* Grid decorativo */}
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "linear-gradient(#378ADD 1px, transparent 1px), linear-gradient(90deg, #378ADD 1px, transparent 1px)",
            backgroundSize: "130px 130px"
          }}
        />

       {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center">
            <img src="/favicon.svg" alt="logo" className="w-9 h-9" />
          </div>
          <span className="text-white font-bold text-lg tracking-wide">Inventory AI</span>
        </div>

        {/* Texto central */}
        <div className="relative">
          <h1 className="text-5xl font-bold text-white leading-tight tracking-tight mb-4">
            Asistente<br/>inteligente.
          </h1>
          <p className="text-blue-300 text-sm leading-relaxed mb-10">
            Consulta tu inventario con lenguaje natural,<br/>potenciado por inteligencia artificial.
          </p>
          <div className="flex flex-col gap-3">
            {[
              "Consulta stock por bodega en lenguaje natural",
              "Reportes de compras generados con IA",
              "Búsqueda semántica de productos"
            ].map((f) => (
              <div key={f} className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-sm bg-blue-500 flex-shrink-0"/>
                <span className="text-blue-200 text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative">
          <p className="text-blue-400 text-xs">© 2026 Nicole Roldan</p>
        </div>
      </div>

      {/* Lado derecho */}
      <div className="flex-1 flex items-center justify-center px-8" style={{ backgroundColor: "#F8FAFC" }}>
        <div className="w-full max-w-sm">

          {/* Logo móvil */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
                <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
                <path d="M12 12l9-5.2M12 12l-9-5.2M12 12v10"/>
              </svg>
            </div>
            <span className="text-gray-900 font-bold text-sm">Inventory AI</span>
          </div>

          <h2 className="text-2xl font-semibold mb-1" style={{ color: "#0F172A" }}>
            Bienvenido de nuevo
          </h2>
          <p className="text-sm text-gray-400 mb-8">
            Ingresa tus credenciales para continuar
          </p>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                Correo electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@inventario.com"
                required
                className="w-full px-3 py-2.5 rounded-lg text-sm border border-gray-200 bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-3 py-2.5 rounded-lg text-sm border border-gray-200 bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              />
            </div>

            {error && (
              <p className="text-xs text-red-500">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? "Ingresando..." : "Ingresar"}
            </button>
          </form>

          {/* Separador */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-gray-200"/>
            <span className="text-xs text-gray-400">o</span>
            <div className="flex-1 h-px bg-gray-200"/>
          </div>

          {/* Botón demo */}
          <button
            type="button"
            onClick={handleDemo}
            disabled={demoLoading}
            className="w-full px-4 py-2.5 rounded-lg text-sm font-medium border border-blue-600 text-blue-600 hover:bg-blue-50 disabled:opacity-50 transition-colors"
          >
            {demoLoading ? "Cargando demo..." : "Probar demo"}
          </button>
          {demoError && (
            <p className="text-xs text-red-500 mt-1.5">{demoError}</p>
          )}

          {/* Footer */}
          <p className="text-center text-xs text-gray-400 mt-10">
            Asistente de inventario potenciado por IA
          </p>
        </div>
      </div>
    </div>
  );
}
