import { SubmissionStatus } from "../types/SubmissionStatus"

export type Submission = {
  id: string,
  userId: string,
  problemId: string,
  setupId: string,
  
  codeFileKey: string,
  resultsFileKey?: string | null,

  status: SubmissionStatus,
  temporary: boolean,
  submittedAt: Date,
  finishedAt?: Date | null,
  runtimeMs?: number | null,
  memoryKb?: number | null,
}