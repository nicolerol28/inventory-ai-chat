import { createAuthClient } from "./createAuthClient";

export default createAuthClient(import.meta.env.VITE_API_URL);
