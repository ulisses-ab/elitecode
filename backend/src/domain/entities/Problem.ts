import { Difficulty } from "../types/Difficulty"
import { ProblemSetup } from "./ProblemSetup"

export type Problem = {
  id: string,
  slug: string,
  title: string,
  description: string,
  statement: string,
  difficulty: Difficulty,

  tags: string[],
  setups: ProblemSetup[],
  defaultTestsFileKey?: string | null,

  creatorId: string,
  
  createdAt: Date,
  updatedAt: Date,
}