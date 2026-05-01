import { IResourceRepo } from "../../../domain/repos/IResourceRepo";
import { IUserRepo } from "../../../domain/repos/IUserRepo";
import { Role } from "../../../domain/types/Role";
import { assertUserIsRole } from "../../helpers/assertUserIsRole";
import { AppError } from "../../errors/AppError";
import { ErrorCode } from "../../errors/ErrorCode";

export type LinkResourceInput = { userId: string; resourceId: string; problemId: string };

export class LinkResourceUseCase {
  constructor(
    private readonly resourceRepo: IResourceRepo,
    private readonly userRepo: IUserRepo,
  ) {}

  async execute({ userId, resourceId, problemId }: LinkResourceInput): Promise<void> {
    await assertUserIsRole(userId, Role.ADMIN, this.userRepo);
    const resource = await this.resourceRepo.findById(resourceId);
    if (!resource) throw new AppError(ErrorCode.RESOURCE_NOT_FOUND, "Resource not found");
    await this.resourceRepo.linkToProblem(resourceId, problemId);
  }
}
