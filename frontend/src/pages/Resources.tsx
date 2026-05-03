import { Navbar } from "@/components/layout/Navbar/Navbar";
import { useAllResources } from "@/api/hooks/resources";
import { useNavbarStore } from "@/stores/useNavbarStore";
import { useEffect, useState } from "react";
import { useSEO } from "@/hooks/useSEO";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import type { Resource } from "@/types/Resource";
import { ResourceViewer } from "@/components/ResourceViewer";

function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 px-5 py-4 border-b border-border/40 last:border-b-0 bg-card/40">
      <div className="w-5 shrink-0 flex justify-end">
        <div className="h-3 w-3 rounded bg-white/[0.06] animate-pulse" />
      </div>
      <div className="h-3.5 rounded bg-white/[0.06] animate-pulse" style={{ width: `${30 + Math.random() * 40}%` }} />
    </div>
  );
}

export function Resources() {
  const { data: resources, isLoading } = useAllResources();
  const setNavbarCenter = useNavbarStore((state) => state.setNavbarCenter);
  const [selected, setSelected] = useState<Resource | null>(null);

  useSEO({
    title: "Resources — EliteCode",
    description: "Learning materials and references to help you solve EliteCode problems.",
    canonicalPath: "/resources",
  });

  useEffect(() => {
    setNavbarCenter(<></>);
  }, []);

  const sorted = resources ? [...resources].sort((a, b) => a.order - b.order) : [];

  return (
    <div className="min-h-screen flex flex-col items-center bg-background">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-15%] left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-indigo-500/[0.05] rounded-full blur-[120px]" />
        <div className="absolute top-[5%] left-[20%] w-[350px] h-[250px] bg-violet-500/[0.03] rounded-full blur-[80px]" />
        <div className="absolute top-[8%] right-[18%] w-[300px] h-[200px] bg-indigo-400/[0.03] rounded-full blur-[70px]" />
      </div>

      <Navbar />

      <div className="relative mt-16 sm:mt-24 mb-10 sm:mb-14 text-center px-4 flex flex-col items-center">
        <h1 className="text-[36px] sm:text-[52px] font-extrabold tracking-[-0.04em] leading-[1.1] bg-gradient-to-b from-foreground via-foreground/85 to-foreground/30 bg-clip-text text-transparent mb-4">
          Resources
        </h1>
        <p className="text-muted-foreground/70 text-[15px] max-w-xs mx-auto leading-relaxed">
          Reference material and guides to help you think through the problems.
        </p>
      </div>

      <div className="relative w-full flex justify-center px-4 pb-16">
        <div className="w-full max-w-3xl">
          <div className="rounded-xl border border-border/50 overflow-hidden">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
            ) : sorted.length === 0 ? (
              <p className="py-12 text-center text-sm text-muted-foreground/50">
                No resources yet.
              </p>
            ) : (
              sorted.map((resource, idx) => (
                <button
                  key={resource.id}
                  onClick={() => setSelected(resource)}
                  className="group w-full flex items-center gap-3 px-5 py-4 border-b border-border/40 last:border-b-0 bg-card/40 hover:bg-card/70 transition-colors text-left"
                >
                  <span className="text-[11px] font-mono text-muted-foreground/30 w-5 shrink-0 text-right tabular-nums">
                    {idx + 1}
                  </span>
                  <span className="flex-1 text-sm font-medium text-foreground/80 group-hover:text-foreground transition-colors truncate">
                    {resource.title}
                  </span>
                  <ChevronRight size={13} className="shrink-0 text-muted-foreground/30 group-hover:text-muted-foreground/60 transition-colors" />
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      <footer className="w-full border-border/40 py-5 px-4 flex items-center justify-center gap-5">
        <span className="text-xs text-muted-foreground/40">© {new Date().getFullYear()} EliteCode</span>
        <Link to="/terms" className="text-xs text-muted-foreground/40 hover:text-muted-foreground transition-colors">Terms</Link>
        <Link to="/privacy" className="text-xs text-muted-foreground/40 hover:text-muted-foreground transition-colors">Privacy</Link>
      </footer>

      <ResourceViewer
        resource={selected}
        open={!!selected}
        onOpenChange={(open) => { if (!open) setSelected(null); }}
      />
    </div>
  );
}
