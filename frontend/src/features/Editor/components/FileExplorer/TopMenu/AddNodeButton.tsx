import { TbFolderPlus, TbFilePlus } from "react-icons/tb";
import { useEditorStore } from "../../../store/store";

export function AddNodeButton({ type }: { type: "folder" | "file" }) {
  const nodes = useEditorStore((state) => state.nodes);
  const rootId = useEditorStore((state) => state.rootId);
  const selectedNodeId = useEditorStore((state) => state.selectedNodeId);
  const renamingNodeId = useEditorStore((state) => state.renamingNodeId);
  const createNode = useEditorStore((state) => state.createNode);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (renamingNodeId) return;

    const selectedNode = 
      selectedNodeId ?
        nodes[selectedNodeId] :
        nodes[rootId!];

    const parentId = 
      selectedNode.type === "folder" ?
        selectedNode.id :
        selectedNode.parentId;

    createNode(parentId!, "", type); 
  };

  return (
    <button
      onClick={handleAdd}
      className="flex items-center gap-1 p-1 rounded text-muted-foreground/40 hover:text-muted-foreground hover:bg-white/[0.06] transition-colors"
      title={type === "file" ? "New file" : "New folder"}
    >
      {type === "file" ? (
        <TbFilePlus size={18} />
      ) : (
        <TbFolderPlus size={18} />
      )}

    </button>
  );
}
