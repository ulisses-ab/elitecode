import express, { RequestHandler } from "express";
import { ResourcesController } from "../controllers/ResourcesController";

export function createResourcesRoutes(
  authMiddleware: RequestHandler,
  resourcesController: ResourcesController,
) {
  const router = express.Router();

  // Standalone resource management (admin)
  router.get("/", resourcesController.listAll.bind(resourcesController));
  router.post("/", authMiddleware, resourcesController.createResource.bind(resourcesController));
  router.patch("/:resourceId", authMiddleware, resourcesController.updateResource.bind(resourcesController));
  router.delete("/:resourceId", authMiddleware, resourcesController.deleteResource.bind(resourcesController));

  // Problem ↔ resource linking (admin)
  router.get("/problems/:problemId", resourcesController.listForProblem.bind(resourcesController));
  router.post("/problems/:problemId/:resourceId", authMiddleware, resourcesController.linkResource.bind(resourcesController));
  router.delete("/problems/:problemId/:resourceId", authMiddleware, resourcesController.unlinkResource.bind(resourcesController));

  return router;
}
