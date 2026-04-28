import { useState } from "react";
import { Bug, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/api/api";

export function ReportBugButton() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setError(null);

    try {
      await api.post("/feedback", { title: title.trim(), description: description.trim() });
      setSent(true);
      setTimeout(() => {
        setOpen(false);
        setSent(false);
        setTitle("");
        setDescription("");
      }, 2000);
    } catch {
      setError("Failed to send report. Please try again.");
    } finally {
      setSending(false);
    }
  }

  function handleOpenChange(value: boolean) {
    setOpen(value);
    if (!value) {
      setTitle("");
      setDescription("");
      setError(null);
      setSent(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
        >
          <Bug size={15} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bug size={15} className="text-muted-foreground" />
            Report a bug
          </DialogTitle>
        </DialogHeader>

        {sent ? (
          <div className="flex flex-col items-center gap-2 py-8 text-emerald-400">
            <CheckCircle size={32} />
            <p className="text-sm font-medium">Report sent — thank you!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <Label htmlFor="bug-title" className="text-xs text-muted-foreground">
                Title
              </Label>
              <Input
                id="bug-title"
                placeholder="Short description of the issue"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="bg-muted/40 border-border/60 focus-visible:border-border"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bug-description" className="text-xs text-muted-foreground">
                Description
              </Label>
              <textarea
                id="bug-description"
                placeholder="Steps to reproduce, expected vs actual behaviour…"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                className="w-full resize-none rounded-md border border-border/60 bg-muted/40 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-border transition-colors"
              />
            </div>
            {error && (
              <p className="text-xs text-rose-400">{error}</p>
            )}
            <div className="flex justify-end gap-2 pt-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setOpen(false)}
                className="text-muted-foreground"
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={!title.trim() || sending}>
                {sending ? "Sending…" : "Send report"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
