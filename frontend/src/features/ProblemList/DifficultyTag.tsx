import { Badge } from "@/components/ui/badge";

export function DifficultyTag({ difficulty }: { difficulty: string }) {
  switch (difficulty.toLowerCase()) {
    case "easy":
      return (
        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[11px] font-medium px-2 py-0.5">
          Easy
        </Badge>
      );
    case "medium":
      return (
        <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-[11px] font-medium px-2 py-0.5">
          Medium
        </Badge>
      );
    case "hard":
      return (
        <Badge variant="outline" className="bg-rose-500/10 text-rose-400 border-rose-500/20 text-[11px] font-medium px-2 py-0.5">
          Hard
        </Badge>
      );
    case "expert":
      return (
        <Badge variant="outline" className="bg-violet-500/10 text-violet-400 border-violet-500/20 text-[11px] font-medium px-2 py-0.5">
          Expert
        </Badge>
      );
    default:
      return null;
  }
}
