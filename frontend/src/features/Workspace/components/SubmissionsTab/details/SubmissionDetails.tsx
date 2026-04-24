import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, Clock, Cpu, Loader2 } from "lucide-react";
import { useSubmissionWithResults } from "@/api/hooks/submissions";
import { useWorkspaceStore } from "@/features/Workspace/store";
import { useTests } from "@/api/hooks/problems";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export type SubmissionDetailsProps = {
  id: string;
  onClose: () => void;
};

const STATUS = {
  ACCEPTED: { label: "Accepted", color: "text-emerald-400", bar: "bg-emerald-500" },
  REJECTED: { label: "Wrong Answer", color: "text-rose-400", bar: "bg-rose-500"   },
  FAILED:   { label: "Runtime Error", color: "text-rose-400", bar: "bg-rose-500"  },
  PENDING:  { label: "Pending",       color: "text-blue-400", bar: "bg-blue-500"  },
} as const;

function totalMs(results: any): number {
  return Math.trunc(
    (results?.testcases ?? []).reduce((sum: number, t: any) => sum + (t.time_ms ?? 0), 0)
  );
}

export function SubmissionDetails({ id, onClose }: SubmissionDetailsProps) {
  const { data, isLoading } = useSubmissionWithResults(id);
  const setSubmissionResults = useWorkspaceStore(state => state.setSubmissionResults);
  const problem  = useWorkspaceStore(state => state.problem);
  const setupId  = useWorkspaceStore(state => state.setup?.id);
  const { data: tests } = useTests(problem?.id!, setupId!);

  useEffect(() => {
    if (data?.results) setSubmissionResults(data.results);
  }, [data?.results, setSubmissionResults]);

  if (isLoading || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-48 gap-2 text-muted-foreground/40">
        <Loader2 size={18} className="animate-spin" />
        <span className="text-xs">Loading…</span>
      </div>
    );
  }

  const { submission, results } = data;
  const theme = STATUS[submission.status as keyof typeof STATUS] ?? STATUS.PENDING;

  const totalTests  = tests?.testcases?.length ?? 0;
  const passedTests = results?.testcases?.filter((t: any) => t.status === "ACCEPTED").length ?? 0;
  const pct = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Back */}
      <div className="flex items-center px-4 py-2 border-b border-border/30 shrink-0">
        <button
          onClick={onClose}
          className="flex items-center gap-1 text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors"
        >
          <ChevronLeft size={14} />
          Submissions
        </button>
      </div>

      <div className="flex-1 px-5 py-5 space-y-5">
        {/* Status hero */}
        <div>
          <p className={cn("text-2xl font-bold tracking-tight", theme.color)}>
            {theme.label}
          </p>
          <p className="text-xs text-muted-foreground/50 mt-1">
            {format(new Date(submission.submittedAt), "MMM d, yyyy · h:mm a")}
          </p>
        </div>

        {/* Testcase progress */}
        {totalTests > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground/60">
              <span>Test cases</span>
              <span className="tabular-nums font-mono">{passedTests} / {totalTests}</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-white/[0.06] overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all duration-500", theme.bar)}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        )}

        {/* Stats — only on accepted */}
        {submission.status === "ACCEPTED" && results && (
          <div className="grid grid-cols-2 gap-2">
            <StatCard
              icon={<Clock size={13} />}
              label="Runtime"
              value={`${totalMs(results)} ms`}
            />
            <StatCard
              icon={<Cpu size={13} />}
              label="Memory"
              value={results.memory ? `${results.memory} KB` : "N/A"}
            />
          </div>
        )}

        {/* Error output */}
        {submission.status === "FAILED" && (
          <div className="rounded-lg border border-rose-500/15 bg-rose-500/5 p-4">
            <p className="text-[11px] text-rose-400/60 uppercase tracking-widest font-medium mb-2">
              Error
            </p>
            <pre className="text-xs font-mono text-rose-300/80 whitespace-pre-wrap leading-relaxed overflow-x-auto max-h-60">
              {results?.error ?? "Unknown error"}
            </pre>
          </div>
        )}

        {/* Submission ID */}
        <p className="text-[10px] font-mono text-muted-foreground/25 break-all">
          {submission.id}
        </p>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-border/40 bg-white/[0.03] px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-muted-foreground/50">
        {icon}
        <span className="text-[10px] uppercase tracking-widest font-medium">{label}</span>
      </div>
      <span className="text-sm font-semibold font-mono">{value}</span>
    </div>
  );
}
