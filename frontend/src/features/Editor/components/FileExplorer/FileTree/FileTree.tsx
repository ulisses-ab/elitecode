import { Tree } from "react-arborist";
import type { FileNode } from "../../../store/types";
import { toArboristNodes } from "../../../utils/arborist";
import { useEditorStore } from "../../../store/store";
import { Node } from "./Node/Node";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { useEffect, useRef, useState } from "react";

export function FileTree() {
  const nodes = useEditorStore((state) => state.nodes);
  const rootId = useEditorStore((state) => state.rootId);
  const moveNode = useEditorStore((state) => state.moveNode);
  const setSelectedNode = useEditorStore((state) => state.setSelectedNode);
  const createNode = useEditorStore((state) => state.createNode);
  const renamingNodeId = useEditorStore((state) => state.renamingNodeId);

  const containerRef = useRef<HTMLDivElement>(null);
  const [treeHeight, setTreeHeight] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setTreeHeight(entry.contentRect.height));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const handleMove = (args: any) => {
    const targetParentId = args.parentId ?? rootId!;
    const node = nodes[args.dragIds[0]];
    if (targetParentId === node.parentId) return;
    moveNode(args.dragIds[0], targetParentId);
  };

  const bgCreatingRef = useRef(false);

  const treeData = toArboristNodes(nodes, rootId!);
  const isEmpty = !nodes[rootId!]?.children?.length;

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          ref={containerRef}
          className="flex-1 min-h-0 overflow-hidden"
          onClick={() => setSelectedNode(null)}
        >
          {isEmpty ? (
            <div className="flex flex-col items-center justify-center py-8 gap-1 text-center px-4">
              <p className="text-xs text-muted-foreground/40">No files yet</p>
              <p className="text-[10px] text-muted-foreground/25">Right-click to create a file</p>
            </div>
          ) : (
            <Tree<FileNode>
              data={treeData}
              width="100%"
              height={treeHeight}
              onMove={handleMove}
              className="outline-none"
            >
              {Node}
            </Tree>
          )}
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent
        className="w-48 [&>*]:cursor-pointer"
        onCloseAutoFocus={(e) => {
          if (bgCreatingRef.current) {
            bgCreatingRef.current = false;
            e.preventDefault();
          }
        }}
      >
        <ContextMenuItem disabled={!!renamingNodeId} onClick={() => { if (!renamingNodeId) { bgCreatingRef.current = true; createNode(rootId!, "", "file"); } }}>
          New file…
        </ContextMenuItem>
        <ContextMenuItem disabled={!!renamingNodeId} onClick={() => { if (!renamingNodeId) { bgCreatingRef.current = true; createNode(rootId!, "", "folder"); } }}>
          New folder…
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
