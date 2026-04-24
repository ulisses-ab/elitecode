import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { useProblem } from "@/api/hooks/problems"
import { LeftSide } from "./LeftSide";
import { RightSide } from "./RightSide";
import { useNavbarStore } from "@/stores/useNavbarStore";
import { useEffect } from "react";
import { NavbarMenu } from "./components/NavbarMenu/NavbarMenu";
import { useWorkspaceStore } from "./store";

export function Workspace({ problemId }: { problemId: string }) {
  const { data: problem } = useProblem(problemId);
  const initialize = useWorkspaceStore((state) => state.initialize);
  const setNavbarCenter = useNavbarStore((state) => state.setNavbarCenter);

  useEffect(() => {
    initialize(problem ?? null);
  }, [problem])


  useEffect(() => {
    setNavbarCenter(
      <NavbarMenu />
    )
  }, [])

  return (
    <ResizablePanelGroup
      direction="horizontal"
      className="flex-1"
    >
      <ResizablePanel
        className="min-w-40 m-2.5 mr-1 rounded-xl border border-border/50 bg-card/40 overflow-hidden"
        defaultSize={33}
      >
        <LeftSide />
      </ResizablePanel>
      <ResizableHandle className="bg-transparent w-2"/>
      <ResizablePanel
        className="min-w-40 m-2.5 ml-1 rounded-xl border border-border/50 bg-card/40 overflow-hidden"
      >
        <RightSide />
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}