import { useState, useEffect, useCallback } from "react";
import {
  getConversations,
  createConversation,
  getConversationMessages,
  deleteConversation,
} from "../api/conversations";

export function useConversations() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const raw = await getConversations();
      const data = Array.isArray(raw) ? raw : [];
      const sorted = [...data].sort((a, b) => {
        if (a.isSeed !== b.isSeed) return a.isSeed ? -1 : 1;
        return new Date(b.updatedAt) - new Date(a.updatedAt);
      });
      setConversations(sorted);
    } catch {
      setError("Error al cargar conversaciones");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const create = useCallback(async (title) => {
    const newConv = await createConversation(title);
    setConversations((prev) => [newConv, ...prev]);
    return newConv;
  }, []);

  const remove = useCallback(async (id) => {
    await deleteConversation(id);
    setConversations((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const loadMessages = useCallback(async (conversationId) => {
    const data = await getConversationMessages(conversationId);
    return data?.messages ?? [];
  }, []);

  return {
    conversations,
    loading,
    error,
    create,
    remove,
    loadMessages,
    refresh: fetchConversations,
  };
}
