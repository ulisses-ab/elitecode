import { Badge } from "@/components/ui/badge";

export function DifficultyTag({ difficulty }: { difficulty: string }) {
  switch (difficulty.toLowerCase()) {
    case "easy":
      return (
        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 gap-1.5 text-[11px] font-medium px-2 py-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/80 shrink-0" />
          Easy
        </Badge>
      );
    case "medium":
      return (
        <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/20 gap-1.5 text-[11px] font-medium px-2 py-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400/80 shrink-0" />
          Medium
        </Badge>
      );
    case "hard":
      return (
        <Badge variant="outline" className="bg-rose-500/10 text-rose-400 border-rose-500/20 gap-1.5 text-[11px] font-medium px-2 py-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400/80 shrink-0" />
          Hard
        </Badge>
      );
    default:
      return null;
  }
}
