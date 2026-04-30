import JSZip from "jszip";
import type { FileNode } from "../store/types";
import { getAncestorIdList } from "./tree";

export async function zipToFileNodes(
  zipData: Blob
): Promise<{ nodes: Record<string, FileNode>; rootId: string }> {
  const zip = await JSZip.loadAsync(zipData);
  const nodes: Record<string, FileNode> = {};
  const rootId = crypto.randomUUID();

  nodes[rootId] = {
    id: rootId,
    name: "root",
    type: "folder",
    parentId: null,
    children: [],
  };

  const entryNameToId: Record<string, string> = {
    "/": rootId
  }

  zip.forEach((relativePath: string, entry: JSZip.JSZipObject) => {
    const id = crypto.randomUUID();

    entryNameToId[entry.name] = id;
    
    const name = 
      entry.dir ?
        entry.name.split("/").at(-2)! :
        entry.name.split("/").at(-1)!;

    nodes[id] = {
      id: id,
      name: name,
      type: entry.dir ? "folder" : "file",
      parentId: null,
      children: entry.dir ? [] : undefined,
      content: entry.dir ? undefined : "",
    }
  })

  const processEntry = async (entry: JSZip.JSZipObject) => {
    const id = entryNameToId[entry.name];

    const parentName = 
      entry.dir ?
        entry.name.split("/").slice(0, -2).join("/") + "/" :
        entry.name.split("/").slice(0, -1).join("/") + "/";

    const parentId = entryNameToId[parentName];

    nodes[id].parentId = parentId;
    nodes[parentId].children?.push(id);

    if(!entry.dir) {
      const content = await entry.async("string");
      nodes[id].content = content;
    }
  }

  const promises: Promise<void>[] = [];

  zip.forEach((relativePath: string, entry: JSZip.JSZipObject) => {
    promises.push(processEntry(entry));
  })

  await Promise.all(promises);

  return { nodes, rootId };
}

export async function fileNodesToZip(
  nodes: Record<string, FileNode>,
  rootId: string,
  name?: string,
): Promise<File> {
  const zip = new JSZip();

  Object.values(nodes).forEach((node: FileNode) => {
    const ancestorIds = getAncestorIdList(nodes, node.id);
    const ancestorNames = ancestorIds.map((id) => nodes[id].name);
    
    const entryName = ancestorNames.slice(1).join("/");

    if(node.type === "file") {
      zip.file(entryName, node.content ?? "");
    }
    else {
      zip.folder(entryName)
    }
  });

  const blob = await zip.generateAsync({ type: "blob" });
  const file = new File([blob], name ?? "solution.zip", { type: "application/zip" });
  return file;
}