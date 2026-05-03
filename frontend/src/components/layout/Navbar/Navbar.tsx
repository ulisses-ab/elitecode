import { Button } from "@/components/ui/button";
import { UserMenu } from "./UserMenu";
import { ReportBugButton } from "./ReportBugButton";
import { FeedbackButton } from "./FeedbackButton";
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { useNavbarStore } from "@/stores/useNavbarStore";
import { Link } from "react-router-dom";

interface NavbarProps extends HTMLAttributes<HTMLElement> {
  title?: string;
}

export function Navbar({ title = "EliteCode", className, ...props }: NavbarProps) {
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
            <span className="text-xs font-bold font-mono text-foreground/70">{"{}"}</span>
          </div>
          <span className="font-semibold text-[15px] tracking-tight text-foreground/90">{title}</span>
        </Link>
        <Link to="/problems" className="hidden sm:block">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground font-normal text-sm">
            Challenges
          </Button>
        </Link>
        {/*<Link to="/resources" className="hidden sm:block">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground font-normal text-sm">
            Resources
          </Button>
        </Link>*/}
      </div>

      <div className="flex flex-1 justify-center">
        {navbarCenter}
      </div>

      <div className="flex-1 flex justify-end items-center gap-1.5">
        <div className="hidden sm:flex items-center gap-1.5">
          {import.meta.env.VITE_GITHUB_URL && (
            <a
              href={import.meta.env.VITE_GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center h-8 w-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" fill="currentColor"/>
              </svg>
            </a>
          )}
          {import.meta.env.VITE_DISCORD_URL && (
            <a
              href={import.meta.env.VITE_DISCORD_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center h-8 w-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <svg viewBox="0 -28.5 256 256" className="h-[18px] w-[18px]" xmlns="http://www.w3.org/2000/svg">
                <path d="M216.856339,16.5966031 C200.285002,8.84328665 182.566144,3.2084988 164.041564,0 C161.766523,4.11318106 159.108624,9.64549908 157.276099,14.0464379 C137.583995,11.0849896 118.072967,11.0849896 98.7430163,14.0464379 C96.9108417,9.64549908 94.1925838,4.11318106 91.8971895,0 C73.3526068,3.2084988 55.6133949,8.86399117 39.0420583,16.6376612 C5.61752293,67.146514 -3.4433191,116.400813 1.08711069,164.955721 C23.2560196,181.510915 44.7403634,191.567697 65.8621325,198.148576 C71.0772151,190.971126 75.7283628,183.341335 79.7352139,175.300261 C72.104019,172.400575 64.7949724,168.822202 57.8887866,164.667963 C59.7209612,163.310589 61.5131304,161.891452 63.2445898,160.431257 C105.36741,180.133187 151.134928,180.133187 192.754523,160.431257 C194.506336,161.891452 196.298154,163.310589 198.110326,164.667963 C191.183787,168.842556 183.854737,172.420929 176.223542,175.320965 C180.230393,183.341335 184.861538,190.991831 190.096624,198.16893 C211.238746,191.588051 232.743023,181.531619 254.911949,164.955721 C260.227747,108.668201 245.831087,59.8662432 216.856339,16.5966031 Z M85.4738752,135.09489 C72.8290281,135.09489 62.4592217,123.290155 62.4592217,108.914901 C62.4592217,94.5396472 72.607595,82.7145587 85.4738752,82.7145587 C98.3405064,82.7145587 108.709962,94.5189427 108.488529,108.914901 C108.508531,123.290155 98.3405064,135.09489 85.4738752,135.09489 Z M170.525237,135.09489 C157.88039,135.09489 147.510584,123.290155 147.510584,108.914901 C147.510584,94.5396472 157.658606,82.7145587 170.525237,82.7145587 C183.391518,82.7145587 193.761324,94.5189427 193.539891,108.914901 C193.539891,123.290155 183.391518,135.09489 170.525237,135.09489 Z" fill="currentColor"/>
              </svg>
            </a>
          )}
          <ReportBugButton />
          {/*<FeedbackButton />*/}
          <div className="w-0.5" />
        </div>
        <UserMenu />
      </div>
    </nav>
  );
}
