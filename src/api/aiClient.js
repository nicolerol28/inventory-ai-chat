import { createAuthClient } from "./createAuthClient";

export default createAuthClient(import.meta.env.VITE_AI_SERVICE_URL);
