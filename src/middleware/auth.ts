import { Elysia } from "elysia";
import { config } from "../config";

/**
 * Authentication middleware
 * Validates API key for protected routes
 */
export const authMiddleware = new Elysia({ name: "auth" })
  .derive(({ request, set }) => {
    const path = new URL(request.url).pathname;

    // Skip auth for GET requests to /uploads (serving files)
    if (request.method === "GET" && path.startsWith("/uploads")) {
      return { isAuthenticated: true };
    }

    // Skip auth for health check
    if (path === "/health") {
      return { isAuthenticated: true };
    }

    // Check API key
    const apiKey = request.headers.get("x-api-key");

    if (!apiKey || apiKey !== config.apiKey) {
      set.status = 401;
      return { isAuthenticated: false };
    }

    return { isAuthenticated: true };
  })
  .onBeforeHandle(({ isAuthenticated, set }) => {
    if (!isAuthenticated) {
      set.status = 401;
      return {
        success: false,
        error: "Unauthorized - Invalid API Key",
      };
    }
  });
