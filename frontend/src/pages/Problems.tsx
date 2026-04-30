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
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-15%] left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-indigo-500/[0.05] rounded-full blur-[120px]" />
        <div className="absolute top-[5%] left-[20%] w-[400px] h-[300px] bg-violet-500/[0.03] rounded-full blur-[80px]" />
        <div className="absolute top-[8%] right-[18%] w-[350px] h-[250px] bg-indigo-400/[0.03] rounded-full blur-[70px]" />
      </div>

      <Navbar />

      <div className="relative mt-16 sm:mt-24 mb-10 sm:mb-14 text-center px-4 flex flex-col items-center">
        <h1 className="text-[40px] sm:text-[56px] md:text-[64px] font-extrabold tracking-[-0.04em] leading-[1.1] bg-gradient-to-b from-foreground via-foreground/85 to-foreground/30 bg-clip-text text-transparent mb-5">
          Build real systems.<br />Not toy problems.
        </h1>

        <p className="text-muted-foreground/70 text-[15px] max-w-xs mx-auto leading-relaxed">
          A clean, focused environment for practicing software engineering.
        </p>
      </div>

      <div className="relative w-full flex justify-center px-4 pb-16">
        <ProblemList />
      </div>

      <footer className="w-full border-border/40 py-5 px-4 flex items-center justify-center gap-5">
        <span className="text-xs text-muted-foreground/40">© {new Date().getFullYear()} EliteCode</span>
        <Link to="/terms" className="text-xs text-muted-foreground/40 hover:text-muted-foreground transition-colors">Terms</Link>
        <Link to="/privacy" className="text-xs text-muted-foreground/40 hover:text-muted-foreground transition-colors">Privacy</Link>
      </footer>
    </div>
  )
}
