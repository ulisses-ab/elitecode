import { IProblemRepo } from "../../../domain/repos/IProblemRepo";
import { IUserRepo } from "../../../domain/repos/IUserRepo";
import { Role } from "../../../domain/types/Role";
import { assertUserIsRole } from "../../helpers/assertUserIsRole";

export type DeleteProblemInput = {
  problemId: string;
  userId: string;
};

export class DeleteProblemUseCase {
  constructor(
    private readonly problemRepo: IProblemRepo,
    private readonly userRepo: IUserRepo,
  ) {}

  public async execute(input: DeleteProblemInput): Promise<void> {
    const { problemId, userId } = input;
    await assertUserIsRole(userId, Role.ADMIN, this.userRepo);
    await this.problemRepo.deleteById(problemId);
  }
}
