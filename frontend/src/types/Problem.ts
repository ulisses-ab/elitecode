import type { ProblemSetup } from "./ProblemSetup"

export type Problem = {
  id: string,
  slug: string,
  title: string,
  statement: string,
  difficulty: string,
  description: string,
  tags: string[],
  setups: ProblemSetup[],
  createdAt: Date,
  updatedAt: Date,
}