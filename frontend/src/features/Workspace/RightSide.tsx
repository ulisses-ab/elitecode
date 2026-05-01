import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { EditorContainer } from "./components/EditorContainer/EditorContainer";
import { useWorkspaceStore } from "./store";
import { forwardRef } from "react";
import type { EditorRef } from "@/features/Editor/Editor";
import { TestsTab } from "./components/TestsTab/TestsTab";
import { UploadDownload } from "@/features/Editor/components/FileExplorer/TopMenu/UploadDownload";

export function RightSide() {
  const rightTab = useWorkspaceStore(state => state.rightTab);
  const setRightTab = useWorkspaceStore(state => state.setRightTab);

  return (
    <div className="h-full flex flex-col">
      <Tabs 
        value={rightTab} 
        className="flex flex-col h-full" 
        onValueChange={(val) => setRightTab(val)}
      >
        <div className="border-b border-border/50 bg-background/30 shrink-0 px-2 pt-1 flex items-center justify-between">
          <TabsList className="bg-transparent gap-0 h-9 p-0">
            <TabsTrigger value="editor" className="text-xs font-medium px-3 h-9 rounded-none border-b-2 border-transparent data-[state=active]:border-foreground/80 data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=inactive]:text-muted-foreground">
              Editor
            </TabsTrigger>
            <TabsTrigger value="tests" className="text-xs font-medium px-3 h-9 rounded-none border-b-2 border-transparent data-[state=active]:border-foreground/80 data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=inactive]:text-muted-foreground">
              Tests
            </TabsTrigger>
          </TabsList>
          {rightTab === "editor" && <UploadDownload />}
        </div>

        <div className="flex-1 min-h-0">
          <TabsContent className="mt-0 h-full" value="editor" forceMount>
            <EditorContainer />
          </TabsContent>
          <TabsContent className="h-full overflow-y-auto" value="tests" forceMount>
            <TestsTab />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
};