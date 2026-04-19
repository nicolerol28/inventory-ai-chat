import aiClient from "./aiClient";

export async function getConversations() {
  const response = await aiClient.get("/conversations");
  return response.data;
}

export async function createConversation(title) {
  const response = await aiClient.post("/conversations", { title });
  return response.data;
}

export async function getConversationMessages(conversationId) {
  const response = await aiClient.get(`/conversations/${conversationId}/messages`);
  return response.data;
}

export async function updateConversationTitle(conversationId, title) {
  const response = await aiClient.patch(`/conversations/${conversationId}`, { title });
  return response.data;
}

export async function deleteConversation(conversationId) {
  const response = await aiClient.delete(`/conversations/${conversationId}`);
  return response.data;
}
