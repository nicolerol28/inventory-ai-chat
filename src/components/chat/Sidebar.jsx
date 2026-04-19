export function Sidebar({
  conversations,
  convsLoading,
  activeConversationId,
  isStreaming,
  deletingId,
  deleteError,
  sidebarOpen,
  user,
  initials,
  username,
  onSelectConversation,
  onNewConversation,
  onDelete,
  onLogout,
}) {
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 w-64 flex-shrink-0 flex flex-col bg-blue-50 dark:bg-gray-900 border-r border-blue-100 dark:border-gray-800 transition-transform duration-300 lg:static lg:translate-x-0 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      {/* Logo */}
      <div className="px-4 py-5 border-b border-blue-100 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center">
            <img src="/favicon.svg" alt="logo" className="w-8 h-8" />
          </div>
          <span className="text-sm font-bold text-gray-900 dark:text-white tracking-tight">
            Inventory AI
          </span>
        </div>
      </div>

      {/* Botón nueva conversación */}
      <div className="px-3 py-3">
        <button
          onClick={onNewConversation}
          disabled={isStreaming}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm border border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Nueva conversación
        </button>
      </div>

      {/* Lista de conversaciones */}
      <nav className="flex-1 px-3 overflow-y-auto" aria-label="Conversaciones">
        <p className="text-[10px] text-blue-500 dark:text-blue-400 tracking-widest px-2 mb-2 uppercase font-semibold">
          Conversaciones
        </p>

        {deleteError && (
          <p className="text-[11px] text-red-500 dark:text-red-400 px-2 pb-2">
            {deleteError}
          </p>
        )}

        {convsLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-5 h-5 border-2 border-blue-300 dark:border-blue-600 border-t-blue-600 dark:border-t-blue-300 rounded-full animate-spin" />
          </div>
        ) : conversations.length === 0 ? (
          <p className="text-xs text-gray-400 px-2 py-4">
            No hay conversaciones aún
          </p>
        ) : (
          <ul>
            {conversations.map((conv) => (
              <li key={conv.id} className="mb-0.5">
                <div
                  className={`group flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors duration-200 ${
                    activeConversationId === conv.id
                      ? "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-medium"
                      : "text-gray-500 dark:text-gray-400 hover:bg-blue-100 dark:hover:bg-gray-800 hover:text-blue-700 dark:hover:text-white"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => onSelectConversation(conv)}
                    className="flex-1 min-w-0 text-left"
                    aria-current={activeConversationId === conv.id ? "page" : undefined}
                  >
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm">
                        {conv.title || "Sin título"}
                      </span>
                      {conv.isSeed && (
                        <span className="text-[9px] bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded font-medium flex-shrink-0">
                          seed
                        </span>
                      )}
                    </div>
                    {conv.lastMessage && (
                      <p className="text-[11px] text-gray-400 dark:text-gray-600 truncate mt-0.5">
                        {conv.lastMessage}
                      </p>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={(e) => onDelete(e, conv.id)}
                    disabled={deletingId === conv.id}
                    className="hidden group-hover:flex focus:flex items-center justify-center w-6 h-6 rounded text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 focus:text-red-500 dark:focus:text-red-400 transition-colors flex-shrink-0 ml-1"
                    aria-label={`Eliminar conversación: ${conv.title || "Sin título"}`}
                  >
                    {deletingId === conv.id ? (
                      <div className="w-3 h-3 border border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                    ) : (
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                      </svg>
                    )}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </nav>

      {/* Usuario */}
      <div className="px-3 py-4 border-t border-blue-100 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-900 dark:text-gray-200 truncate">
              {username}
            </p>
            <p className="text-[10px] text-blue-500 dark:text-blue-400">
              {user?.role ?? ""}
            </p>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="text-[10px] text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
            aria-label="Cerrar sesión"
          >
            Salir
          </button>
        </div>
      </div>
    </aside>
  );
}
