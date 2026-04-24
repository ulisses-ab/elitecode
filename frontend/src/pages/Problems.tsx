import { Navbar } from "@/components/layout/Navbar/Navbar"
import { ProblemList } from "@/features/ProblemList/ProblemList"
import { useNavbarStore } from "@/stores/useNavbarStore"
import { useEffect } from "react";

export function Problems() {
  const setNavbarCenter = useNavbarStore((state) => state.setNavbarCenter);

  useEffect(() => {
    setNavbarCenter(<></>);
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center bg-background">
      {/* Subtle radial glow behind hero */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-indigo-500/[0.04] rounded-full blur-3xl" />
      </div>

      <Navbar />

      <div className="relative mt-24 mb-16 text-center space-y-4 px-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border/50 bg-card/50 text-xs text-muted-foreground mb-4 backdrop-blur-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Practice · Learn · Improve
        </div>
        <h1 className="text-6xl font-bold tracking-tight bg-gradient-to-b from-foreground via-foreground/90 to-foreground/40 bg-clip-text text-transparent leading-tight">
          Solve coding<br />problems
        </h1>
        <p className="text-muted-foreground text-base max-w-sm mx-auto leading-relaxed">
          A clean, focused environment for practicing algorithms and data structures.
        </p>
      </div>

      <div className="relative w-full flex justify-center px-4 pb-16">
        <ProblemList />
      </div>
    </div>
  )
}
