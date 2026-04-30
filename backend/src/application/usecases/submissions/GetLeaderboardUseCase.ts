import { ISubmissionRepo } from "../../../domain/repos/ISubmissionRepo";
import { LeaderboardRow } from "../../../domain/types/LeaderboardRow";

export type GetLeaderboardInput = {
  setupId: string;
};

export type RankedRow = LeaderboardRow & { rank: number };

export type GetLeaderboardOutput = {
  byRuntime: RankedRow[];
  byMemory: RankedRow[];
};

export class GetLeaderboardUseCase {
  constructor(private readonly submissionRepo: ISubmissionRepo) {}

  public async execute({ setupId }: GetLeaderboardInput): Promise<GetLeaderboardOutput> {
    const rows = await this.submissionRepo.findLeaderboard(setupId);

    return {
      byRuntime: this.rank(rows, "runtimeMs"),
      byMemory: this.rank(rows, "memoryKb"),
    };
  }

  private rank(rows: LeaderboardRow[], metric: "runtimeMs" | "memoryKb"): RankedRow[] {
    const withValue = rows.filter((r) => r[metric] !== null) as (LeaderboardRow & Record<typeof metric, number>)[];
    withValue.sort((a, b) => a[metric] - b[metric]);

    const seen = new Set<string>();
    const result: RankedRow[] = [];
    for (const row of withValue) {
      if (!seen.has(row.userId)) {
        seen.add(row.userId);
        result.push({ ...row, rank: result.length + 1 });
        if (result.length >= 10) break;
      }
    }
    return result;
  }
}
