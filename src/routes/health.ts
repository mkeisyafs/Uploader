import { Elysia } from "elysia";
import type { HealthResponse } from "../types";

const startTime = Date.now();

export const healthRoutes = new Elysia({ prefix: "/health" }).get(
  "/",
  (): HealthResponse => {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - startTime) / 1000),
      version: "1.0.0",
    };
  }
);
