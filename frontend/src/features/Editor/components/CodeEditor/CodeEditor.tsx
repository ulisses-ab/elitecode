import { Editor } from "@monaco-editor/react";
import { useEditorStore } from "../../store/store";
import { FileBreadcrumb } from "./FileBreadcrumb";
import { languageFromFilename } from "../../utils/languageFromFilename";

function handleMount(editor: any, monaco: any) {
  monaco.editor.defineTheme("lc-dark", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "comment", foreground: "555555", fontStyle: "italic" },
    ],
    colors: {
      "editor.background":              "#1e1e1e",
      "editor.foreground":              "#d4d4d4",
      "editor.lineHighlightBackground": "#ffffff07",
      "editor.selectionBackground":     "#ffffff15",
      "editorLineNumber.foreground":    "#3d3d3d",
      "editorLineNumber.activeForeground": "#6b6b6b",
      "editorCursor.foreground":        "#d4d4d4",
      "editorIndentGuide.background1":  "#252525",
      "editorBracketMatch.background":  "#ffffff10",
      "editorBracketMatch.border":      "#6b6b6b",
      "scrollbarSlider.background":     "#ffffff0d",
      "scrollbarSlider.hoverBackground":"#ffffff18",
      "scrollbarSlider.activeBackground":"#ffffff22",
    },
  });
  monaco.editor.setTheme("lc-dark");
}

export function CodeEditor() {
  const nodes = useEditorStore((state) => state.nodes);
  const activeFileId = useEditorStore((state) => state.activeFileId);
  const updateFileContent = useEditorStore((state) => state.updateFileContent);

  if (!activeFileId) {
    return (
      <div className="flex h-full items-center justify-center bg-[#1e1e1e]">
        <p className="text-xs text-muted-foreground/40">Select a file to edit</p>
      </div>
    );
  }

  const activeFile = nodes[activeFileId];
  const language = languageFromFilename(activeFile.name);

  return (
    <>
      <FileBreadcrumb />
      <Editor
        key={activeFileId}
        language={language}
        value={activeFile.content ?? ""}
        onChange={(v) => updateFileContent(activeFileId, v ?? "")}
        onMount={handleMount}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          tabSize: 2,
          scrollBeyondLastLine: true,
        }}
      />
    </>
  );
}
