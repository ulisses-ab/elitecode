import { FaDownload, FaUpload } from "react-icons/fa";
import { useEditorStore } from "../../../store/store";
import { useRef, useState } from "react";
import { zipToFileNodes, fileNodesToZip } from "../../../utils/zip";
import { downloadFile } from "../../../utils/download";
import { useWorkspaceStore } from "@/features/Workspace/store";
import { useTemplate } from "@/api/hooks/problems";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { RotateCcw } from "lucide-react";

export function UploadDownload() {
  const nodes = useEditorStore((state) => state.nodes);
  const rootId = useEditorStore((state) => state.rootId);
  const setNodes = useEditorStore((state) => state.setNodes);
  const resetStore = useEditorStore((state) => state.reset);

  const problemId = useWorkspaceStore((state) => state.problem?.id);
  const setupId = useWorkspaceStore((state) => state.setup?.id);
  const { data: template } = useTemplate(problemId!, setupId!);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [resetOpen, setResetOpen] = useState(false);

  const handleUploadClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const { nodes, rootId } = await zipToFileNodes(file);
      setNodes(nodes, rootId);
    }
  };

  const handleDownload = async () => {
    downloadFile(await fileNodesToZip(nodes, rootId!), "solution.zip");
  };

  const handleReset = async () => {
    if (template) {
      const { nodes, rootId } = await zipToFileNodes(template);
      resetStore(nodes, rootId);
    }
    setResetOpen(false);
  };

  return (
    <>
      <div className="flex items-center gap-1">
        <button
          className="flex items-center gap-1.5 px-2 py-1 rounded border border-border/40 bg-white/[0.04] text-muted-foreground/70 hover:text-foreground hover:bg-white/[0.08] hover:border-border/70 transition-colors text-xs"
          onClick={() => setResetOpen(true)}
          title="Reset to template"
        >
          <RotateCcw size={11} aria-hidden="true" />
          Reset
        </button>

        <button
          className="flex items-center gap-1.5 px-2 py-1 rounded border border-border/40 bg-white/[0.04] text-muted-foreground/70 hover:text-foreground hover:bg-white/[0.08] hover:border-border/70 transition-colors text-xs"
          onClick={handleDownload}
          title="Export as ZIP"
        >
          <FaDownload size={11} aria-hidden="true" />
          Export
        </button>

        <input
          type="file"
          accept=".zip"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: "none" }}
        />

        <button
          className="flex items-center gap-1.5 px-2 py-1 rounded border border-border/40 bg-white/[0.04] text-muted-foreground/70 hover:text-foreground hover:bg-white/[0.08] hover:border-border/70 transition-colors text-xs"
          onClick={handleUploadClick}
          title="Import ZIP"
        >
          <FaUpload size={11} aria-hidden="true" />
          Import
        </button>
      </div>

      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogContent className="max-w-sm sm:max-w-lg border-border/50 bg-card">
          <DialogHeader>
            <DialogTitle className="text-sm font-medium">Reset to template?</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              This will discard all your changes and restore the original template files for this setup. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-2">
            <DialogClose asChild>
              <button className="flex-1 px-3 py-1.5 text-xs rounded border border-border/50 text-muted-foreground hover:bg-white/[0.05] hover:text-foreground transition-colors">
                Cancel
              </button>
            </DialogClose>
            <button
              onClick={handleReset}
              className="flex-1 px-3 py-1.5 text-xs rounded border border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-colors"
            >
              Reset
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
