import { Problem } from "../entities/Problem";
import { Difficulty } from "../types/Difficulty";
import { Language } from "../types/Language";

export interface IProblemRepo {
  findById(id: string): Promise<Problem | null>;
  findBySlug(slug: string): Promise<Problem | null>;
  findFiltered(
    limit?: number,
    offset?: number,
    searchText?: string,
    difficulty?: Difficulty,
    language?: Language,
  ): Promise<Problem[]>;

  save(problem: Problem): Promise<void>;
  deleteById(id: string): Promise<void>;
}