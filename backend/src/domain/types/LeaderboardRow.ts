export type LeaderboardRow = {
  submissionId: string
  userId: string
  userHandle: string
  language: string
  runtimeMs: number | null
  memoryKb: number | null
  submittedAt: Date
}
