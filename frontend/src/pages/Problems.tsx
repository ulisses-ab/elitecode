import { Navbar } from "@/components/layout/Navbar/Navbar"
import { ProblemList } from "@/features/ProblemList/ProblemList"
import { useNavbarStore } from "@/stores/useNavbarStore"
import { useEffect } from "react";
import { useSEO } from "@/hooks/useSEO";
import { Link } from "react-router-dom";

export function Problems() {
  const setNavbarCenter = useNavbarStore((state) => state.setNavbarCenter);

  useSEO({
    title: "Problems — EliteCode",
    description: "Browse and solve real-world software engineering problems. Implement rate limiters, caches, URL routers, and other systems challenges in C++.",
    canonicalPath: "/problems",
  });

  useEffect(() => {
    setNavbarCenter(<></>);
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center bg-background">
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, oklch(1 0 0 / 0.045) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      <Navbar />

      <div className="relative w-full max-w-3xl mx-auto px-4 pt-20 pb-16 flex flex-col gap-10">
        <div className="space-y-4">
          <h1 className="text-[46px] sm:text-[54px] font-bold tracking-[-0.025em] leading-[1.08]">
            <span className="text-foreground">Build real systems.</span>
            <br />
            <span className="text-foreground/80">Not toy problems.</span>
          </h1>
          <p className="text-[16px] text-muted-foreground/50 leading-relaxed max-w-sm">
            A clean, focused environment for practicing software engineering.
          </p>
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
