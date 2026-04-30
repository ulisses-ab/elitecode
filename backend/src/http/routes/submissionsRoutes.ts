import express, { RequestHandler } from 'express';
import { SubmissionsController } from '../controllers/SubmissionsController';
import { logMiddleware } from '../middleware/logMiddleware';
import { Multer } from 'multer';

export function createSubmissionsRoutes(
  authMiddleware: RequestHandler, 
  submissionsController: SubmissionsController,
  upload: Multer,
) {
  const router = express.Router();

  router.get("/:submissionId/execution-files",
    authMiddleware,
    submissionsController.fetchExecutionFiles.bind(submissionsController)
  );

  router.post("/:submissionId/results",
    authMiddleware,
    upload.single("file"),
    submissionsController.submitExecutionResults.bind(submissionsController)
  );

  router.get("/:submissionId/results",
    authMiddleware,
    submissionsController.getSubmissionWithResults.bind(submissionsController)
  );

  router.get("/:submissionId/code",
    authMiddleware,
    submissionsController.getSubmissionCode.bind(submissionsController)
  );

  router.get("/:submissionId",
    authMiddleware,
    submissionsController.getSubmission.bind(submissionsController)
  );

  return router;
}