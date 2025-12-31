import { Elysia } from "elysia";
import { healthRoutes } from "./health";
import { uploadRoutes } from "./upload";
import { filesRoutes } from "./files";

export const routes = new Elysia()
  .use(healthRoutes)
  .use(uploadRoutes)
  .use(filesRoutes);

export { healthRoutes, uploadRoutes, filesRoutes };
