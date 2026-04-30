import { useLeaderboard } from "@/api/hooks/submissions";
import { useWorkspaceStore } from "../../store";
import type { LeaderboardRow } from "@/api/functions/submissions";
import { Clock, Cpu, Loader2, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

const RANK_COLORS = ["text-amber-400", "text-slate-400", "text-amber-700"];

function RankBadge({ rank }: { rank: number }) {
  if (rank <= 3) {
    return (
      <Trophy
        size={12}
        className={cn("shrink-0", RANK_COLORS[rank - 1])}
        fill="currentColor"
      />
    );
  }
  return (
    <span className="text-[10px] font-mono text-muted-foreground/40 w-3 text-center">
      {rank}
    </span>
  );
}

function LeaderboardTable({
  rows,
  metric,
  icon,
  label,
  format,
}: {
  rows: LeaderboardRow[];
  metric: "runtimeMs" | "memoryKb";
  icon: React.ReactNode;
  label: string;
  format: (v: number) => string;
}) {
  return (
    <div className="rounded-lg border border-border/40 overflow-hidden">
      <div className="flex items-center gap-1.5 px-3 py-2 border-b border-border/30 bg-white/[0.02]">
        <span className="text-muted-foreground/50">{icon}</span>
        <span className="text-[10px] uppercase tracking-widest font-medium text-muted-foreground/50">
          {label}
        </span>
      </div>

      {rows.length === 0 ? (
        <p className="text-xs text-muted-foreground/30 px-3 py-4 text-center">
          No data yet
        </p>
      ) : (
        <div>
          {rows.map((row) => (
            <div
              key={row.submissionId}
              className="flex items-center gap-2.5 px-3 py-2 border-b border-border/20 last:border-0 hover:bg-white/[0.025] transition-colors"
            >
              <RankBadge rank={row.rank} />
              <span className="flex-1 text-xs text-foreground/80 font-medium truncate">
                {row.userHandle}
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.05] text-muted-foreground/60 border border-white/[0.06] shrink-0">
                {row.language}
              </span>
              <span className="text-xs font-mono font-semibold text-foreground/70 shrink-0 tabular-nums">
                {row[metric] !== null ? format(row[metric]!) : "—"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function LeaderboardTab() {
  const problem = useWorkspaceStore((state) => state.problem);
  const setup = useWorkspaceStore((state) => state.setup);
  const { data, isLoading } = useLeaderboard(problem?.id ?? null, setup?.id ?? null);

  if (!problem || !setup) {
    return (
      <div className="flex flex-col items-center justify-center h-48 gap-3 text-muted-foreground/40">
        <Trophy size={28} strokeWidth={1.5} />
        <p className="text-xs">Select a language to see rankings</p>
      </div>
    );
  }

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center h-48 gap-2 text-muted-foreground/40">
        <Loader2 size={16} className="animate-spin" />
        <span className="text-xs">Loading…</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 px-4 py-4">
      <LeaderboardTable
        rows={data.byRuntime}
        metric="runtimeMs"
        icon={<Clock size={12} />}
        label="Fastest"
        format={(v) => `${v} ms`}
      />
      <LeaderboardTable
        rows={data.byMemory}
        metric="memoryKb"
        icon={<Cpu size={12} />}
        label="Least Memory"
        format={(v) => `${v} KB`}
      />
    </div>
  );
}
