import { CodeEditor } from "./components/CodeEditor/CodeEditor";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { useEditorStore } from "./store/store";
import type { FileNode } from "./store/types";
import { useEffect, forwardRef, useImperativeHandle } from "react";
import { FileExplorer } from "./components/FileExplorer/FileExplorer";
import { fileNodesToZip, zipToFileNodes } from "./utils/zip";

const defaultNodes: Record<string, FileNode> = {
  "root": { id: "root", name: "root", type: "folder", parentId: null, children: [] },
};

export type EditorRef = {
  getCurrentZip: () => Promise<File>;
  reset: () => Promise<void>;
};

export const Editor = forwardRef<EditorRef, {
  persistanceKey: string,
  zip?: File,
}>(({ persistanceKey, zip }, ref) => {
  const nodes = useEditorStore((state) => state.nodes);
  const rootId = useEditorStore((state) => state.rootId);
  const initializeStore = useEditorStore((state) => state.initialize);

  async function initialize() {
    const { nodes, rootId } = 
      zip ?
        await zipToFileNodes(zip) :
        { nodes: defaultNodes, rootId: "root" };

    initializeStore(persistanceKey, nodes, rootId);
  }

  useEffect(() => {    
    initialize();
  }, [persistanceKey])

  useImperativeHandle(ref, () => ({
    getCurrentZip: () => {
      return fileNodesToZip(nodes, rootId);
    },
    reset: async () => {
      await initialize();
    },
  }), [nodes, rootId]);

  return (
    <ResizablePanelGroup
      direction="horizontal"
      className="flex-1 overflow-auto border-none"
    >
      <ResizablePanel
        className="min-w-36 max-w-64"
        defaultSize={18}
      >
        <FileExplorer />
      </ResizablePanel>
      <ResizableHandle className="bg-white/[0.04] w-px hover:bg-white/10 transition-colors" />
      <ResizablePanel className="bg-[#191b24]">
        <CodeEditor />
      </ResizablePanel>
    </ResizablePanelGroup>
  )
});