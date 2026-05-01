import { Editor } from "@monaco-editor/react";
import { useEditorStore } from "../../store/store";
import { FileBreadcrumb } from "./FileBreadcrumb";
import { languageFromFilename } from "../../utils/languageFromFilename";

function handleMount(editor: any, monaco: any) {
  monaco.editor.defineTheme("lc-dark", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "comment", foreground: "4a5068", fontStyle: "italic" },
    ],
    colors: {
      "editor.background":              "#191b24",
      "editor.foreground":              "#dde1f0",
      "editor.lineHighlightBackground": "#ffffff07",
      "editor.selectionBackground":     "#3b4bdb38",
      "editorLineNumber.foreground":    "#3e4260",
      "editorLineNumber.activeForeground": "#6b7280",
      "editorCursor.foreground":        "#818cf8",
      "editorIndentGuide.background1":  "#22253a",
      "editorBracketMatch.background":  "#3b4bdb28",
      "editorBracketMatch.border":      "#4f5fd0",
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
      <div className="flex h-full items-center justify-center bg-[#191b24]">
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
          scrollBeyondLastLine: false,
        }}
      />
    </>
  );
}
