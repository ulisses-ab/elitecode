import express from "express"
import { json } from "body-parser";
import cors from "cors";

import { problemsRoutes, authRoutes, usersRoutes, submissionsRoutes, feedbackRoutes } from "./di/http"
import { submissionTimeoutService, temporarySubmissionCleanupService } from "./di/application"
import { useSwagger } from "./infra/swagger/useSwagger";

import dotenv from "dotenv";
dotenv.config();

const PORT = process.env.PORT ?? 3030;

const TEMPORARY_SUBMISSION_EXPIRATION_MS = 1000 * 60 * 10;
const SUBMISSION_TIMEOUT_MS = 1000 * 60 * 5;
const SERVICE_EXECUTION_INTERVAL_MS = 1000 * 10;

async function bootstrap() {
  const app = express();

  app.use(cors({
    origin: process.env.CORS_ORIGIN ?? "http://localhost:5173",
    credentials: true,
  }));

  app.use(json());

  app.use((req, _res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
  });

  useSwagger(app);

  app.use("/api/problems", problemsRoutes);
  app.use("/api/auth", authRoutes);
  app.use("/api/users", usersRoutes);
  app.use("/api/submissions", submissionsRoutes);
  app.use("/api/feedback", feedbackRoutes);

  setInterval(async () => {
    try {
      await Promise.all([
        temporarySubmissionCleanupService.cleanupTemporarySubmissions(TEMPORARY_SUBMISSION_EXPIRATION_MS),
        submissionTimeoutService.markTimedOutSubmissions(SUBMISSION_TIMEOUT_MS),
      ]);
    } catch (error) {
      console.error("Service error:", error);
    }
  }, SERVICE_EXECUTION_INTERVAL_MS);

  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

bootstrap();
