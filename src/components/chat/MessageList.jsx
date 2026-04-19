import { useState, useEffect, useRef } from "react";

export function MessageList({
  messages,
  isStreaming,
  messagesLoading,
  activeConversationId,
  loadError,
  messagesEndRef,
  onSuggestionClick,
}) {
  const suggestions = [
    "¿Cuál es el stock en la bodega Principal?",
    "Muéstrame los productos de electrónica",
    "Genera un reporte de compras sugeridas",
  ];

  // Fix #6 (aria-live): anuncia solo cuando termina el streaming, no en cada chunk
  const [announcement, setAnnouncement] = useState("");
  const prevStreamingRef = useRef(false);

  useEffect(() => {
    if (prevStreamingRef.current && !isStreaming) {
      const last = messages[messages.length - 1];
      if (last?.role === "assistant" && last.content && !last.isError) {
        setAnnouncement("Respuesta recibida");
      }
    }
    prevStreamingRef.current = isStreaming;
  }, [isStreaming, messages]);

  return (
    <main
      className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-950 transition-colors duration-300"
      aria-label="Mensajes del chat"
    >
      {/* Región aria-live fuera del flujo visual — anuncia solo al completar */}
      <span
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {announcement}
      </span>

      {/* Estado vacío */}
      {!activeConversationId && messages.length === 0 && !messagesLoading && (
        <div className="flex flex-col items-center justify-center h-full px-6">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4">
            <img src="/favicon.svg" alt="logo" className="w-14 h-14" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            ¿En qué puedo ayudarte?
          </h2>
          <p className="text-sm text-gray-400 text-center max-w-sm">
            Pregúntame sobre tu inventario, stock por bodega, productos, proveedores o genera reportes.
          </p>

          <div className="flex flex-wrap gap-2 mt-6 justify-center max-w-md">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => onSuggestionClick(suggestion)}
                className="px-3 py-1.5 rounded-lg text-xs border border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-900 hover:border-blue-300 dark:hover:border-blue-700 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Error al cargar mensajes */}
      {loadError && (
        <div className="flex items-center justify-center h-full">
          <p className="text-sm text-red-500 dark:text-red-400">{loadError}</p>
        </div>
      )}

      {/* Mensajes loading */}
      {messagesLoading && (
        <div className="flex items-center justify-center h-full">
          <div className="w-6 h-6 border-2 border-blue-300 dark:border-blue-600 border-t-blue-600 dark:border-t-blue-300 rounded-full animate-spin" />
        </div>
      )}

      {/* Lista de mensajes */}
      {!messagesLoading && !loadError && messages.length > 0 && (
        <div
          className="max-w-3xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-4"
        >
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0 mr-2 mt-0.5">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600 dark:text-blue-400" aria-hidden="true">
                    <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
                  </svg>
                </div>
              )}
              <div
                className={`px-4 py-2.5 text-sm max-w-[80%] leading-relaxed ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white rounded-2xl rounded-br-sm"
                    : msg.isError
                      ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl rounded-bl-sm border border-red-100 dark:border-red-800"
                      : "bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 rounded-2xl rounded-bl-sm border border-gray-100 dark:border-gray-800"
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isStreaming && messages[messages.length - 1]?.content === "" && (
            <div className="flex justify-start">
              <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0 mr-2">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600 dark:text-blue-400" aria-hidden="true">
                  <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
                </svg>
              </div>
              <div role="status" aria-label="El asistente está escribiendo" className="bg-white dark:bg-gray-900 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1 items-center border border-gray-100 dark:border-gray-800">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      )}
    </main>
  );
}
