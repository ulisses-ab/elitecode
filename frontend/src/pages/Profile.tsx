import { useUpdateUsername, useUserProfile } from "@/api/hooks/user";
import { useProblems } from "@/api/hooks/problems";
import { Navbar } from "@/components/layout/Navbar/Navbar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Spinner } from "@/components/ui/spinner";
import { useAuthStore } from "@/features/auth/store";
import { cn } from "@/lib/utils";
import { Check, Pencil, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useNavbarStore } from "@/stores/useNavbarStore";

const STATUS_CONFIG: Record<string, { label: string; dot: string; text: string }> = {
  ACCEPTED: { label: "Accepted",     dot: "bg-emerald-400", text: "text-emerald-400" },
  REJECTED: { label: "Wrong Answer", dot: "bg-rose-400",    text: "text-rose-400"    },
  FAILED:   { label: "Error",        dot: "bg-amber-400",   text: "text-amber-400"   },
  PENDING:  { label: "Pending",      dot: "bg-blue-400",    text: "text-blue-400"    },
};

function DifficultyBar({
  label, solved, total, colorClass, barColor,
}: {
  label: string; solved: number; total: number; colorClass: string; barColor: string;
}) {
  const pct = total > 0 ? Math.min(100, Math.round((solved / total) * 100)) : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className={cn("text-xs font-medium", colorClass)}>{label}</span>
        <span className="text-xs tabular-nums text-muted-foreground/60">
          {solved}<span className="text-muted-foreground/30"> / {total || "—"}</span>
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-white/[0.06] overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-500", barColor)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: "short", day: "numeric", year: "numeric",
  });
}

