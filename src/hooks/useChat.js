import { useState, useRef, useCallback, useEffect } from "react";

export function useChat(token) {
  const [messages, setMessages] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [rateLimited, setRateLimited] = useState(false);
  const abortRef = useRef(null);
  const tokenRef = useRef(token);
  const rateLimitTimerRef = useRef(null);

  useEffect(() => {
    tokenRef.current = token;
  }, [token]);

  useEffect(() => {
    return () => clearTimeout(rateLimitTimerRef.current);
  }, []);

  const setInitialMessages = useCallback((msgs) => {
    setMessages(
      msgs.map((m) => ({
        role: m.role,
        content: m.content,
      }))
    );
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const sendMessage = useCallback(
    async (question, conversationId, threadId) => {
      if (!question.trim() || isStreaming) return null;

      setMessages((prev) => [...prev, { role: "user", content: question }]);
      setIsStreaming(true);
      setRateLimited(false);

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const body = { question };
        if (conversationId) body.conversationId = conversationId;
        if (threadId) body.threadId = threadId;

        const response = await fetch(
          `${import.meta.env.VITE_AI_SERVICE_URL}/assistant/chat`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${tokenRef.current}`,
            },
            body: JSON.stringify(body),
            signal: controller.signal,
          }
        );

        if (response.status === 401) {
          window.dispatchEvent(new CustomEvent("auth:unauthorized"));
          setMessages((prev) => prev.slice(0, -1));
          setIsStreaming(false);
          return null;
        }

        if (response.status === 429) {
          const retryAfter = parseInt(response.headers.get("retry-after") || "60", 10);
          clearTimeout(rateLimitTimerRef.current);
          rateLimitTimerRef.current = setTimeout(
            () => setRateLimited(false),
            retryAfter * 1000
          );
          setRateLimited(true);
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              role: "assistant",
              content: "Has alcanzado el límite de solicitudes. Espera un momento antes de enviar otro mensaje.",
              isError: true,
            };
            return updated;
          });
          setIsStreaming(false);
          return null;
        }

        if (!response.ok) {
          throw new Error(`Error ${response.status}`);
        }

        const contentType = response.headers.get("content-type") || "";

        if (contentType.includes("text/event-stream") || contentType.includes("text/plain")) {
          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let accumulated = "";

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n");

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6);
                if (data === "[DONE]") continue;
                try {
                  const parsed = JSON.parse(data);
                  if (parsed.text) {
                    accumulated += parsed.text;
                  } else if (parsed.answer) {
                    accumulated = parsed.answer;
                  }
                } catch {
                  accumulated += data;
                }
              } else if (line.trim() && !line.startsWith(":")) {
                try {
                  const parsed = JSON.parse(line);
                  if (parsed.text) {
                    accumulated += parsed.text;
                  } else if (parsed.answer) {
                    accumulated = parsed.answer;
                  }
                } catch {
                  accumulated += line;
                }
              }
            }

            setMessages((prev) => {
              const updated = [...prev];
              updated[updated.length - 1] = {
                role: "assistant",
                content: accumulated,
              };
              return updated;
            });
          }

          setIsStreaming(false);
          return { answer: accumulated };
        } else {
          const data = await response.json();
          const answer = data.answer || data.reply || "Sin respuesta";

          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              role: "assistant",
              content: answer,
            };
            return updated;
          });

          setIsStreaming(false);
          return data;
        }
      } catch (err) {
        if (err.name === "AbortError") {
          setMessages((prev) => {
            const last = prev[prev.length - 1];
            if (last?.role === "assistant" && !last.content) {
              return prev.slice(0, -1);
            }
            return prev;
          });
          setIsStreaming(false);
          return null;
        }

        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: "assistant",
            content: "Error al conectar con el asistente. Intenta de nuevo.",
            isError: true,
          };
          return updated;
        });
        setIsStreaming(false);
        return null;
      }
    },
    [isStreaming]
  );

  const cancelStream = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    if (rateLimitTimerRef.current) {
      clearTimeout(rateLimitTimerRef.current);
      rateLimitTimerRef.current = null;
      setRateLimited(false);
    }
  }, []);

  return {
    messages,
    isStreaming,
    rateLimited,
    sendMessage,
    setInitialMessages,
    clearMessages,
    cancelStream,
  };
}
