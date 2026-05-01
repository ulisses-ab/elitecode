import { IResourceRepo } from "../../../domain/repos/IResourceRepo";
import { IUserRepo } from "../../../domain/repos/IUserRepo";
import { Role } from "../../../domain/types/Role";
import { assertUserIsRole } from "../../helpers/assertUserIsRole";
import { AppError } from "../../errors/AppError";
import { ErrorCode } from "../../errors/ErrorCode";

export type UpdateResourceInput = {
  userId: string;
  resourceId: string;
  title?: string;
  content?: string;
  order?: number;
};

export class UpdateResourceUseCase {
  constructor(
    private readonly resourceRepo: IResourceRepo,
    private readonly userRepo: IUserRepo,
  ) {}

  async execute(input: UpdateResourceInput): Promise<void> {
    const { userId, resourceId, ...updates } = input;
    await assertUserIsRole(userId, Role.ADMIN, this.userRepo);

    const resource = await this.resourceRepo.findById(resourceId);
    if (!resource) throw new AppError(ErrorCode.RESOURCE_NOT_FOUND, "Resource not found");

    const patch = Object.fromEntries(
      Object.entries(updates).filter(([, v]) => v !== undefined)
    );
    await this.resourceRepo.save({ ...resource, ...patch, updatedAt: new Date() });
  }
}
