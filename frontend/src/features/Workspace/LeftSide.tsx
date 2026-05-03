import { ProblemDisplayer } from "./components/ProblemDisplayer/ProblemDisplayer"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { useWorkspaceStore } from "./store"
import { SubmissionsTab } from "./components/SubmissionsTab/SubmissionsTab";
import { LeaderboardTab } from "./components/LeaderboardTab/LeaderboardTab";
import { ResourcesTab } from "./components/ResourcesTab/ResourcesTab";
import { useResources } from "@/api/hooks/resources";
import { useEffect } from "react";

export function LeftSide() {
  const problem = useWorkspaceStore((state) => state.problem);
  const leftTab = useWorkspaceStore((state) => state.leftTab);
  const setLeftTab = useWorkspaceStore((state) => state.setLeftTab);

  const { data: resources } = useResources(problem?.id);
  const hasResources = !!resources && resources.length > 0;

  // If the active tab is "resources" but this problem has none, fall back to statement
  useEffect(() => {
    if (leftTab === "resources" && resources !== undefined && !hasResources) {
      setLeftTab("statement");
    }
  }, [hasResources, resources, leftTab, setLeftTab]);

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
            {hasResources && (
              <TabsTrigger value="resources" className="text-xs font-medium px-3 h-9 rounded-none border-b-2 border-transparent data-[state=active]:border-foreground/80 data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=inactive]:text-muted-foreground">
                Resources
              </TabsTrigger>
            )}
            <TabsTrigger value="submissions" className="text-xs font-medium px-3 h-9 rounded-none border-b-2 border-transparent data-[state=active]:border-foreground/80 data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=inactive]:text-muted-foreground">
              Submissions
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="text-xs font-medium px-3 h-9 rounded-none border-b-2 border-transparent data-[state=active]:border-foreground/80 data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=inactive]:text-muted-foreground">
              Leaderboard
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 min-h-0">
          <TabsContent className="mt-0 h-full" value="statement" forceMount>
            <ProblemDisplayer problem={problem ?? undefined} />
          </TabsContent>

          {hasResources && (
            <TabsContent className="mt-0 h-full overflow-y-auto" value="resources" forceMount>
              <ResourcesTab />
            </TabsContent>
          )}

          <TabsContent className="mt-0 h-full overflow-y-auto" value="submissions" forceMount>
            <SubmissionsTab />
          </TabsContent>

          <TabsContent className="mt-0 h-full overflow-y-auto" value="leaderboard" forceMount>
            <LeaderboardTab />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
