import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useProblems } from "@/api/hooks/problems";
import type { Problem } from "@/types/Problem";
import { Link } from "react-router-dom";
import { DifficultyTag } from "./DifficultyTag";
import Fuse from "fuse.js";

export function ProblemList() {
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState<Problem["difficulty"] | "All">("All");
  const { data: problems } = useProblems();

  const fuse = useMemo(() => {
    if (!problems) return null;

    return new Fuse(problems, {
      keys: [
        { name: "title", weight: 0.5 },
        { name: "description", weight: 0.3 },
        { name: "statement", weight: 0.2 },
      ],
      threshold: 0.25, // lower = stricter
      ignoreLocation: true,
      minMatchCharLength: 2,
    });
  }, [problems]);

  const filteredProblems = useMemo(() => {
    if (!problems) return [];

    const matchesDifficulty = (p: Problem) =>
      difficulty === "All" || p.difficulty === difficulty;

    if (!search.trim() || !fuse) {
      return problems.filter(matchesDifficulty);
    }

    return fuse
      .search(search)
      .map((r) => r.item)
      .filter(matchesDifficulty);
  }, [search, difficulty, fuse, problems]);

  return (
    <div className="space-y-5 w-full max-w-5xl">
      <div className="flex flex-col sm:flex-row gap-2 items-center">
        <Input
          placeholder="Search problems..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-card/50 border-border/60 focus-visible:border-border placeholder:text-muted-foreground/50"
        />
        <div className="flex items-center gap-2">
          <Label htmlFor="difficulty" className="text-muted-foreground text-sm shrink-0">Difficulty</Label>
          <Select value={difficulty} onValueChange={(value) => setDifficulty(value as Problem["difficulty"] | "All")}>
            <SelectTrigger id="difficulty" className="w-32 bg-card/50 border-border/60">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All</SelectItem>
              <SelectItem value="Easy">Easy</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Hard">Hard</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {problems && (
          <span className="text-xs text-muted-foreground/60 shrink-0 tabular-nums">
            {filteredProblems.length} / {problems.length}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredProblems.map((problem, idx) => (
          <Link to={`/problems/${problem.id}`} key={problem.id}>
            <Card className="group cursor-pointer h-full border-border/50 bg-card/60 backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20 hover:border-border">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-sm font-semibold leading-snug group-hover:text-foreground transition-colors">
                    {problem.title}
                  </CardTitle>
                  <span className="text-[11px] font-mono text-muted-foreground/40 shrink-0 pt-0.5">
                    #{String(idx + 1).padStart(2, '0')}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription className="line-clamp-2 mb-3 text-xs leading-relaxed">
                  {problem.description || problem.statement}
                </CardDescription>
                <DifficultyTag difficulty={problem.difficulty} />
              </CardContent>
            </Card>
          </Link>
        ))}
        {filteredProblems.length === 0 && (
          <p className="text-muted-foreground/60 text-sm col-span-3 py-8 text-center">
            No problems found.
          </p>
        )}
      </div>
    </div>
  );
}
