import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { useProblems } from "@/api/hooks/problems";
import type { Problem } from "@/types/Problem";
import { Link } from "react-router-dom";
import { DifficultyTag } from "./DifficultyTag";
import { X } from "lucide-react";
import Fuse from "fuse.js";

export function ProblemList() {
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState<Problem["difficulty"] | "All">("All");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const { data: problems, isLoading } = useProblems();

  const allTags = useMemo(() => {
    if (!problems) return [];
    const set = new Set<string>();
    for (const p of problems) for (const t of p.tags) set.add(t);
    return Array.from(set).sort();
  }, [problems]);

  const fuse = useMemo(() => {
    if (!problems) return null;
    return new Fuse(problems, {
      keys: [
        { name: "title", weight: 0.5 },
        { name: "description", weight: 0.25 },
        { name: "tags", weight: 0.25 },
      ],
      threshold: 0.25,
      ignoreLocation: true,
      minMatchCharLength: 2,
    });
  }, [problems]);

  const filteredProblems = useMemo(() => {
    if (!problems) return [];

    const matchesDifficulty = (p: Problem) =>
      difficulty === "All" || p.difficulty.toLowerCase() === difficulty.toLowerCase();
    const matchesTag = (p: Problem) =>
      !activeTag || p.tags.includes(activeTag);

    if (!search.trim() || !fuse) {
      return problems.filter(matchesDifficulty).filter(matchesTag);
    }

    return fuse
      .search(search)
      .map((r) => r.item)
      .filter(matchesDifficulty)
      .filter(matchesTag);
  }, [search, difficulty, activeTag, fuse, problems]);

  return (
    <div className="space-y-4 w-full max-w-3xl">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2 items-center">
        <Input
          placeholder="Search problems..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-card/50 border-border/60 focus-visible:border-border placeholder:text-muted-foreground/50"
        />
        <div className="flex items-center gap-0.5 bg-card/50 border border-border/60 rounded-lg p-1 shrink-0 overflow-x-auto">
          {(["All", "Easy", "Medium", "Hard", "Expert"] as const).map((d) => (
            <button
              key={d}
              onClick={() => setDifficulty(d)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                difficulty === d
                  ? "bg-white/[0.08] text-foreground"
                  : "text-muted-foreground hover:text-foreground/70"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Tag chips */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(activeTag === tag ? null : tag)}
              className={`px-2 py-0.5 rounded text-[11px] border transition-colors ${
                activeTag === tag
                  ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/40"
                  : "bg-white/[0.04] text-muted-foreground border-border/40 hover:bg-white/[0.07] hover:text-foreground/70"
              }`}
            >
              {tag}
            </button>
          ))}
          {activeTag && (
            <button
              onClick={() => setActiveTag(null)}
              className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] border border-border/30 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
            >
              <X size={10} />
              Clear
            </button>
          )}
        </div>
      )}

      {/* List */}
      <div className="rounded-xl border border-border/50 overflow-hidden">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              className={`flex items-center gap-4 px-5 py-3.5 bg-card/40 ${idx !== 5 ? "border-b border-border/40" : ""}`}
            >
              <div className="w-6 shrink-0 flex justify-end">
                <div className="h-3 w-3 rounded bg-white/[0.06] animate-pulse" />
              </div>
              <div className="flex-1 h-3.5 rounded bg-white/[0.06] animate-pulse" style={{ maxWidth: `${40 + (idx * 13) % 40}%` }} />
              <div className="hidden sm:flex items-center gap-1.5 shrink-0">
                <div className="h-3 w-10 rounded bg-white/[0.04] animate-pulse" />
              </div>
              <div className="h-5 w-14 rounded-full bg-white/[0.05] animate-pulse shrink-0" />
            </div>
          ))
        ) : filteredProblems.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground/50">
            No problems found.
          </p>
        ) : (
          filteredProblems.map((problem, idx) => (
            <Link
              to={`/problems/${problem.slug}`}
              key={problem.id}
              className={`group flex items-center gap-4 px-5 py-3.5 bg-card/40 hover:bg-card/70 transition-colors ${
                idx !== filteredProblems.length - 1 ? "border-b border-border/40" : ""
              }`}
            >
              <span className="text-[11px] font-mono text-muted-foreground/30 w-6 shrink-0 text-right">
                {idx + 1}
              </span>

              <span className="flex-1 text-sm font-medium text-foreground/80 group-hover:text-foreground transition-colors truncate">
                {problem.title}
              </span>

              <div className="hidden sm:flex items-center gap-1.5 shrink-0">
                {problem.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-1.5 py-0.5 rounded text-[10px] border bg-white/[0.03] text-muted-foreground/50 border-border/25"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="shrink-0">
                <DifficultyTag difficulty={problem.difficulty} />
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
