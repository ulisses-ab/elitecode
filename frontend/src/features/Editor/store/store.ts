import { create } from "zustand";
import { nanoid } from "nanoid";
import * as tree from "../utils/tree";
import type { FileNode } from "./types";
import { loadEditor, setupAutoSave } from "./persistance";

export type NodeId = string;

export type Snapshot = {
  nodes: Record<NodeId, FileNode>;
  rootId: NodeId;
  activeFileId: NodeId | null;
};

export type EditorState = {
  persistanceKey: string | null;

  nodes: Record<NodeId, FileNode>;
  rootId: NodeId;

  selectedNodeId: NodeId | null;
  activeFileId: NodeId | null;

  renamingNodeId: NodeId | null;

  past: Snapshot[];
  future: Snapshot[];

  initialize: (
    persistanceKey: string | null, 
    templateNodes: Record<NodeId, FileNode>, 
    templateRootId: NodeId
  ) => void;

  reset: (
    templateNodes: Record<NodeId, FileNode>, 
    templateRootId: NodeId
  ) => void;

  createNode: (parentId: NodeId, name: string, type: "file" | "folder") => NodeId;
  renameNode: (id: NodeId, name: string) => void;
  moveNode: (id: NodeId, newParentId: NodeId, index?: number) => void;
  deleteNode: (id: NodeId) => void;

  updateFileContent: (id: NodeId, content: string) => void;

  setNodes: (nodes: Record<NodeId, FileNode>, rootId: string) => void;
  setActiveFile: (id: NodeId | null) => void;
  setSelectedNode: (id: NodeId | null) => void;
  setRenamingNode: (id: NodeId | null) => void;

  undo: () => void;
  redo: () => void;
};

function makeSnapshot(state: EditorState): Snapshot {
  return {
    nodes: state.nodes,
    rootId: state.rootId,
    activeFileId: state.activeFileId,
  };
}

function commit(
  set: any,
  get: () => EditorState,
  mutator: (state: EditorState) => Partial<EditorState>
) {
  const snapshot = makeSnapshot(get());

  set((state: EditorState) => ({
    past: [...state.past, snapshot],
    future: [],
    ...mutator(state),
  }));
}

export const useEditorStore = create<EditorState>((set, get) => ({
  persistanceKey: null,

  nodes: {
    "root": {
      id: "root",
      name: "root",
      type: "folder",
      parentId: null,
      children: [],
    }
  },
  rootId: "root",

  selectedNodeId: null,
  activeFileId: null,
  renamingNodeId: null,

  past: [],
  future: [],

  initialize(persistanceKey, templateNodes, templateRootId) {
    let snapshot: Snapshot | null = null;

    if(persistanceKey) {
      snapshot = loadEditor(persistanceKey);
    }

    set({
      persistanceKey,
      nodes: snapshot?.nodes ?? templateNodes,
      rootId: snapshot?.rootId ?? templateRootId,
      activeFileId: snapshot?.activeFileId ?? null,
      selectedNodeId: null,
      renamingNodeId: null,
      past: [],
      future: [],
    })
  },

  reset(templateNodes, templateRootId) {
    set({
      nodes: templateNodes,
      rootId: templateRootId,
      activeFileId: null,
      selectedNodeId: null,
      renamingNodeId: null,
      past: [],
      future: [],
    })
  },

  createNode(parentId, name, type) {
    const id = nanoid();

    commit(set, get, (state) => {
      const nodes = tree.createNode(state.nodes, parentId, {
        id,
        name,
        type,
      });

      return {
        nodes,
        selectedNodeId: id,
        activeFileId: state.activeFileId,
        renamingNodeId: id,
      };
    });

    return id;
  },

  renameNode(id, name) {
    commit(set, get, (state) => ({
      nodes: tree.renameNode(state.nodes, id, name),
      renamingNodeId: null,
    }));
  },

  moveNode(id, newParentId) {
    commit(set, get, (state) => ({
      nodes: tree.moveNode(state.nodes, id, newParentId),
    }));
  },

  deleteNode(id) {
    commit(set, get, (state) => {
      const deletingActive = state.activeFileId === id;

      return {
        nodes: tree.deleteNode(state.nodes, id),
        selectedNodeId:
          state.selectedNodeId === id ? null : state.selectedNodeId,
        activeFileId: deletingActive ? null : state.activeFileId,
        renamingNodeId: null,
      };
    });
  },

  updateFileContent(id, content) {
    set((state) => {
      const node = state.nodes[id];
      if (!node || node.type !== "file") return {};

      return {
        nodes: tree.updateFileContent(state.nodes, id, content)
      };
    });
  },

  setNodes(nodes, rootId) {
    commit(set, get, (state) => {
      return {
        nodes,
        rootId,
        selectedNodeId: null,
        activeFileId: null,
        renamingNodeId: null,
      };
    });
  },

  setActiveFile(id) {
    set({ activeFileId: id });
  },

  setSelectedNode(id) {
    set({ selectedNodeId: id });
  },

  setRenamingNode(id) {
    set({ renamingNodeId: id });
  },

  undo() {
    const { past, future } = get();
    if (past.length === 0) return;

    const prev = past[past.length - 1];
    const current = makeSnapshot(get());

    set({
      ...prev,
      past: past.slice(0, -1),
      future: [current, ...future],
      renamingNodeId: null,
      selectedNodeId: null,
    });
  },

  redo() {
    const { past, future } = get();
    if (future.length === 0) return;

    const next = future[0];
    const current = makeSnapshot(get());

    set({
      ...next,
      past: [...past, current],
      future: future.slice(1),
      renamingNodeId: null,
      selectedNodeId: null,
    });
  },
}));

setupAutoSave(useEditorStore);