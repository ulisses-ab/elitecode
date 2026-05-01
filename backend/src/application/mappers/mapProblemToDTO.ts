import { Problem } from "../../domain/entities/Problem";
import { ProblemDTO } from "../dtos/ProblemDTO";
import { mapProblemSetupToDTO } from "./mapProblemSetupToDTO";

export function mapProblemToDTO(problem: Problem): ProblemDTO {
  return {
    id: problem.id,
    slug: problem.slug,
    title: problem.title,
    description: problem.description,
    statement: problem.statement,
    tags: problem.tags,
    difficulty: problem.difficulty,
    setups: problem.setups.map(mapProblemSetupToDTO),
    createdAt: problem.createdAt,
    updatedAt: problem.updatedAt,
  };
}