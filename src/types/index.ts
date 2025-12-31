// File Categories
export type FileCategory =
  | "images"
  | "documents"
  | "videos"
  | "audio"
  | "others";

// Upload Response
export interface UploadResponse {
  success: boolean;
  url: string;
  filename: string;
  originalName: string;
  category: FileCategory;
  size: number;
  mimeType: string;
}

// File Info
export interface FileInfo {
  filename: string;
  originalName?: string;
  url: string;
  category: FileCategory;
  size: number;
  mimeType?: string;
  createdAt: Date;
}

// List Files Response
export interface ListFilesResponse {
  files: FileInfo[];
  count: number;
  category?: FileCategory;
}

// Error Response
export interface ErrorResponse {
  success: false;
  error: string;
  code?: string;
}

// Health Response
export interface HealthResponse {
  status: "ok" | "error";
  timestamp: string;
  uptime: number;
  version: string;
}

// Config Types
export interface FileCategoryConfig {
  allowedMimeTypes: string[];
  allowedExtensions: string[];
  maxSizeBytes: number;
}

export interface AppConfig {
  port: number;
  baseUrl: string;
  apiKey: string;
  uploadsDir: string;
  categories: Record<FileCategory, FileCategoryConfig>;
}
