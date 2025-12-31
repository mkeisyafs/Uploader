import { Elysia, t } from "elysia";
import { listFiles, deleteFile, getFileInfo } from "../services/file.service";
import { validCategories } from "../config";
import type { FileCategory, ListFilesResponse, ErrorResponse } from "../types";

export const filesRoutes = new Elysia({ prefix: "/files" })
  // List all files
  .get("/", async (): Promise<ListFilesResponse> => {
    const files = await listFiles();
    return {
      files,
      count: files.length,
    };
  })
  // List files by category
  .get(
    "/:category",
    async ({ params, set }): Promise<ListFilesResponse | ErrorResponse> => {
      const { category } = params;

      if (!validCategories.includes(category as FileCategory)) {
        set.status = 400;
        return {
          success: false,
          error: `Invalid category. Valid categories: ${validCategories.join(
            ", "
          )}`,
        };
      }

      const files = await listFiles(category as FileCategory);
      return {
        files,
        count: files.length,
        category: category as FileCategory,
      };
    },
    {
      params: t.Object({
        category: t.String(),
      }),
    }
  )
  // Get file info
  .get(
    "/:category/:filename/info",
    async ({ params, set }) => {
      const { category, filename } = params;

      if (!validCategories.includes(category as FileCategory)) {
        set.status = 400;
        return {
          success: false,
          error: `Invalid category. Valid categories: ${validCategories.join(
            ", "
          )}`,
        };
      }

      const fileInfo = await getFileInfo(category as FileCategory, filename);

      if (!fileInfo) {
        set.status = 404;
        return {
          success: false,
          error: "File not found",
        };
      }

      return {
        success: true,
        file: fileInfo,
      };
    },
    {
      params: t.Object({
        category: t.String(),
        filename: t.String(),
      }),
    }
  )
  // Delete file
  .delete(
    "/:category/:filename",
    async ({ params, set }) => {
      const { category, filename } = params;

      if (!validCategories.includes(category as FileCategory)) {
        set.status = 400;
        return {
          success: false,
          error: `Invalid category. Valid categories: ${validCategories.join(
            ", "
          )}`,
        };
      }

      try {
        await deleteFile(category as FileCategory, filename);
        console.log(`[Delete] ${category}/${filename}`);

        return {
          success: true,
          message: "File deleted successfully",
        };
      } catch (error) {
        console.error("[Delete Error]", error);
        set.status =
          error instanceof Error && error.message === "File not found"
            ? 404
            : 400;
        return {
          success: false,
          error:
            error instanceof Error ? error.message : "Failed to delete file",
        };
      }
    },
    {
      params: t.Object({
        category: t.String(),
        filename: t.String(),
      }),
    }
  );
