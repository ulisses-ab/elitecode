import { IResourceRepo } from "../../../domain/repos/IResourceRepo";
import { ResourceDTO } from "../../dtos/ResourceDTO";
import { mapResourceToDTO } from "../../mappers/mapResourceToDTO";

export type ListResourcesInput = { problemId: string };
export type ListResourcesOutput = { resources: ResourceDTO[] };

export class ListResourcesUseCase {
  constructor(private readonly resourceRepo: IResourceRepo) {}

  async execute({ problemId }: ListResourcesInput): Promise<ListResourcesOutput> {
    const resources = await this.resourceRepo.findByProblemId(problemId);
    return { resources: resources.map(mapResourceToDTO) };
  }
}
