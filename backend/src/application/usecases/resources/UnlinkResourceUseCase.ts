import { IResourceRepo } from "../../../domain/repos/IResourceRepo";
import { IUserRepo } from "../../../domain/repos/IUserRepo";
import { Role } from "../../../domain/types/Role";
import { assertUserIsRole } from "../../helpers/assertUserIsRole";
import { AppError } from "../../errors/AppError";
import { ErrorCode } from "../../errors/ErrorCode";

export type UnlinkResourceInput = { userId: string; resourceId: string; problemId: string };

export class UnlinkResourceUseCase {
  constructor(
    private readonly resourceRepo: IResourceRepo,
    private readonly userRepo: IUserRepo,
  ) {}

  async execute({ userId, resourceId, problemId }: UnlinkResourceInput): Promise<void> {
    await assertUserIsRole(userId, Role.ADMIN, this.userRepo);
    const resource = await this.resourceRepo.findById(resourceId);
    if (!resource) throw new AppError(ErrorCode.RESOURCE_NOT_FOUND, "Resource not found");
    await this.resourceRepo.unlinkFromProblem(resourceId, problemId);
  }
}
