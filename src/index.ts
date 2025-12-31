import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { staticPlugin } from "@elysiajs/static";
import { config } from "./config";
import { routes } from "./routes";
import { authMiddleware } from "./middleware/auth";
import { ensureUploadDirs } from "./services/file.service";

// Initialize upload directories
await ensureUploadDirs();

// Create Elysia app
const app = new Elysia()
  // CORS configuration
  .use(
    cors({
      origin: "*",
      methods: ["GET", "POST", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "x-api-key"],
    })
  )
  // Static file serving for uploads
  .use(
    staticPlugin({
      assets: "uploads",
      prefix: "/uploads",
    })
  )
  // Authentication middleware
  .use(authMiddleware)
  // Routes
  .use(routes)
  // Root endpoint
  .get("/", () => ({
    name: "Onpost Storage",
    version: "1.0.0",
    description: "File storage server for Onpost",
    endpoints: {
      health: "GET /health",
      upload: "POST /upload",
      uploadToCategory: "POST /upload/:category",
      listFiles: "GET /files",
      listByCategory: "GET /files/:category",
      fileInfo: "GET /files/:category/:filename/info",
      deleteFile: "DELETE /files/:category/:filename",
      serveFile: "GET /uploads/:category/:filename",
    },
    categories: ["images", "documents", "videos", "audio", "others"],
  }))
  // Error handler
  .onError(({ code, error, set }) => {
    const errorMessage =
      error && typeof error === "object" && "message" in error
        ? (error as Error).message
        : String(error);

    console.error(`[Error] ${code}:`, errorMessage);

    if (code === "NOT_FOUND") {
      set.status = 404;
      return {
        success: false,
        error: "Not found",
      };
    }

    if (code === "VALIDATION") {
      set.status = 400;
      return {
        success: false,
        error: errorMessage,
      };
    }

    set.status = 500;
    return {
      success: false,
      error: "Internal server error",
    };
  })
  // Start server
  .listen(config.port);

console.log(`
╔══════════════════════════════════════════════════════╗
║         🚀 Onpost Storage Server Started             ║
╠══════════════════════════════════════════════════════╣
║  Port     : ${config.port}                                     ║
║  Base URL : ${config.baseUrl.padEnd(36)}   ║
║  Uploads  : ${config.uploadsDir.slice(-36).padEnd(36)}   ║
╠══════════════════════════════════════════════════════╣
║  Categories:                                         ║
║  • images     - jpg, png, gif, webp, svg (10MB)      ║
║  • documents  - pdf, doc, xls, ppt, txt (50MB)       ║
║  • videos     - mp4, webm, mov, avi (100MB)          ║
║  • audio      - mp3, wav, ogg, flac (50MB)           ║
║  • others     - any file type (25MB)                 ║
╚══════════════════════════════════════════════════════╝
`);

export type App = typeof app;
