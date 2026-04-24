import { IUserRepo } from "../../../domain/repos/IUserRepo";
import { ISubmissionRepo } from "../../../domain/repos/ISubmissionRepo";
import { AppError } from "../../errors/AppError";
import { ErrorCode } from "../../errors/ErrorCode";
import { UserDTO } from "../../dtos/UserDTO";
import { mapUserToDTO } from "../../mappers/mapUserToDTO";

export type GetUserProfileInput = {
  userId: string;
};

export type SubmissionSummary = {
  id: string;
  problemId: string;
  status: string;
  submittedAt: Date;
};

export type GetUserProfileOutput = {
  user: UserDTO;
  stats: {
    totalSubmissions: number;
    acceptedSubmissions: number;
    rejectedSubmissions: number;
    solvedEasy: number;
    solvedMedium: number;
    solvedHard: number;
    totalSolved: number;
  };
  recentSubmissions: SubmissionSummary[];
};

export class GetUserProfileUseCase {
  constructor(
    private readonly userRepo: IUserRepo,
    private readonly submissionRepo: ISubmissionRepo,
  ) {}

  public async execute(input: GetUserProfileInput): Promise<GetUserProfileOutput> {
    const { userId } = input;

    const user = await this.userRepo.findById(userId);
    if (!user) throw new AppError(ErrorCode.USER_NOT_FOUND, "User not found");

    const submissions = await this.submissionRepo.findNonTemporaryByUserId(userId);
    const solvedDifficulties = await this.submissionRepo.findSolvedProblemDifficulties(userId);

    const accepted = submissions.filter(s => s.status === "ACCEPTED");
    const rejected = submissions.filter(s => s.status === "REJECTED");

    const solvedEasy = solvedDifficulties.filter(d => d.difficulty === "EASY").length;
    const solvedMedium = solvedDifficulties.filter(d => d.difficulty === "MEDIUM").length;
    const solvedHard = solvedDifficulties.filter(d => d.difficulty === "HARD").length;

    return {
      user: mapUserToDTO(user),
      stats: {
        totalSubmissions: submissions.length,
        acceptedSubmissions: accepted.length,
        rejectedSubmissions: rejected.length,
        solvedEasy,
        solvedMedium,
        solvedHard,
        totalSolved: solvedDifficulties.length,
      },
      recentSubmissions: submissions.slice(0, 10).map(s => ({
        id: s.id,
        problemId: s.problemId,
        status: s.status,
        submittedAt: s.submittedAt,
      })),
    };
  }
}
