import type { Problem } from "@/types/Problem";
import type { Submission } from "@/types/Submission";
import { format } from "timeago.js";
import { ChevronRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type StatusConfig = {
  label: string;
  dot: string;
  text: string;
};

function statusConfig(status: Submission["status"]): StatusConfig {
  switch (status) {
    case "ACCEPTED":
      return { label: "Accepted",     dot: "bg-emerald-400", text: "text-emerald-400" };
    case "REJECTED":
      return { label: "Wrong Answer", dot: "bg-rose-400",    text: "text-rose-400"    };
    case "PENDING":
      return { label: "Pending",      dot: "bg-blue-400",    text: "text-blue-400"    };
    default:
      return { label: "Error",        dot: "bg-rose-400",    text: "text-rose-400"    };
  }
}

export type SubmissionCardProps = {
  submission: Submission;
  problem: Problem;
  onClick?: () => void;
};

export function SubmissionCard({ submission, problem, onClick }: SubmissionCardProps) {
  const status = statusConfig(submission.status);
  const isPending = submission.status === "PENDING";

  return (
    <div
      onClick={isPending ? undefined : onClick}
      className={cn(
        "group flex items-center gap-3 px-5 py-3 border-b border-border/30 transition-colors",
        isPending
          ? "cursor-default opacity-70"
          : "cursor-pointer hover:bg-white/[0.03]"
      )}
    >
      {/* Status dot / spinner */}
      {isPending ? (
        <Loader2 size={12} className="shrink-0 text-blue-400 animate-spin" />
      ) : (
        <span className={cn("w-2 h-2 rounded-full shrink-0", status.dot)} />
      )}

      {/* Label */}
      <span className={cn("text-sm font-medium", status.text)}>
        {status.label}
      </span>

      {/* Time */}
      <span className="text-xs text-muted-foreground/50 ml-auto tabular-nums">
        {format(submission.submittedAt)}
      </span>

      {/* Arrow */}
      {!isPending && (
        <ChevronRight
          size={14}
          className="text-muted-foreground/25 group-hover:text-muted-foreground/60 transition-colors shrink-0"
        />
      )}
    </div>
  );
}
