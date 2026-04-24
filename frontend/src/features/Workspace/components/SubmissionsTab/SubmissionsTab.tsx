import { useProblemSubmissions } from "@/api/hooks/submissions";
import { useWorkspaceStore } from "../../store";
import { SubmissionCard } from "./SubmissionCard";
import { SubmissionDetails } from "./details/SubmissionDetails";
import { Loader2, FileX2, AlertCircle } from "lucide-react";

function EmptyState({ icon: Icon, message }: { icon: React.ElementType; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-48 gap-3 text-muted-foreground/40">
      <Icon size={28} strokeWidth={1.5} />
      <p className="text-xs">{message}</p>
    </div>
  );
}

export function SubmissionsTab() {
  const problem = useWorkspaceStore(state => state.problem);
  const setup   = useWorkspaceStore(state => state.setup);
  const { data: submissions, isLoading, error } = useProblemSubmissions(problem?.id!);
  const selectedSubmission  = useWorkspaceStore(state => state.selectedSubmission);
  const setSelectedSubmission = useWorkspaceStore(state => state.setSelectedSubmission);

  if (selectedSubmission) {
    return (
      <SubmissionDetails
        id={selectedSubmission.id}
        onClose={() => setSelectedSubmission(null)}
      />
    );
  }

  if (!problem || !setup) {
    return <EmptyState icon={FileX2} message="Select a language to see submissions" />;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48 gap-2 text-muted-foreground/40">
        <Loader2 size={16} className="animate-spin" />
        <span className="text-xs">Loading…</span>
      </div>
    );
  }

  if (error) {
    return <EmptyState icon={AlertCircle} message="Failed to load submissions" />;
  }

  const filteredSubmissions = (submissions ?? []).filter(s => s.setupId === setup.id);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-border/30 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-white/[0.06] text-muted-foreground/70 border border-white/[0.06]">
            {setup.language}
          </span>
          <span className="text-sm font-medium text-foreground/80">Submissions</span>
        </div>
        <span className="text-xs text-muted-foreground/40 tabular-nums">
          {filteredSubmissions.length}
        </span>
      </div>

      {/* List */}
      {filteredSubmissions.length === 0 ? (
        <EmptyState icon={FileX2} message="No submissions yet" />
      ) : (
        <div className="flex-1 overflow-y-auto">
          {filteredSubmissions.map(submission => (
            <SubmissionCard
              key={submission.id}
              problem={problem}
              submission={submission}
              onClick={() => setSelectedSubmission(submission)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
