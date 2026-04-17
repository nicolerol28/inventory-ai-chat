import { useState, useEffect, useRef } from "react";
import { useAuth } from "../hooks/useAuth";
import { loginRequest } from "../api/auth";

export function ReAuthModal() {
  const { showReAuth, setShowReAuth, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!showReAuth) return;
    const dialog = dialogRef.current;
    if (!dialog) return;

    function onKeyDown(e) {
      if (e.key !== "Tab") return;
      const live = Array.from(
        dialog.querySelectorAll('input:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])')
      );
      const first = live[0];
      const last = live[live.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [showReAuth]);

  if (!showReAuth) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await loginRequest(email, password);
      login(data.token);
      setShowReAuth(false);
      setEmail("");
      setPassword("");
    } catch {
      setError("Credenciales incorrectas");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/20 dark:bg-black/40 z-40" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="reauth-title"
          className="pointer-events-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl p-6 w-80 flex flex-col gap-4"
        >
          <div>
            <h3 id="reauth-title" className="text-sm font-semibold text-gray-900 dark:text-white">
              Sesión expirada
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              Ingresa tus credenciales para continuar
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Correo electrónico"
              required
              autoFocus
              className="w-full px-3 py-2 rounded-lg text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-700 dark:text-gray-300 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              required
              className="w-full px-3 py-2 rounded-lg text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-700 dark:text-gray-300 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />

            {error && <p className="text-xs text-red-500">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? "Ingresando..." : "Reingresar"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
