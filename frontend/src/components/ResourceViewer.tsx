import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import type { Resource } from "@/types/Resource";

export function ResourceViewer({
  resource,
  open,
  onOpenChange,
}: {
  resource: Resource | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!resource) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
            <div className="markdown-body">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{resource.content}</ReactMarkdown>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
