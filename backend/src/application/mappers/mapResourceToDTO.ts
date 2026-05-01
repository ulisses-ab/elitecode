import { Resource } from "../../domain/entities/Resource";
import { ResourceDTO } from "../dtos/ResourceDTO";

export function mapResourceToDTO(resource: Resource): ResourceDTO {
  return {
    id: resource.id,
    title: resource.title,
    content: resource.content,
    order: resource.order,
    createdAt: resource.createdAt,
    updatedAt: resource.updatedAt,
  };
}
