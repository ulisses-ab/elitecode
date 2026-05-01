import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { useProblem } from "@/api/hooks/problems"
import { LeftSide } from "./LeftSide";
import { RightSide } from "./RightSide";
import { useNavbarStore } from "@/stores/useNavbarStore";
import { useEffect, useState } from "react";
import { NavbarMenu } from "./components/NavbarMenu/NavbarMenu";
import { useWorkspaceStore } from "./store";
import { useSEO } from "@/hooks/useSEO";
import { cn } from "@/lib/utils";

export function Workspace({ problemId }: { problemId: string }) {
  const { data: problem } = useProblem(problemId);
  const initialize = useWorkspaceStore((state) => state.initialize);
  const setNavbarCenter = useNavbarStore((state) => state.setNavbarCenter);
  const [mobileTab, setMobileTab] = useState<"problem" | "code">("problem");

  useSEO({ title: problem ? `${problem.title} — EliteCode` : "EliteCode" });

  useEffect(() => {
    initialize(problem ?? null);
  }, [problem])

  useEffect(() => {
    setNavbarCenter(<NavbarMenu />)
  }, [])

  return (
    <>
      {/* Mobile layout */}
      <div className="flex md:hidden flex-col flex-1 overflow-hidden">
        <div className="flex shrink-0 border-b border-border/50 bg-background/30">
          {(["problem", "code"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setMobileTab(tab)}
              className={cn(
                "flex-1 py-2.5 text-xs font-medium capitalize transition-colors border-b-2 -mb-px",
                mobileTab === tab
                  ? "border-foreground/80 text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground/70"
              )}
            >
              {tab === "problem" ? "Problem" : "Code"}
            </button>
          ))}
        </div>
        <div className="flex-1 min-h-0 overflow-hidden p-2">
          <div className={cn("h-full rounded-xl border border-border/50 bg-card/40 overflow-hidden", mobileTab === "problem" ? "block" : "hidden")}>
            <LeftSide />
          </div>
          <div className={cn("h-full rounded-xl border border-border/50 bg-card/40 overflow-hidden", mobileTab === "code" ? "block" : "hidden")}>
            <RightSide />
          </div>
        </div>
      </div>

      {/* Desktop layout */}
      <div className="hidden md:flex flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="flex-1">
          <ResizablePanel
            className="min-w-40 m-2.5 mr-1 rounded-xl border border-border/50 bg-card/40 overflow-hidden"
            defaultSize={33}
          >
            <LeftSide />
          </ResizablePanel>
          <ResizableHandle className="bg-transparent w-1.5"/>
          <ResizablePanel
            className="min-w-40 m-2.5 ml-1 rounded-xl border border-border/50 bg-card/40 overflow-hidden"
          >
            <RightSide />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </>
  )
}
