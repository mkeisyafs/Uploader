import type { AppConfig, FileCategory, FileCategoryConfig } from "../types";
import { join } from "path";

// MB to Bytes converter
const MB = (mb: number) => mb * 1024 * 1024;

// Get environment variable with default
const env = (key: string, defaultValue: string): string => {
  return process.env[key] || defaultValue;
};

const envNumber = (key: string, defaultValue: number): number => {
  const value = process.env[key];
  return value ? parseInt(value, 10) : defaultValue;
};

// File category configurations
export const categoryConfigs: Record<FileCategory, FileCategoryConfig> = {
  images: {
    allowedMimeTypes: [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/svg+xml",
      "image/bmp",
      "image/tiff",
    ],
    allowedExtensions: [
      ".jpg",
      ".jpeg",
      ".png",
      ".gif",
      ".webp",
      ".svg",
      ".bmp",
      ".tiff",
    ],
    maxSizeBytes: MB(envNumber("MAX_IMAGE_SIZE", 10)),
  },
  documents: {
    allowedMimeTypes: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "text/plain",
      "text/csv",
      "application/json",
    ],
    allowedExtensions: [
      ".pdf",
      ".doc",
      ".docx",
      ".xls",
      ".xlsx",
      ".ppt",
      ".pptx",
      ".txt",
      ".csv",
      ".json",
    ],
    maxSizeBytes: MB(envNumber("MAX_DOCUMENT_SIZE", 50)),
  },
  videos: {
    allowedMimeTypes: [
      "video/mp4",
      "video/webm",
      "video/quicktime",
      "video/x-msvideo",
      "video/x-matroska",
      "video/mpeg",
    ],
    allowedExtensions: [".mp4", ".webm", ".mov", ".avi", ".mkv", ".mpeg"],
    maxSizeBytes: MB(envNumber("MAX_VIDEO_SIZE", 100)),
  },
  audio: {
    allowedMimeTypes: [
      "audio/mpeg",
      "audio/wav",
      "audio/ogg",
      "audio/mp4",
      "audio/flac",
      "audio/aac",
      "audio/webm",
    ],
    allowedExtensions: [
      ".mp3",
      ".wav",
      ".ogg",
      ".m4a",
      ".flac",
      ".aac",
      ".weba",
    ],
    maxSizeBytes: MB(envNumber("MAX_AUDIO_SIZE", 50)),
  },
  others: {
    allowedMimeTypes: ["*/*"], // Accept any MIME type
    allowedExtensions: ["*"], // Accept any extension
    maxSizeBytes: MB(envNumber("MAX_OTHER_SIZE", 25)),
  },
};

// Application configuration
export const config: AppConfig = {
  port: envNumber("PORT", 3002),
  baseUrl: env("BASE_URL", "http://localhost:3002"),
  apiKey: env("API_KEY", "onpost_storage_api_key_2024"),
  uploadsDir: join(process.cwd(), "uploads"),
  categories: categoryConfigs,
};

// All valid categories
export const validCategories: FileCategory[] = [
  "images",
  "documents",
  "videos",
  "audio",
  "others",
];

// Export config as default
export default config;
