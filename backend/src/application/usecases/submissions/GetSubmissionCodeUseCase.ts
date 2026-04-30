import { ISubmissionRepo } from "../../../domain/repos/ISubmissionRepo";
import { IObjectStorageService } from "../../services/interfaces/IObjectStorageService";
import { AppError } from "../../errors/AppError";
import { ErrorCode } from "../../errors/ErrorCode";

export type GetSubmissionCodeInput = {
  userId: string;
  submissionId: string;
};

export type GetSubmissionCodeOutput = {
  codeBuffer: Buffer;
};

export class GetSubmissionCodeUseCase {
  constructor(
    private readonly submissionRepo: ISubmissionRepo,
    private readonly objectStorage: IObjectStorageService,
  ) {}

  public async execute(input: GetSubmissionCodeInput): Promise<GetSubmissionCodeOutput> {
    const { userId, submissionId } = input;

    const submission = await this.submissionRepo.findById(submissionId);
    if (!submission) {
      throw new AppError(ErrorCode.SUBMISSION_NOT_FOUND, "Submission not found");
    }

    if (submission.userId !== userId) {
      throw new AppError(ErrorCode.UNAUTHORIZED, "Not authorized to access this submission");
    }

    const codeBuffer = await this.objectStorage.download(submission.codeFileKey);

    return { codeBuffer };
  }
}
