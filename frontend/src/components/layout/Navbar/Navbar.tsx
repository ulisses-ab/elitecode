import { Button } from "@/components/ui/button";
import { UserMenu } from "./UserMenu";
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { useNavbarStore } from "@/stores/useNavbarStore";
import { Link } from "react-router-dom";

interface NavbarProps extends HTMLAttributes<HTMLElement> {
  title?: string;
}

export function Navbar({ title = "LeetClone", className, ...props }: NavbarProps) {
  const navbarCenter = useNavbarStore((state) => state.navbarCenter);

  return (
    <nav
      {...props}
      className={cn(
        "w-full px-4 py-2 h-13 flex items-center justify-between",
        "sticky top-0 z-50 border-b border-border/60 bg-background/75 backdrop-blur-md",
        className
      )}
    >
      <div className="flex flex-1 items-center space-x-1">
        <Link to="/" className="flex items-center gap-2 mr-1 group">
          <div className="flex items-center justify-center w-7 h-7 rounded-md bg-foreground/5 border border-border/50 group-hover:border-border transition-colors">
            <span className="text-xs font-bold font-mono text-foreground/70">{"<>"}</span>
          </div>
          <span className="font-semibold text-[15px] tracking-tight text-foreground/90">{title}</span>
        </Link>
        <Link to="/problems">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground font-normal text-sm">
            Problems
          </Button>
        </Link>
      </div>

      <div className="flex flex-1 justify-center">
        {navbarCenter}
      </div>

      <div className="flex-1 flex justify-end">
        <UserMenu />
      </div>
    </nav>
  );
}
