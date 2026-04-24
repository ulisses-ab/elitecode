import { useUserProfile } from "@/api/hooks/user";
import { Navbar } from "@/components/layout/Navbar/Navbar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { useAuthStore } from "@/features/auth/store";
import { Link } from "react-router-dom";

const STATUS_COLORS: Record<string, string> = {
  ACCEPTED: "text-emerald-400",
  REJECTED: "text-red-400",
  FAILED: "text-orange-400",
  PENDING: "text-yellow-400",
};

const DIFFICULTY_COLORS: Record<string, string> = {
  EASY: "text-emerald-400",
  MEDIUM: "text-amber-400",
  HARD: "text-red-400",
};

function StatCard({ label, value, sub }: { label: string; value: number | string; sub?: string }) {
  return (
    <Card className="border-border/50 bg-card/60 backdrop-blur-sm">
      <CardContent className="pt-5 pb-4 text-center">
        <p className="text-3xl font-bold tabular-nums">{value}</p>
        <p className="text-xs text-muted-foreground mt-1">{label}</p>
        {sub && <p className="text-[11px] text-muted-foreground/50 mt-0.5">{sub}</p>}
      </CardContent>
    </Card>
  );
}

function DifficultyBar({
  label,
  solved,
  total,
  colorClass,
}: {
  label: string;
  solved: number;
  total?: number;
  colorClass: string;
}) {
  const pct = total ? Math.round((solved / total) * 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className={`font-medium ${colorClass}`}>{label}</span>
        <span className="text-muted-foreground tabular-nums">{solved} solved</span>
      </div>
      <Progress value={pct} className="h-1.5" />
    </div>
  );
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function Profile() {
  const user = useAuthStore(s => s.user);
  const { data, isLoading } = useUserProfile();

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          Sign in to view your profile.
        </div>
      </div>
    );
  }

  if (isLoading || !data) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <Spinner />
        </div>
      </div>
    );
  }

  const { stats, recentSubmissions } = data;
  const acceptRate = stats.totalSubmissions > 0
    ? Math.round((stats.acceptedSubmissions / stats.totalSubmissions) * 100)
    : 0;

  const initials = user.handle.slice(0, 2).toUpperCase();
  const memberSince = new Date(user.createdAt).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 py-10 space-y-8">
        {/* Header */}
        <div className="flex items-center gap-5">
          <Avatar className="h-16 w-16 text-lg">
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">{user.handle}</h1>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <p className="text-xs text-muted-foreground/60 mt-0.5">Member since {memberSince}</p>
          </div>
        </div>

        <Separator className="border-border/50" />

        {/* Stats overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Total Solved" value={stats.totalSolved} />
          <StatCard label="Submissions" value={stats.totalSubmissions} />
          <StatCard label="Accepted" value={stats.acceptedSubmissions} />
          <StatCard label="Accept Rate" value={`${acceptRate}%`} />
        </div>

        {/* Difficulty breakdown */}
        <Card className="border-border/50 bg-card/60 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Problems Solved by Difficulty</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-6 mb-2">
              <div className="text-center">
                <p className="text-4xl font-bold tabular-nums">{stats.totalSolved}</p>
                <p className="text-xs text-muted-foreground mt-1">Total</p>
              </div>
              <div className="flex-1 space-y-3">
                <DifficultyBar
                  label="Easy"
                  solved={stats.solvedEasy}
                  colorClass={DIFFICULTY_COLORS.EASY}
                />
                <DifficultyBar
                  label="Medium"
                  solved={stats.solvedMedium}
                  colorClass={DIFFICULTY_COLORS.MEDIUM}
                />
                <DifficultyBar
                  label="Hard"
                  solved={stats.solvedHard}
                  colorClass={DIFFICULTY_COLORS.HARD}
                />
              </div>
            </div>
            <div className="flex gap-4 pt-1">
              {[
                { label: "Easy", value: stats.solvedEasy, color: "bg-emerald-400/20 text-emerald-400" },
                { label: "Medium", value: stats.solvedMedium, color: "bg-amber-400/20 text-amber-400" },
                { label: "Hard", value: stats.solvedHard, color: "bg-red-400/20 text-red-400" },
              ].map(({ label, value, color }) => (
                <div key={label} className={`flex-1 rounded-lg px-3 py-2 text-center ${color}`}>
                  <p className="text-lg font-bold tabular-nums">{value}</p>
                  <p className="text-[11px] opacity-80">{label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent submissions */}
        <Card className="border-border/50 bg-card/60 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Recent Submissions</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {recentSubmissions.length === 0 ? (
              <p className="text-muted-foreground/60 text-sm text-center py-8">No submissions yet.</p>
            ) : (
              <div className="divide-y divide-border/40">
                {recentSubmissions.map((sub) => (
                  <Link
                    key={sub.id}
                    to={`/problems/${sub.problemId}`}
                    className="flex items-center justify-between px-5 py-3 hover:bg-card/80 transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`text-xs font-semibold shrink-0 ${STATUS_COLORS[sub.status] ?? "text-muted-foreground"}`}
                      >
                        {sub.status}
                      </span>
                      <span className="text-xs text-muted-foreground/50 font-mono truncate">
                        {sub.problemId}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground/50 shrink-0 ml-4">
                      {formatDate(sub.submittedAt)}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
