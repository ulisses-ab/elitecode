import { prisma } from "./clients/prisma"
import { queue } from "./clients/bullmq"
import { s3 } from "./clients/s3"

import { PrismaProblemRepo } from "../infra/prisma/PrismaProblemRepo";
import { PrismaSubmissionRepo } from "../infra/prisma/PrismaSubmissionRepo";
import { PrismaUserRepo } from "../infra/prisma/PrismaUserRepo";
import { PrismaOAuthIdentityRepo } from "../infra/prisma/PrismaOAuthIdentityRepo";
import { PrismaResourceRepo } from "../infra/prisma/PrismaResourceRepo";

import { BullMQExecutionQueueService } from "../infra/services/BullMQExecutionQueueService";
import { BcryptHashingService } from "../infra/services/BcryptHashingService";
import { JWTService } from "../infra/services/JWTService";
import { S3ObjectStorageService } from "../infra/services/S3ObjectStorageService";
import { UUIDService } from "../infra/services/UUIDService";

import { OAuthService } from "../infra/services/oauth/OAuthService";
import { OAuthProvider } from "../domain/types/OAuthProvider";
import { GoogleOAuthClient } from "../infra/services/oauth/GoogleOAuthClient";
import { GithubOAuthClient } from "../infra/services/oauth/GithubOAuthClient";

import dotenv from "dotenv";
dotenv.config();

export const prismaProblemRepo = new PrismaProblemRepo(prisma);
export const prismaResourceRepo = new PrismaResourceRepo(prisma);
export const prismaSubmissionRepo = new PrismaSubmissionRepo(prisma);
export const prismaUserRepo = new PrismaUserRepo(prisma);
export const prismaOAuthIdentityRepo = new PrismaOAuthIdentityRepo(prisma);

export const bullMqExecutionQueueService = new BullMQExecutionQueueService(queue);
export const bcryptHashingService = new BcryptHashingService(10);
export const jwtService = new JWTService(process.env.JWT_SECRET!);
export const s3ObjectStorageService = new S3ObjectStorageService(s3, process.env.S3_BUCKET_NAME!);
export const uuidService = new UUIDService();

export const googleOAuthClient = new GoogleOAuthClient(
  process.env.GOOGLE_CLIENT_ID!, 
  process.env.GOOGLE_CLIENT_SECRET!,
  process.env.GOOGLE_CALLBACK_URL!
);

export const githubOAuthClient = new GithubOAuthClient(
  process.env.GITHUB_CLIENT_ID!, 
  process.env.GITHUB_CLIENT_SECRET!,
  process.env.GITHUB_CALLBACK_URL!
);

export const oAuthService = new OAuthService({
  [OAuthProvider.GOOGLE]: googleOAuthClient,
  [OAuthProvider.GITHUB]: githubOAuthClient,
})