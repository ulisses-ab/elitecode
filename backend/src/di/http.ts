import multer from "multer";

import {
  oAuthCallbackUseCase,
  fetchExecutionFilesUseCase,
  submitExecutionResultsUseCase,
  addProblemSetupUseCase,
  createProblemUseCase,
  deleteProblemUseCase,
  updateProblemUseCase,
  getProblemUseCase,
  getTestsForDisplayUseCase,
  listProblemsUseCase,
  submitTestsFileUseCase,
  makeSubmissionUseCase,
  getSubmissionUseCase,
  getSubmissionWithResultsUseCase,
  getSubmissionCodeUseCase,
  getUserUseCase,
  getUserProfileUseCase,
  updateUsernameUseCase,
  getAllSubmissionsForProblemUseCase,
  getLatestSubmissionForProblemUseCase,
  getLeaderboardUseCase,
  submitRunnerFileUseCase,
  submitTemplateFileUseCase,
  getTemplateFileUseCase,
} from "./application";

import { jwtService } from "./infra"
import { redis } from "./clients/redis"

import { AuthController } from "../http/controllers/AuthController"
import { ProblemsController } from "../http/controllers/ProblemsController"
import { SubmissionsController } from "../http/controllers/SubmissionsController"
import { UsersController } from "../http/controllers/UsersController"
import { createAuthMiddleware } from "../http/middleware/authMiddleware";
import { createSubmissionRateLimiter } from "../http/middleware/submissionRateLimitMiddleware";

import { createSubmissionsRoutes } from "../http/routes/submissionsRoutes"
import { createAuthRoutes } from "../http/routes/authRoutes"
import { createProblemsRoutes } from "../http/routes/problemsRoutes"
import { createUsersRoutes } from "../http/routes/usersRoutes"
import { createFeedbackRoutes } from "../http/routes/feedbackRoutes"

import { oAuthService } from "./infra";

import dotenv from "dotenv";
dotenv.config();

export const authController = new AuthController(
  oAuthCallbackUseCase,
  oAuthService,
  process.env.FRONTEND_OAUTH_REDIRECT_URL!
);

export const problemsController = new ProblemsController(
  createProblemUseCase,
  deleteProblemUseCase,
  updateProblemUseCase,
  getProblemUseCase,
  listProblemsUseCase, 
  addProblemSetupUseCase,
  getTestsForDisplayUseCase,
  submitTestsFileUseCase,
  submitRunnerFileUseCase,
  submitTemplateFileUseCase,
  getTemplateFileUseCase
);

export const submissionsController = new SubmissionsController(
  makeSubmissionUseCase,
  getSubmissionUseCase,
  fetchExecutionFilesUseCase,
  submitExecutionResultsUseCase,
  getSubmissionWithResultsUseCase,
  getAllSubmissionsForProblemUseCase,
  getLatestSubmissionForProblemUseCase,
  getLeaderboardUseCase,
  getSubmissionCodeUseCase,
);

export const usersController = new UsersController(
  getUserUseCase,
  getUserProfileUseCase,
  updateUsernameUseCase
);

export const authMiddleware = createAuthMiddleware(jwtService);
export const submissionRateLimiter = createSubmissionRateLimiter(redis);

export const upload = multer();

export const problemsRoutes = createProblemsRoutes(
  authMiddleware,
  problemsController,
  submissionsController,
  upload,
  submissionRateLimiter,
);

export const submissionsRoutes = createSubmissionsRoutes(
  authMiddleware,
  submissionsController,
  upload
);

export const usersRoutes = createUsersRoutes(
  authMiddleware,
  usersController
);

export const authRoutes = createAuthRoutes(
  authController
);

export const feedbackRoutes = createFeedbackRoutes();
