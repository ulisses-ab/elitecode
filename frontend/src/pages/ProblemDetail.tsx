import { useParams } from "react-router-dom"
import { Navbar } from "@/components/layout/Navbar/Navbar";
import { Workspace } from "@/features/Workspace/Workspace";

export function ProblemDetail() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="h-screen flex flex-col bg-background">
      <Navbar />
      <Workspace problemId={id!} />
    </div>
  )
}