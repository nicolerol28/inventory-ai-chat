export function ChatInput({ input, setInput, isStreaming, rateLimited, inputRef, onSend, onCancel }) {
  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  }

  return (
    <div className="flex-shrink-0 px-4 sm:px-6 py-3 bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800 transition-colors duration-300">
      {/* Rate limit warning */}
      {rateLimited && (
        <div className="max-w-3xl mx-auto mb-2">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 text-xs">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            Límite alcanzado. Espera un momento antes de enviar otro mensaje.
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto flex items-center gap-2">
        <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 focus-within:border-blue-400 dark:focus-within:border-blue-600 transition-colors">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value.slice(0, 500))}
            onKeyDown={handleKeyDown}
            disabled={isStreaming}
            placeholder="Escribe tu pregunta..."
            aria-label="Mensaje para el asistente"
            className="flex-1 text-sm bg-transparent text-gray-700 dark:text-gray-300 placeholder-gray-400 focus:outline-none disabled:opacity-50"
          />
          {isStreaming && (
            <button
              type="button"
              onClick={onCancel}
              className="text-gray-400 hover:text-red-500 transition-colors"
              aria-label="Cancelar respuesta"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <rect x="6" y="6" width="12" height="12" rx="2"/>
              </svg>
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={onSend}
          disabled={isStreaming || !input.trim()}
          className="w-10 h-10 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center text-white transition-colors flex-shrink-0"
          aria-label="Enviar mensaje"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
