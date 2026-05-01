import type { Problem } from "@/types/Problem";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { DifficultyTag } from "@/features/ProblemList/DifficultyTag";

export function ProblemDisplayer({ problem }: { problem?: Problem }) {
  if (!problem) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-xs text-muted-foreground/40">Loading problem…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 sm:px-6 pt-5 sm:pt-6 pb-4 sm:pb-5 border-b border-border/40 shrink-0">
        <div className="flex items-start justify-between gap-3 mb-1">
          <h1 className="text-2xl sm:text-3xl font-semibold leading-snug tracking-tight text-foreground">
            {problem.title}
          </h1>
          <div className="shrink-0 pt-0.5 scale-120">
            <DifficultyTag difficulty={problem.difficulty} />
          </div>
        </div>
        {problem.description && (
          <p className="text-sm text-muted-foreground/70 leading-relaxed">
            {problem.description}
          </p>
        )}
      </div>

      {/* Statement */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 pb-20">
        <div className="markdown-body">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{problem.statement}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}