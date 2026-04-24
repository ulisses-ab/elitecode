import { Button } from "@/components/ui/button";
import { FaDownload, FaUpload } from "react-icons/fa";
import { useEditorStore } from "../../../store/store";
import { useRef } from "react";
import { zipToFileNodes, fileNodesToZip } from "../../../utils/zip";
import { downloadFile } from "../../../utils/download";

export function UploadDownload() {
  const nodes = useEditorStore((state) => state.nodes);
  const rootId = useEditorStore((state) => state.rootId);
  const setNodes = useEditorStore((state) => state.setNodes);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      const { nodes, rootId } = await zipToFileNodes(file)

      setNodes(nodes, rootId);
    }
  };

  const handleDownload = async () => {
    downloadFile(await fileNodesToZip(nodes, rootId!), "solution.zip");
  };

  return (
    <div className="flex items-center gap-0.5">
      <button
        className="p-1.5 rounded text-muted-foreground/40 hover:text-muted-foreground hover:bg-white/[0.06] transition-colors"
        onClick={handleDownload}
        title="Export as ZIP"
      >
        <FaDownload size={12} />
      </button>

      <input
        type="file"
        accept=".zip"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: "none" }}
      />

      <button
        className="p-1.5 rounded text-muted-foreground/40 hover:text-muted-foreground hover:bg-white/[0.06] transition-colors"
        onClick={handleUploadClick}
        title="Import ZIP"
      >
        <FaUpload size={12} />
      </button>
    </div>
  );
}