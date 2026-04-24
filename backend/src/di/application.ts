import { OAuthCallbackUseCase } from "../application/usecases/auth/OAuthCallbackUseCase";
import { FetchExecutionFilesUseCase } from "../application/usecases/execution/FetchExecutionFilesUseCase";
import { SubmitExecutionResultsUseCase } from "../application/usecases/execution/SubmitExecutionResultsUseCase";

import { AddProblemSetupUseCase } from "../application/usecases/problems/AddProblemSetupUseCase";
import { CreateProblemUseCase } from "../application/usecases/problems/CreateProblemUseCase";
import { GetProblemUseCase } from "../application/usecases/problems/GetProblemUseCase";
import { GetTestsForDisplayUseCase } from "../application/usecases/problems/GetTestsForDisplayUseCase";
import { ListProblemsUseCase } from "../application/usecases/problems/ListProblemsUseCase";
import { SubmitTestsFileUseCase } from "../application/usecases/problems/SubmitTestsFileUseCase";
import { SubmitRunnerFileUseCase } from "../application/usecases/problems/SubmitRunnerFileUseCase";

import { GetAllSubmissionsForProblemUseCase } from "../application/usecases/submissions/GetAllSubmissionsForProblemUseCase";
import { GetLatestSubmissionForProblemUseCase } from "../application/usecases/submissions/GetLatestSubmissionForProblemUseCase";
import { GetSubmissionUseCase } from "../application/usecases/submissions/GetSubmissionUseCase";
import { GetSubmissionWithResultsUseCase } from "../application/usecases/submissions/GetSubmissionWithResultsUseCase";
import { MakeSubmissionUseCase } from "../application/usecases/submissions/MakeSubmissionUseCase";

import { GetUserUseCase } from "../application/usecases/users/GetUserUseCase";
import { GetUserProfileUseCase } from "../application/usecases/users/GetUserProfileUseCase";

import { SubmissionTimeoutService } from "../application/services/SubmissionTimeoutService";
import { TemporarySubmissionCleanupService } from "../application/services/TemporarySubmissionCleanupService";

import { 
  jwtService, 
  uuidService, 
  s3ObjectStorageService, 
  bullMqExecutionQueueService, 
  bcryptHashingService,
  prismaUserRepo,
  prismaProblemRepo,
  prismaSubmissionRepo,
  prismaOAuthIdentityRepo,
  oAuthService,
} from "./infra";
import { SubmitTemplateFileUseCase } from "../application/usecases/problems/SubmitTemplateFileUseCase";
import { GetTemplateFileUseCase } from "../application/usecases/problems/GetTemplateFileUseCase";

export const oAuthCallbackUseCase = new OAuthCallbackUseCase(
  prismaUserRepo,
  jwtService,
  oAuthService,
  uuidService,
  prismaOAuthIdentityRepo
)

export const fetchExecutionFilesUseCase = new FetchExecutionFilesUseCase(
  prismaUserRepo,
  prismaSubmissionRepo,
  prismaProblemRepo,
);

export const submitExecutionResultsUseCase = new SubmitExecutionResultsUseCase(
  prismaSubmissionRepo,
  prismaUserRepo,
  s3ObjectStorageService
);

export const addProblemSetupUseCase = new AddProblemSetupUseCase(
  prismaProblemRepo,
  prismaUserRepo,
  uuidService
);

export const createProblemUseCase = new CreateProblemUseCase(
  prismaProblemRepo,
  prismaUserRepo,
  uuidService
);

export const getProblemUseCase = new GetProblemUseCase(
  prismaProblemRepo
);

export const getTestsForDisplayUseCase = new GetTestsForDisplayUseCase(
  prismaProblemRepo,
  s3ObjectStorageService
);

export const listProblemsUseCase = new ListProblemsUseCase(
  prismaProblemRepo
);

export const submitTestsFileUseCase = new SubmitTestsFileUseCase(
  prismaProblemRepo,
  prismaUserRepo,
  s3ObjectStorageService
);

export const submitRunnerFileUseCase = new SubmitRunnerFileUseCase(
  prismaProblemRepo,
  prismaUserRepo,
  s3ObjectStorageService
);

export const submitTemplateFileUseCase = new SubmitTemplateFileUseCase(
  prismaProblemRepo,
  prismaUserRepo,
  s3ObjectStorageService
);

export const makeSubmissionUseCase = new MakeSubmissionUseCase(
  prismaUserRepo,
  prismaProblemRepo,
  s3ObjectStorageService,
  uuidService,
  prismaSubmissionRepo,
  bullMqExecutionQueueService
);

export const getSubmissionUseCase = new GetSubmissionUseCase(
  prismaSubmissionRepo
);

export const getSubmissionWithResultsUseCase = new GetSubmissionWithResultsUseCase(
  prismaSubmissionRepo,
  s3ObjectStorageService
);

export const getAllSubmissionsForProblemUseCase = new GetAllSubmissionsForProblemUseCase(
  prismaSubmissionRepo
);

export const getLatestSubmissionForProblemUseCase = new GetLatestSubmissionForProblemUseCase(
  prismaSubmissionRepo
);

export const getUserUseCase = new GetUserUseCase(
  prismaUserRepo
);

export const getUserProfileUseCase = new GetUserProfileUseCase(
  prismaUserRepo,
  prismaSubmissionRepo
);

export const submissionTimeoutService = new SubmissionTimeoutService(
  prismaSubmissionRepo,
);

export const temporarySubmissionCleanupService = new TemporarySubmissionCleanupService(
  prismaSubmissionRepo,
  s3ObjectStorageService
);

export const getTemplateFileUseCase = new GetTemplateFileUseCase(
  prismaProblemRepo,
  s3ObjectStorageService
)