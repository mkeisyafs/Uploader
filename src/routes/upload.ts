import { Elysia, t } from "elysia";
import { saveFile, detectCategory } from "../services/file.service";
import { validCategories } from "../config";
import type { FileCategory, UploadResponse, ErrorResponse } from "../types";

export const uploadRoutes = new Elysia({ prefix: "/upload" })
  // Generic upload - auto-detect category
  .post(
    "/",
    async ({ body, set }): Promise<UploadResponse | ErrorResponse> => {
      try {
        const { file } = body;

        if (!file) {
          set.status = 400;
          return {
            success: false,
            error: "No file provided",
          };
        }

        const result = await saveFile(file);

        console.log(
          `[Upload] ${result.category}/${result.filename} (${result.originalName})`
        );

        return {
          success: true,
          url: result.url,
          filename: result.filename,
          originalName: result.originalName,
          category: result.category,
          size: result.size,
          mimeType: result.mimeType,
        };
      } catch (error) {
        console.error("[Upload Error]", error);
        set.status = 400;
        return {
          success: false,
          error:
            error instanceof Error ? error.message : "Failed to upload file",
        };
      }
    },
    {
      body: t.Object({
        file: t.File(),
      }),
    }
  )
  // Upload to specific category
  .post(
    "/:category",
    async ({ params, body, set }): Promise<UploadResponse | ErrorResponse> => {
      try {
        const { category } = params;
        const { file } = body;

        if (!validCategories.includes(category as FileCategory)) {
          set.status = 400;
          return {
            success: false,
            error: `Invalid category. Valid categories: ${validCategories.join(
              ", "
            )}`,
          };
        }

        if (!file) {
          set.status = 400;
          return {
            success: false,
            error: "No file provided",
          };
        }

        const result = await saveFile(file, category as FileCategory);

        console.log(
          `[Upload] ${result.category}/${result.filename} (${result.originalName})`
        );

        return {
          success: true,
          url: result.url,
          filename: result.filename,
          originalName: result.originalName,
          category: result.category,
          size: result.size,
          mimeType: result.mimeType,
        };
      } catch (error) {
        console.error("[Upload Error]", error);
        set.status = 400;
        return {
          success: false,
          error:
            error instanceof Error ? error.message : "Failed to upload file",
        };
      }
    },
    {
      params: t.Object({
        category: t.String(),
      }),
      body: t.Object({
        file: t.File(),
      }),
    }
  );
