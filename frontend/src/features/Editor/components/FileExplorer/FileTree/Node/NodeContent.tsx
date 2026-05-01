import { ChevronRight, ChevronDown } from "lucide-react";
import { FileIcon } from "./FileIcon";
import { NodeApi } from "react-arborist";
import type { FileNode } from "@/features/Editor/store/types";
import { useEffect, useMemo, useRef, useState } from "react";
import { useEditorStore } from "@/features/Editor/store/store";
import { RenameError } from "./RenameError";

export function NodeContent({ node }: { 
  node: NodeApi<FileNode>; 
}) {
  const setRenamingNode = useEditorStore((state) => state.setRenamingNode);
  const renameNode = useEditorStore((state) => state.renameNode);
  const deleteNode = useEditorStore((state) => state.deleteNode);
  const isRenaming = useEditorStore((state) => state.renamingNodeId === node.id);
  const [ renameVal, setRenameVal ] = useState(node.data.name);
  const nodes = useEditorStore((s) => s.nodes);
  // true when this node was just created and has never been named
  const isNewNode = useRef(node.data.name === "");

  const renamingInvalid = useMemo(() => {
    if (!isRenaming) return false;

    if (renameVal === "") return "A name must be provided";

    const n = nodes[node.id];
    const parent = nodes[n.parentId!];
    if (!parent?.children) return false;

    if (parent.children.some((childId) => {
      if (childId === node.id) return false;
      return nodes[childId]?.name === renameVal;
    })) {
      return `A file or folder with name ${renameVal} already exists at this location`;
    }
  }, [isRenaming, nodes, renameVal, node.id, node.data.parentId]);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isRenaming) {
      setRenameVal(node.data.name);
      requestAnimationFrame(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      });
    }
  }, [isRenaming]);

  const cancelRename = () => {
    setRenamingNode(null);
    setRenameVal(node.data.name);
    if (isNewNode.current) deleteNode(node.data.id);
  };

  const submitRename = () => {
    const val = inputRef.current?.value ?? "";

    if (!val.trim() || renamingInvalid) {
      cancelRename();
      return;
    }

    setRenamingNode(null);
    isNewNode.current = false;
    renameNode(node.data.id, val);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (e.key === "Enter") {
      if (renamingInvalid) return;
      submitRename();
    } else if (e.key === "Escape") {
      cancelRename();
    }
  };

  const fileIconName = 
    isRenaming ?
      renameVal :
      node.data.name;  
  return (
    <>
      {node.isInternal ? (
        <>
          {node.isOpen ? (
            <ChevronDown size={14} className="text-muted-foreground/50 shrink-0" />
          ) : (
            <ChevronRight size={14} className="text-muted-foreground/50 shrink-0" />
          )}
        </>
      ) : (
        <FileIcon name={fileIconName!} isFolder={false} />
      )}

      <input
        ref={inputRef}
        type="text"
        value={renameVal}
        onChange={(e) => setRenameVal(e.target.value)}
        onKeyDown={onKeyDown}
        onBlur={() => {
          // Defer by one rAF so our useEffect focus-rAF can run first.
          // If Radix's onCloseAutoFocus briefly stole focus, our rAF will
          // have re-focused the input and activeElement === input → skip.
          // If input is hidden, a keyboard handler already submitted → skip.
          requestAnimationFrame(() => {
            if (!inputRef.current || inputRef.current.hidden || document.activeElement === inputRef.current) return;
            submitRename();
          });
        }}
        hidden={!isRenaming}
        onClick={(e) => e.stopPropagation()}
        className="px-1 py-0 border flex-1 min-w-0 border-indigo-500/60 rounded outline-none bg-[#0f1117] text-foreground text-sm"
      />

      <span hidden={isRenaming}>{node.data.name}</span>

      {isRenaming && renamingInvalid && (
        <RenameError message={renamingInvalid} />
      )}
    </>
  );
}