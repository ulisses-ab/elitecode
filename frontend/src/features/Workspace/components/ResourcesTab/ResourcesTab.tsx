import { useState } from "react";
import { useResources } from "@/api/hooks/resources";
import { useWorkspaceStore } from "../../store";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { BookOpen, ChevronLeft, ChevronRight, Loader2, Maximize2 } from "lucide-react";
import type { Resource } from "@/types/Resource";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

function ResourceList({
  resources,
  onSelect,
}: {
  resources: Resource[];
  onSelect: (r: Resource) => void;
}) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-5 py-3 border-b border-border/30 shrink-0">
        <span className="text-sm font-medium text-foreground/80">Resources</span>
        <span className="text-xs text-muted-foreground/40 tabular-nums">{resources.length}</span>
      </div>

      <div className="flex-1 overflow-y-auto">
        {resources.map((resource, idx) => (
          <button
            key={resource.id}
            onClick={() => onSelect(resource)}
            className="group w-full flex items-center gap-3 px-5 py-3.5 border-b border-border/25 last:border-0 hover:bg-white/[0.03] transition-colors text-left"
          >
            <span className="text-[11px] font-mono text-muted-foreground/25 w-4 shrink-0 text-right tabular-nums">
              {idx + 1}
            </span>
            <span className="flex-1 text-sm text-foreground/70 group-hover:text-foreground/90 transition-colors font-medium leading-snug">
              {resource.title}
            </span>
            <ChevronRight
              size={13}
              className="text-muted-foreground/25 group-hover:text-muted-foreground/50 shrink-0 transition-colors"
            />
          </button>
        ))}
      </div>
    </div>
  );
}

function MarkdownContent({ content }: { content: string }) {
  return (
    <div className="markdown-body">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}

function ResourceReader({
  resource,
  onBack,
}: {
  resource: Resource;
  onBack: () => void;
}) {
  const [fullscreen, setFullscreen] = useState(false);

  return (
    <>
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/30 shrink-0">
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-muted-foreground/50 hover:text-foreground/70 transition-colors text-xs py-0.5 px-1 -ml-1 rounded hover:bg-white/[0.05]"
          >
            <ChevronLeft size={13} />
            Resources
          </button>
          <button
            onClick={() => setFullscreen(true)}
            className="flex items-center justify-center w-6 h-6 rounded text-muted-foreground/40 hover:text-foreground/70 hover:bg-white/[0.06] transition-colors"
            title="Open fullscreen"
          >
            <Maximize2 size={12} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pt-5 pb-20">
          <h2 className="text-base font-semibold text-foreground/90 mb-5 leading-snug">
            {resource.title}
          </h2>
          <MarkdownContent content={resource.content} />
        </div>
      </div>

      <Dialog open={fullscreen} onOpenChange={setFullscreen}>
        <DialogContent
          showCloseButton
          className="!inset-0 !translate-x-0 !translate-y-0 !max-w-none !w-screen !h-screen !rounded-none !border-0 flex flex-col gap-0 p-0 bg-background"
        >
          <div className="px-8 pt-6 pb-4 border-b border-border/40 shrink-0">
            <DialogTitle className="text-lg font-semibold text-foreground/90 leading-snug">
              {resource.title}
            </DialogTitle>
          </div>
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-3xl mx-auto px-8 py-8 pb-24">
              <MarkdownContent content={resource.content} />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function ResourcesTab() {
  const problem = useWorkspaceStore((state) => state.problem);
  const { data: resources, isLoading } = useResources(problem?.id);
  const [selected, setSelected] = useState<Resource | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48 gap-2 text-muted-foreground/40">
        <Loader2 size={16} className="animate-spin" />
        <span className="text-xs">Loading…</span>
      </div>
    );
  }

  if (!resources || resources.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 gap-3 text-muted-foreground/40">
        <BookOpen size={28} strokeWidth={1.5} />
        <p className="text-xs">No resources yet.</p>
      </div>
    );
  }

  if (selected) {
    return <ResourceReader resource={selected} onBack={() => setSelected(null)} />;
  }

  return <ResourceList resources={resources} onSelect={setSelected} />;
}
