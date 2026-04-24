import { ProblemDisplayer } from "./components/ProblemDisplayer/ProblemDisplayer"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { useWorkspaceStore } from "./store"
import { SubmissionsTab } from "./components/SubmissionsTab/SubmissionsTab";

export function LeftSide() {
  const problem = useWorkspaceStore((state) => state.problem);
  const leftTab = useWorkspaceStore((state) => state.leftTab);
  const setLeftTab = useWorkspaceStore((state) => state.setLeftTab);
  const setup = useWorkspaceStore((state) => state.setup);  

  return (
    <div className="h-full flex flex-col">
      <Tabs
        value={leftTab}
        onValueChange={(value) => setLeftTab(value)}
        className="flex flex-col h-full"
      >
        <div className="border-b border-border/50 bg-background/30 shrink-0 px-2 pt-1">
          <TabsList className="bg-transparent gap-0 h-9 p-0">
            <TabsTrigger value="statement" className="text-xs font-medium px-3 h-9 rounded-none border-b-2 border-transparent data-[state=active]:border-foreground/80 data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=inactive]:text-muted-foreground">
              Statement
            </TabsTrigger>
            <TabsTrigger value="submissions" className="text-xs font-medium px-3 h-9 rounded-none border-b-2 border-transparent data-[state=active]:border-foreground/80 data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=inactive]:text-muted-foreground">
              Submissions
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 min-h-0">
          <TabsContent className="mt-0 h-full" value="statement" forceMount>
            {import.meta.env.VITE_ENVIRONMENT === "development" && (
              <div className="text-xs text-muted-foreground/50 px-3 py-1 font-mono">
                {problem?.id} / {setup?.id || "no setup"}
              </div>
            )}
            <ProblemDisplayer problem={problem ?? undefined} />
          </TabsContent>

          <TabsContent className="mt-0 h-full overflow-y-auto" value="submissions" forceMount>
            <SubmissionsTab />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}