import { IResourceRepo } from "../../../domain/repos/IResourceRepo";
import { ResourceDTO } from "../../dtos/ResourceDTO";
import { mapResourceToDTO } from "../../mappers/mapResourceToDTO";

export type ListAllResourcesOutput = { resources: ResourceDTO[] };

export class ListAllResourcesUseCase {
  constructor(private readonly resourceRepo: IResourceRepo) {}

  async execute(): Promise<ListAllResourcesOutput> {
    const resources = await this.resourceRepo.findAll();
    return { resources: resources.map(mapResourceToDTO) };
  }
}
