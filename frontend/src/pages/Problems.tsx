import { SiC, SiCplusplus, SiRust, SiPython } from "react-icons/si";
import { Navbar } from "@/components/layout/Navbar/Navbar"
import { ProblemList } from "@/features/ProblemList/ProblemList"
import { useNavbarStore } from "@/stores/useNavbarStore"
import { useEffect } from "react";
import { useSEO } from "@/hooks/useSEO";
import { Link } from "react-router-dom";
import { useAuthStore } from "@/features/auth/store";
import { useUserProfile } from "@/api/hooks/user";
import { useProblems } from "@/api/hooks/problems";
import type { Problem } from "@/types/Problem";
import type { UserProfile } from "@/api/functions/user";

const LANGUAGES = [
  { icon: SiC,        label: "C"      },
  { icon: SiCplusplus, label: "C++"   },
  { icon: SiRust,     label: "Rust"   },
  { icon: SiPython,   label: "Python" },
] as const;

const DIFFS = [
  { key: "easy",   label: "Easy",   labelClass: "text-emerald-400/70", barClass: "bg-emerald-500/50" },
  { key: "medium", label: "Medium", labelClass: "text-amber-400/70",   barClass: "bg-amber-500/50"   },
  { key: "hard",   label: "Hard",   labelClass: "text-rose-400/70",    barClass: "bg-rose-500/50"    },
  { key: "expert", label: "Expert", labelClass: "text-violet-400/70",  barClass: "bg-violet-500/50"  },
] as const;

function SolvedStats({ profile, problems }: { profile: UserProfile | null; problems: Problem[] }) {
  const totalByDiff: Record<string, number> = {};
  for (const p of problems) {
    const d = p.difficulty.toLowerCase();
    totalByDiff[d] = (totalByDiff[d] || 0) + 1;
  }

  const solvedByDiff: Record<string, number> = {
    easy:   profile?.stats.solvedEasy   ?? 0,
    medium: profile?.stats.solvedMedium ?? 0,
    hard:   profile?.stats.solvedHard   ?? 0,
    expert: profile?.stats.solvedExpert ?? 0,
  };

  const totalSolved = profile?.stats.totalSolved ?? 0;
  const activeDiffs = DIFFS.filter(d => (totalByDiff[d.key] ?? 0) > 0);

  return (
    <div className="w-55 shrink-0 rounded-xl border border-white/[0.0] overflow-hidden ">
      {/* Total */}
      <div className="px-4 pt-4 pb-3.5">
        <p className="text-[10px] uppercase tracking-widest font-medium text-muted-foreground/90 mb-2">Solved</p>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold font-mono tabular-nums leading-none">{totalSolved}</span>
          <span className="text-sm font-mono text-muted-foreground/70">/ {problems.length}</span>
        </div>
      </div>

      {/* Per difficulty */}
      <div className="px-4 py-3.5 flex flex-col gap-3">
        {activeDiffs.map(({ key, label, labelClass, barClass }) => {
          const total = totalByDiff[key] ?? 0;
          const solved = solvedByDiff[key] ?? 0;
          const pct = total > 0 ? (solved / total) * 100 : 0;
          return (
            <div key={key}>
              <div className="flex items-center justify-between mb-1.5">
                <span className={`text-[10px] font-medium ${labelClass}`}>{label}</span>
                <span className="text-[10px] font-mono tabular-nums text-muted-foreground/35">
                  {solved}<span className="text-muted-foreground/20">/{total}</span>
                </span>
              </div>
              <div className="h-1 w-full rounded-full bg-white/[0.06]">
                <div className={`h-full rounded-full ${barClass}`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function UserStats() {
  const user = useAuthStore((state) => state.user);
  const { data: profile } = useUserProfile();
  const { data: problems } = useProblems();
  if (!problems) return null;
  return <SolvedStats profile={user ? (profile ?? null) : null} problems={problems} />;
}

export function Problems() {
  const setNavbarCenter = useNavbarStore((state) => state.setNavbarCenter);
  const user = useAuthStore((state) => state.user);

  useSEO({
    title: "Problems — EliteCode",
    description: "Browse and solve real-world software engineering problems. Implement rate limiters, caches, URL routers, and other systems challenges in C.",
    canonicalPath: "/problems",
  });

  useEffect(() => {
    setNavbarCenter(<></>);
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center bg-background">
      <Navbar />

      <div className="relative w-full max-w-3xl mx-auto px-4 pt-20 pb-16 flex flex-col gap-10">
        {/* Hero */}
        <div className="flex items-start gap-8">
          <div className="flex-1 space-y-5">
            <h1 className="text-[46px] sm:text-[54px] font-bold tracking-[-0.025em] leading-[1.08]">
              Challenges
            </h1>

            <p className="text-[16px] text-muted-foreground/70 leading-relaxed max-w-sm">
              A clean, focused environment for practicing software engineering.
            </p>

            <div className="flex items-center gap-10 pt-4">
              {LANGUAGES.map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-1.5">
                  <Icon size={44} className="text-muted-foreground/90" />
                  <span className="text-[15px] font-mono text-muted-foreground/90">{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="hidden sm:block pt-1">
            <UserStats />
          </div>
        </div>

        <div className="border-t border-border/40" />

        <ProblemList />
      </div>

      <footer className="relative w-full py-5 px-4 flex items-center justify-center gap-5">
        <span className="text-xs text-muted-foreground/35">© {new Date().getFullYear()} EliteCode</span>
        <Link to="/terms" className="text-xs text-muted-foreground/35 hover:text-muted-foreground transition-colors">Terms</Link>
        <Link to="/privacy" className="text-xs text-muted-foreground/35 hover:text-muted-foreground transition-colors">Privacy</Link>
      </footer>
    </div>
  )
}
