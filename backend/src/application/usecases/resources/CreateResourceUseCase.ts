import { IResourceRepo } from "../../../domain/repos/IResourceRepo";
import { IUserRepo } from "../../../domain/repos/IUserRepo";
import { IUUIDService } from "../../services/interfaces/IUUIDService";
import { ResourceDTO } from "../../dtos/ResourceDTO";
import { mapResourceToDTO } from "../../mappers/mapResourceToDTO";
import { Role } from "../../../domain/types/Role";
import { assertUserIsRole } from "../../helpers/assertUserIsRole";

export type CreateResourceInput = {
  userId: string;
  title: string;
  content: string;
  order?: number;
};
export type CreateResourceOutput = { resource: ResourceDTO };

export class CreateResourceUseCase {
  constructor(
    private readonly resourceRepo: IResourceRepo,
    private readonly userRepo: IUserRepo,
    private readonly uuidService: IUUIDService,
  ) {}

  async execute(input: CreateResourceInput): Promise<CreateResourceOutput> {
    const { userId, title, content, order = 0 } = input;
    await assertUserIsRole(userId, Role.ADMIN, this.userRepo);

    const resource = {
      id: this.uuidService.generate(),
      title,
      content,
      order,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.resourceRepo.save(resource);
    return { resource: mapResourceToDTO(resource) };
  }
}
