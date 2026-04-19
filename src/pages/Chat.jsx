import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useDarkMode } from "../hooks/useDarkMode";
import { useConversations } from "../hooks/useConversations";
import { useChat } from "../hooks/useChat";
import { ReAuthModal } from "../components/ReAuthModal";
import { Sidebar } from "../components/chat/Sidebar";
import { MessageList } from "../components/chat/MessageList";
import { ChatInput } from "../components/chat/ChatInput";
import { SunIcon, MoonIcon } from "../components/chat/icons";

export function Chat() {
  const { user, token, logout } = useAuth();
  const { isDark, toggle } = useDarkMode();
  const navigate = useNavigate();

  const {
    conversations,
    loading: convsLoading,
    create,
    remove,
    loadMessages,
    refresh,
  } = useConversations();

  const {
    messages,
    isStreaming,
    rateLimited,
    sendMessage,
    setInitialMessages,
    clearMessages,
    cancelStream,
  } = useChat(token);

  const [activeConversationId, setActiveConversationId] = useState(null);
  const [threadId, setThreadId] = useState(null);
  const [input, setInput] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [sendError, setSendError] = useState(null);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const isSendingRef = useRef(false);

  useEffect(() => {
    return () => cancelStream();
  }, [cancelStream]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: isStreaming ? "instant" : "smooth",
    });
  }, [messages, isStreaming]);

  useEffect(() => {
    if (inputRef.current && !isStreaming) {
      inputRef.current.focus();
    }
  }, [activeConversationId, isStreaming]);

  const selectConversation = useCallback(
    async (conv) => {
      if (conv.id === activeConversationId) return;
      if (isStreaming) cancelStream();

      setActiveConversationId(conv.id);
      setThreadId(null);
      setSidebarOpen(false);
      setMessagesLoading(true);
      setLoadError(null);

      try {
        const msgs = await loadMessages(conv.id);
        setInitialMessages(msgs);
      } catch {
        clearMessages();
        setLoadError("No se pudieron cargar los mensajes. Intenta de nuevo.");
      } finally {
        setMessagesLoading(false);
      }
    },
    [activeConversationId, isStreaming, cancelStream, loadMessages, setInitialMessages, clearMessages]
  );

  function handleNewConversation() {
    if (isStreaming) return;
    setActiveConversationId(null);
    setThreadId(null);
    clearMessages();
    setLoadError(null);
    setSidebarOpen(false);
  }

  async function handleDelete(e, id) {
    e.stopPropagation();
    setDeletingId(id);
    setDeleteError(null);
    try {
      await remove(id);
      if (activeConversationId === id) {
        setActiveConversationId(null);
        setThreadId(null);
        clearMessages();
        setLoadError(null);
      }
    } catch {
      setDeleteError("No se pudo eliminar la conversación. Intenta de nuevo.");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleSend() {
    const text = input.trim();
    if (!text || isStreaming || isSendingRef.current) return;

    isSendingRef.current = true;
    setSendError(null);

    let convId = activeConversationId;
    const isNewConversation = !convId;

    try {
      if (!convId) {
        const title = text.length > 40 ? text.slice(0, 40) + "..." : text;
        const newConv = await create(title);
        convId = newConv.id;
        setActiveConversationId(convId);
      }

      setInput("");
      const result = await sendMessage(text, convId, threadId);
      if (result?.threadId) {
        setThreadId(result.threadId);
      }

      if (isNewConversation) {
        refresh();
      }
    } catch {
      setSendError("No se pudo enviar el mensaje. Intenta de nuevo.");
    } finally {
      isSendingRef.current = false;
    }
  }

  function handleLogout() {
    logout();
    navigate("/login");
  }

  const activeConversation = conversations.find((c) => c.id === activeConversationId);

  const initials = user?.name
    ? user.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : user?.sub?.split("@")[0].slice(0, 2).toUpperCase() ?? "U";

  const username = user?.name ?? user?.sub?.split("@")[0] ?? "Usuario";

  return (
    <div className="flex h-dvh bg-white dark:bg-gray-950 text-gray-800 dark:text-gray-200 transition-colors duration-300 overflow-hidden">

      {/* Overlay (mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <Sidebar
        conversations={conversations}
        convsLoading={convsLoading}
        activeConversationId={activeConversationId}
        isStreaming={isStreaming}
        deletingId={deletingId}
        deleteError={deleteError}
        sidebarOpen={sidebarOpen}
        user={user}
        initials={initials}
        username={username}
        onSelectConversation={selectConversation}
        onNewConversation={handleNewConversation}
        onDelete={handleDelete}
        onLogout={handleLogout}
      />

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Header */}
        <header className="h-14 flex-shrink-0 flex items-center justify-between px-4 sm:px-6 bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800 transition-colors duration-300">
          <button
            className="lg:hidden mr-3 p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-gray-800 transition-colors"
            onClick={() => setSidebarOpen(true)}
            aria-label="Abrir menú"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
              {activeConversation?.title || "Inventory AI Chat"}
            </h1>
            {activeConversation?.messageCount > 0 && (
              <p className="text-[11px] text-gray-400 dark:text-gray-600">
                {activeConversation.messageCount} mensajes
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={toggle}
            className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
            aria-label="Cambiar tema"
          >
            {isDark ? <SunIcon /> : <MoonIcon />}
          </button>
        </header>

        <MessageList
          messages={messages}
          isStreaming={isStreaming}
          messagesLoading={messagesLoading}
          activeConversationId={activeConversationId}
          loadError={loadError}
          messagesEndRef={messagesEndRef}
          onSuggestionClick={(suggestion) => {
            setInput(suggestion);
            inputRef.current?.focus();
          }}
        />

        {sendError && (
          <p className="text-xs text-red-500 dark:text-red-400 text-center px-4 pb-1">
            {sendError}
          </p>
        )}
        <ChatInput
          input={input}
          setInput={setInput}
          isStreaming={isStreaming}
          rateLimited={rateLimited}
          inputRef={inputRef}
          onSend={handleSend}
          onCancel={cancelStream}
        />
      </div>

      <ReAuthModal />
    </div>
  );
}