export function Profile() {
  const setNavbarCenter = useNavbarStore(s => s.setNavbarCenter);
  useEffect(() => { setNavbarCenter(null); }, []);

  const user    = useAuthStore(s => s.user);
  const setUser = useAuthStore(s => s.setUser);
  const { data, isLoading }  = useUserProfile();
  const { data: problems }   = useProblems();
  const updateUsername       = useUpdateUsername();

  const [editing, setEditing]         = useState(false);
  const [handleInput, setHandleInput] = useState("");
  const [handleError, setHandleError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function startEditing() {
    setHandleInput(user?.handle ?? "");
    setHandleError(null);
    setEditing(true);
    setTimeout(() => inputRef.current?.select(), 0);
  }
  function cancelEditing() { setEditing(false); setHandleError(null); }

  async function submitUsername() {
    const handle = handleInput.trim();
    if (!/^[a-z0-9_]{3,20}$/.test(handle)) {
      setHandleError("3–20 chars: lowercase letters, numbers, underscores only.");
      return;
    }
    try {
      const result = await updateUsername.mutateAsync(handle);
      if (user) setUser({ ...user, handle: result.user.handle });
      setEditing(false);
      setHandleError(null);
    } catch (err: any) {
      setHandleError(err?.response?.data?.message ?? "Failed to update username.");
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-64 text-sm text-muted-foreground/60">
          Sign in to view your profile.
        </div>
      </div>
    );
  }

  if (isLoading || !data) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-64"><Spinner /></div>
      </div>
    );
  }

  const { stats, recentSubmissions } = data;
  const acceptRate = stats.totalSubmissions > 0
    ? Math.round((stats.acceptedSubmissions / stats.totalSubmissions) * 100)
    : 0;

  const totalEasy   = problems?.filter(p => p.difficulty.toLowerCase() === "easy").length   ?? 0;
  const totalMedium = problems?.filter(p => p.difficulty.toLowerCase() === "medium").length ?? 0;
  const totalHard   = problems?.filter(p => p.difficulty.toLowerCase() === "hard").length   ?? 0;
  const totalExpert = problems?.filter(p => p.difficulty.toLowerCase() === "expert").length ?? 0;
  const totalAll    = totalEasy + totalMedium + totalHard + totalExpert;

  const initials    = user.handle.slice(0, 2).toUpperCase();
  const memberSince = new Date(user.createdAt).toLocaleDateString(undefined, { month: "long", year: "numeric" });

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-15%] left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-indigo-500/[0.05] rounded-full blur-[120px]" />
        <div className="absolute top-[5%] left-[15%] w-[350px] h-[250px] bg-violet-500/[0.03] rounded-full blur-[80px]" />
        <div className="absolute top-[8%] right-[15%] w-[300px] h-[200px] bg-indigo-400/[0.03] rounded-full blur-[70px]" />
      </div>

      <Navbar />

      <main className="relative max-w-3xl mx-auto px-4 py-12 space-y-4">

        {/* ── Header card ── */}
        <div className="rounded-xl border border-border/50 bg-card/40 backdrop-blur-sm p-6">
          <div className="flex items-start gap-5">
            <Avatar className="h-20 w-20 shrink-0">
              <AvatarFallback className="bg-indigo-500/20 text-indigo-300 font-semibold text-2xl">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0 pt-1">
              {editing ? (
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <input
                      ref={inputRef}
                      value={handleInput}
                      onChange={e => { setHandleInput(e.target.value); setHandleError(null); }}
                      onKeyDown={e => { if (e.key === "Enter") submitUsername(); if (e.key === "Escape") cancelEditing(); }}
                      className="text-xl font-bold bg-transparent border-b border-border/70 focus:border-foreground/60 outline-none w-48 pb-0.5 transition-colors"
                      maxLength={20}
                      autoComplete="off"
                      spellCheck={false}
                    />
                    <button onClick={submitUsername} disabled={updateUsername.isPending} className="p-1 rounded hover:bg-white/10 text-emerald-400 disabled:opacity-40 transition-colors">
                      <Check size={14} />
                    </button>
                    <button onClick={cancelEditing} className="p-1 rounded hover:bg-white/10 text-muted-foreground transition-colors">
                      <X size={14} />
                    </button>
                  </div>
                  {handleError && <p className="text-xs text-rose-400">{handleError}</p>}
                </div>
              ) : (
                <div className="flex items-center gap-2 group">
                  <h1 className="text-2xl font-bold tracking-tight">{user.handle}</h1>
                  <button onClick={startEditing} className="p-1 rounded opacity-40 hover:opacity-100 hover:bg-white/10 text-muted-foreground transition-all" title="Edit username">
                    <Pencil size={13} />
                  </button>
                </div>
              )}
              <p className="text-sm text-muted-foreground/70 mt-0.5">{user.email}</p>
              <p className="text-xs text-muted-foreground/40 mt-1">Member since {memberSince}</p>
            </div>

            {/* Inline key stats */}
            <div className="hidden sm:flex items-center gap-6 shrink-0 pt-1">
              {[
                { value: stats.totalSolved,      label: "Solved"      },
                { value: stats.totalSubmissions,  label: "Submissions" },
                { value: `${acceptRate}%`,        label: "Accept Rate" },
              ].map(({ value, label }, i, arr) => (
                <div key={label} className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold tabular-nums">{value}</p>
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground/40 mt-1">{label}</p>
                  </div>
                  {i < arr.length - 1 && <div className="w-px h-8 bg-border/50" />}
                </div>
              ))}
            </div>
          </div>

          {/* Mobile stats */}
          <div className="flex sm:hidden items-center gap-0 mt-5 pt-5 border-t border-border/40 divide-x divide-border/40">
            {[
              { value: stats.totalSolved,     label: "Solved"      },
              { value: stats.totalSubmissions, label: "Submissions" },
              { value: `${acceptRate}%`,       label: "Accept Rate" },
            ].map(({ value, label }) => (
              <div key={label} className="flex-1 text-center">
                <p className="text-2xl font-bold tabular-nums">{value}</p>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground/40 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Difficulty breakdown ── */}
        <div className="rounded-xl border border-border/50 bg-card/40 backdrop-blur-sm p-6">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground/40 font-medium mb-5">Problems Solved</p>
          <div className="flex items-center gap-8">
            <div className="shrink-0 text-center w-16">
              <p className="text-5xl font-bold tabular-nums leading-none">{stats.totalSolved}</p>
              <p className="text-xs text-muted-foreground/40 mt-2 tabular-nums">/ {totalAll || "—"}</p>
            </div>
            <div className="flex-1 space-y-3.5">
              <DifficultyBar label="Easy"   solved={stats.solvedEasy}   total={totalEasy}   colorClass="text-emerald-400" barColor="bg-emerald-400" />
              <DifficultyBar label="Medium" solved={stats.solvedMedium} total={totalMedium} colorClass="text-amber-400"   barColor="bg-amber-400"   />
              <DifficultyBar label="Hard"   solved={stats.solvedHard}   total={totalHard}   colorClass="text-rose-400"    barColor="bg-rose-400"    />
              <DifficultyBar label="Expert" solved={stats.solvedExpert} total={totalExpert} colorClass="text-violet-400"  barColor="bg-violet-400"  />
            </div>
          </div>
        </div>

        {/* ── Recent submissions ── */}
        <div className="rounded-xl border border-border/50 bg-card/40 backdrop-blur-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-border/40">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground/40 font-medium">Recent Submissions</p>
          </div>

          {recentSubmissions.length === 0 ? (
            <p className="text-sm text-muted-foreground/40 text-center py-10">No submissions yet.</p>
          ) : (
            <div className="divide-y divide-border/30">
              {recentSubmissions.map((sub) => {
                const s = STATUS_CONFIG[sub.status];
                return (
                  <Link
                    key={sub.id}
                    to={`/problems/${sub.problemSlug}`}
                    className="flex items-center gap-3 px-5 py-3.5 hover:bg-white/[0.02] transition-colors group"
                  >
                    <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", s?.dot ?? "bg-muted-foreground/30")} />
                    <span className={cn("text-xs font-medium w-[6.5rem] shrink-0", s?.text ?? "text-muted-foreground")}>
                      {s?.label ?? sub.status}
                    </span>
                    <span className="flex-1 text-sm text-foreground/75 truncate group-hover:text-foreground/95 transition-colors">
                      {sub.problemTitle}
                    </span>
                    <span className="w-16 shrink-0">
                      <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-white/[0.04] text-muted-foreground/50 border border-border/25">
                        {sub.language}
                      </span>
                    </span>
                    <span className="text-xs text-muted-foreground/35 shrink-0 tabular-nums w-24 text-right">
                      {formatDate(sub.submittedAt)}
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
