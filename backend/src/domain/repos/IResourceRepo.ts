import { Resource } from "../entities/Resource";

export interface IResourceRepo {
  findAll(): Promise<Resource[]>;
  findById(id: string): Promise<Resource | null>;
  findByProblemId(problemId: string): Promise<Resource[]>;
  save(resource: Resource): Promise<void>;
  deleteById(id: string): Promise<void>;
  linkToProblem(resourceId: string, problemId: string): Promise<void>;
  unlinkFromProblem(resourceId: string, problemId: string): Promise<void>;
}
