import express, { RequestHandler } from 'express';
import { ProblemsController } from '../controllers/ProblemsController';
import { SubmissionsController } from '../controllers/SubmissionsController';
import { Multer } from 'multer';

export function createProblemsRoutes(
  authMiddleware: RequestHandler,
  problemsController: ProblemsController,
  submissionsController: SubmissionsController,
  upload: Multer,
  submissionRateLimiter: RequestHandler,
) {
  const router = express.Router();

  router.get('/', 
    problemsController.listProblems.bind(problemsController)
  );
  router.get('/:problemId', 
    problemsController.getProblem.bind(problemsController)
  );
  router.get('/:problemId/setups/:setupId/tests', 
    problemsController.getTestsForDisplay.bind(problemsController)
  );
  router.get('/:problemId/tests', 
    problemsController.getTestsForDisplay.bind(problemsController)
  );

  router.post('/:problemId/setups/:setupId/submissions',
    authMiddleware,
    submissionRateLimiter,
    upload.single("file"),
    submissionsController.makeSubmission.bind(submissionsController)
  );
  router.get('/:problemId/submissions',
    authMiddleware,
    submissionsController.getAllSubmissionsForProblem.bind(submissionsController)
  );
  router.get('/:problemId/submissions/latest',
    authMiddleware,
    submissionsController.getLatestSubmissionForProblem.bind(submissionsController)
  );
  router.get('/:problemId/setups/:setupId/leaderboard',
    submissionsController.getLeaderboard.bind(submissionsController)
  );
  
  
  router.post('/',
    authMiddleware,
    problemsController.createProblem.bind(problemsController)
  );
  router.patch('/:problemId',
    authMiddleware,
    problemsController.updateProblem.bind(problemsController)
  );
  router.delete('/:problemId',
    authMiddleware,
    problemsController.deleteProblem.bind(problemsController)
  );
  router.post('/:problemId/setups', 
    authMiddleware, 
    problemsController.addProblemSetup.bind(problemsController)
  );
  router.post('/:problemId/setups/:setupId/tests', 
    authMiddleware, 
    upload.single("file"),
    problemsController.submitTestsFile.bind(problemsController)
  );
  router.post('/:problemId/tests', 
    authMiddleware, 
    upload.single("file"),
    problemsController.submitTestsFile.bind(problemsController)
  );

  router.post('/:problemId/setups/:setupId/runner', 
    authMiddleware, 
    upload.single("file"),
    problemsController.submitRunnerFile.bind(problemsController)
  );

  router.get('/:problemId/setups/:setupId/template', 
    problemsController.getTemplateFile.bind(problemsController)
  );
  router.post('/:problemId/setups/:setupId/template', 
    authMiddleware, 
    upload.single("file"),
    problemsController.submitTemplateFile.bind(problemsController)
  );

  return router;
}