import { useTests } from "@/api/hooks/problems";
import { useWorkspaceStore } from "../../store";

import {
  Accordion,
} from "@/components/ui/accordion";
import { TestItem } from "./TestItem";
import { LoaderCircle } from "lucide-react";
import { EmptyTemplate } from "../EditorContainer/EmptyTemplate";

export function TestsTab() {
  const submissionResults = useWorkspaceStore((state) => state.submissionResults);
  const problem = useWorkspaceStore((state) => state.problem);
  const setupId = useWorkspaceStore((state) => state.setup?.id);
  const { data: tests, isLoading } = useTests(problem?.id!, setupId!);

  if (!setupId) return <EmptyTemplate />;

  if (isLoading) return (
    <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground/40">
      <LoaderCircle size={14} className="animate-spin" aria-hidden="true" />
      <span className="text-xs">Loading test cases…</span>
    </div>
  );
  if (!tests || !tests.testcases.length) return (
    <div className="flex items-center justify-center py-16 text-muted-foreground/40">
      <span className="text-xs">No test cases available</span>
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      <Accordion type="multiple" className="p-4 space-y-2 overflow-y-auto">
        {tests.testcases.map((testcase: any, index: any) => (
          <TestItem testcase={testcase} index={index} results={submissionResults?.testcases?.[index]} />
        ))}
      </Accordion>
    </div>
  );
}
