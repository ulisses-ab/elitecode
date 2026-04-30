import { IProblemRepo } from "../../../domain/repos/IProblemRepo";
import { IUserRepo } from "../../../domain/repos/IUserRepo";
import { Difficulty } from "../../../domain/types/Difficulty";
import { Role } from "../../../domain/types/Role";
import { assertUserIsRole } from "../../helpers/assertUserIsRole";
import { AppError } from "../../errors/AppError";
import { ErrorCode } from "../../errors/ErrorCode";

export type UpdateProblemInput = {
  userId: string;
  problemId: string;
  difficulty?: Difficulty;
  title?: string;
  statement?: string;
  tags?: string[];
};

export class UpdateProblemUseCase {
  constructor(
    private readonly problemRepo: IProblemRepo,
    private readonly userRepo: IUserRepo,
  ) {}

  public async execute(input: UpdateProblemInput): Promise<void> {
    const { userId, problemId, ...updates } = input;
    await assertUserIsRole(userId, Role.ADMIN, this.userRepo);

    const problem = await this.problemRepo.findById(problemId);
    if (!problem) throw new AppError(ErrorCode.PROBLEM_NOT_FOUND, "Problem not found");

    const patch = Object.fromEntries(
      Object.entries(updates).filter(([, v]) => v !== undefined)
    );
    await this.problemRepo.save({ ...problem, ...patch, updatedAt: new Date() });
  }
}
