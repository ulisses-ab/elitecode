import { Problem  } from "../../../domain/entities/Problem";
import { ProblemDTO } from "../../dtos/ProblemDTO";
import { mapProblemToDTO } from "../../mappers/mapProblemToDTO";
import { IProblemRepo } from "../../../domain/repos/IProblemRepo";
import { IUserRepo } from "../../../domain/repos/IUserRepo";
import { IUUIDService } from "../../services/interfaces/IUUIDService";
import { Difficulty } from "../../../domain/types/Difficulty";
import { AppError } from "../../errors/AppError";
import { ErrorCode } from "../../errors/ErrorCode";
import { Role } from "../../../domain/types/Role";
import { assertUserIsRole } from "../../helpers/assertUserIsRole";

export type CreateProblemInput = {
  userId: string,
  title: string,
  statement: string,
  description: string,
  difficulty: Difficulty,
}

export type CreateProblemOutput = {
  problem: ProblemDTO,
}

export class CreateProblemUseCase {
  constructor(
    private readonly problemRepo: IProblemRepo,
    private readonly userRepo: IUserRepo,
    private readonly uuidService: IUUIDService,
  ) {}

  public async execute(input: CreateProblemInput): Promise<CreateProblemOutput> {
    const { userId, title, statement, description, difficulty } = input;

    await assertUserIsRole(userId, Role.ADMIN, this.userRepo);

    if (!title.trim()) {
      throw new AppError(ErrorCode.INVALID_INPUT, "Title cannot be empty");
    }

    if (!statement.trim()) {
      throw new AppError(ErrorCode.INVALID_INPUT, "Statement cannot be empty");
    }

    const id = this.uuidService.generate();
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-" + id.slice(0, 6);

    const problem: Problem = {
      id,
      slug,
      title,
      statement,
      difficulty,
      description,
      tags: [],
      setups: [],
      defaultTestsFileKey: null,
      creatorId: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    await this.problemRepo.save(problem);

    return {
      problem: mapProblemToDTO(problem)
    }
  }
}