import { Difficulty } from "../../domain/types/Difficulty"
import { ProblemSetupDTO } from "./ProblemSetupDTO"

export type ProblemDTO = {
  id: string,
  slug: string,
  title: string,
  statement: string,
  description: string,
  tags: string[],
  difficulty: Difficulty,
  setups: ProblemSetupDTO[],
  createdAt: Date,
  updatedAt: Date,
}