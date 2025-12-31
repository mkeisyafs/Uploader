import { mkdir, readdir, stat, unlink, writeFile } from "fs/promises";
import { existsSync } from "fs";
import { join, extname } from "path";
import { config, categoryConfigs, validCategories } from "../config";
import type { FileCategory, FileInfo, FileCategoryConfig } from "../types";
import {
  generateFilename,
  isValidFilename,
  getFileExtension,
} from "../utils/helpers";

/**
 * Ensure all upload directories exist
 */
export async function ensureUploadDirs(): Promise<void> {
  const { uploadsDir } = config;

  // Create main uploads directory
  if (!existsSync(uploadsDir)) {
    await mkdir(uploadsDir, { recursive: true });
  }

  // Create category subdirectories
  for (const category of validCategories) {
    const categoryDir = join(uploadsDir, category);
    if (!existsSync(categoryDir)) {
      await mkdir(categoryDir, { recursive: true });
    }
  }

  console.log(`📁 Upload directories initialized at ${uploadsDir}`);
}

/**
 * Detect file category based on MIME type
 */
export function detectCategory(mimeType: string): FileCategory {
  for (const [category, config] of Object.entries(categoryConfigs)) {
    if (category === "others") continue; // Skip others, it's the fallback

    const categoryConfig = config as FileCategoryConfig;
    if (categoryConfig.allowedMimeTypes.includes(mimeType)) {
      return category as FileCategory;
    }
  }

  return "others";
}

/**
 * Validate file against category constraints
 */
export function validateFile(
  file: File,
  category: FileCategory
): { valid: boolean; error?: string } {
  const categoryConfig = categoryConfigs[category];

  // Check file size
  if (file.size > categoryConfig.maxSizeBytes) {
    const maxMB = categoryConfig.maxSizeBytes / (1024 * 1024);
    return {
      valid: false,
      error: `File size exceeds maximum allowed size of ${maxMB}MB for ${category}`,
    };
  }

  // For 'others' category, accept any file type
  if (category === "others") {
    return { valid: true };
  }

  // Check MIME type
  if (!categoryConfig.allowedMimeTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type "${
        file.type
      }" is not allowed for ${category}. Allowed types: ${categoryConfig.allowedMimeTypes.join(
        ", "
      )}`,
    };
  }

  // Check extension
  const ext = getFileExtension(file.name);
  if (
    !categoryConfig.allowedExtensions.includes(ext) &&
    !categoryConfig.allowedExtensions.includes("*")
  ) {
    return {
      valid: false,
      error: `File extension "${ext}" is not allowed for ${category}`,
    };
  }

  return { valid: true };
}

/**
 * Save uploaded file to disk
 */
export async function saveFile(
  file: File,
  category?: FileCategory
): Promise<{
  filename: string;
  originalName: string;
  category: FileCategory;
  size: number;
  mimeType: string;
  url: string;
}> {
  // Auto-detect category if not provided
  const fileCategory = category || detectCategory(file.type);

  // Validate file
  const validation = validateFile(file, fileCategory);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // Generate unique filename
  const filename = generateFilename(file.name);
  const filePath = join(config.uploadsDir, fileCategory, filename);

  // Write file to disk
  const buffer = await file.arrayBuffer();
  await writeFile(filePath, Buffer.from(buffer));

  // Generate URL
  const url = `${config.baseUrl}/uploads/${fileCategory}/${filename}`;

  return {
    filename,
    originalName: file.name,
    category: fileCategory,
    size: file.size,
    mimeType: file.type,
    url,
  };
}

/**
 * Delete a file
 */
export async function deleteFile(
  category: FileCategory,
  filename: string
): Promise<void> {
  if (!isValidFilename(filename)) {
    throw new Error("Invalid filename");
  }

  if (!validCategories.includes(category)) {
    throw new Error("Invalid category");
  }

  const filePath = join(config.uploadsDir, category, filename);

  if (!existsSync(filePath)) {
    throw new Error("File not found");
  }

  await unlink(filePath);
}

/**
 * List files in a category
 */
export async function listFiles(category?: FileCategory): Promise<FileInfo[]> {
  const files: FileInfo[] = [];
  const categoriesToList = category ? [category] : validCategories;

  for (const cat of categoriesToList) {
    const categoryDir = join(config.uploadsDir, cat);

    if (!existsSync(categoryDir)) {
      continue;
    }

    const filenames = await readdir(categoryDir);

    for (const filename of filenames) {
      const filePath = join(categoryDir, filename);
      const fileStat = await stat(filePath);

      if (fileStat.isFile()) {
        files.push({
          filename,
          url: `${config.baseUrl}/uploads/${cat}/${filename}`,
          category: cat,
          size: fileStat.size,
          createdAt: fileStat.birthtime,
        });
      }
    }
  }

  // Sort by creation date (newest first)
  files.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return files;
}

/**
 * Get file info
 */
export async function getFileInfo(
  category: FileCategory,
  filename: string
): Promise<FileInfo | null> {
  if (!isValidFilename(filename)) {
    return null;
  }

  const filePath = join(config.uploadsDir, category, filename);

  if (!existsSync(filePath)) {
    return null;
  }

  const fileStat = await stat(filePath);

  return {
    filename,
    url: `${config.baseUrl}/uploads/${category}/${filename}`,
    category,
    size: fileStat.size,
    createdAt: fileStat.birthtime,
  };
}
