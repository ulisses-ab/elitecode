import { ProblemDTO } from "../../dtos/ProblemDTO";
import { IProblemRepo } from "../../../domain/repos/IProblemRepo";
import { AppError } from "../../errors/AppError";
import { ErrorCode } from "../../errors/ErrorCode";
import { mapProblemToDTO } from "../../mappers/mapProblemToDTO";

export type GetProblemInput = {
  problemId: string,
}

export type GetProblemOutput = {
  problem: ProblemDTO,
}

export class GetProblemUseCase {
  constructor(
    private readonly problemRepo: IProblemRepo,
  ) {}

  public async execute(input: GetProblemInput): Promise<GetProblemOutput> {
    const { problemId } = input;

    const problem =
      (await this.problemRepo.findBySlug(problemId)) ??
      (await this.problemRepo.findById(problemId));

    if (!problem) {
      throw new AppError(ErrorCode.PROBLEM_NOT_FOUND, "Problem not found");
    }

    return {
      problem: mapProblemToDTO(problem),
    };
  }
}