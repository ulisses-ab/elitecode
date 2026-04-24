import { TopMenu } from "./TopMenu/TopMenu";
import { FileTree } from "./FileTree/FileTree";
import { useCallback } from "react";
import { useEditorStore } from "@/features/Editor/store/store";

export function FileExplorer() {
  const undo = useEditorStore(s => s.undo);
  const redo = useEditorStore(s => s.redo);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const isUndo =
        (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z";

      if (isUndo) {
        e.preventDefault();
        undo();
      }

      const isRedo =
        (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y";

      if (isRedo) {
        e.preventDefault();
        redo();
      }
    },
    [undo, redo]
  );

  return (
    <div
      tabIndex={0}
      onKeyDown={onKeyDown}
      className="h-full flex flex-col select-none text-foreground/80 bg-[#141620] border-r border-white/[0.07] outline-none"
    >
      <TopMenu />
      <FileTree />
    </div>
  );
}
