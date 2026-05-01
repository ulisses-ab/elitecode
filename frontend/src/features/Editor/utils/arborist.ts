import type { FileNode } from "../store/types";

export function toArboristNodes(nodes: Record<string, FileNode>, rootId: string) {
  if (!nodes || !rootId) return [];
  const root = nodes[rootId];
  if (!root?.children) return [];

  const buildTree = (id: string): any => {
    const node = nodes[id];
    if (!node) return null;
    const isFolder = node.type === "folder";
    const children = isFolder
      ? (node.children?.map(buildTree).filter(Boolean) ?? [])
      : undefined;
    return { id: node.id, name: node.name, isFolder, children };
  };

  return root.children.map(buildTree).filter(Boolean);
}
