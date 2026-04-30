import { useState } from "react";
import { MessageSquare, CheckCircle } from "lucide-react";
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

export function FeedbackButton() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setError(null);

    try {
      await api.post("/feedback/feedback", {
        type: "suggestion",
        title: title.trim(),
        message: message.trim(),
      });

      setSent(true);

      setTimeout(() => {
        setOpen(false);
        setSent(false);
        setTitle("");
        setMessage("");
      }, 2000);
    } catch {
      setError("Failed to send feedback. Please try again.");
    } finally {
      setSending(false);
    }
  }

  function handleOpenChange(value: boolean) {
    setOpen(value);
    if (!value) {
      setTitle("");
      setMessage("");
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
          <MessageSquare className="size-[18px]" />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare size={15} className="text-muted-foreground" />
            Send feedback
          </DialogTitle>
        </DialogHeader>

        {sent ? (
          <div className="flex flex-col items-center gap-2 py-8 text-emerald-400">
            <CheckCircle size={32} />
            <p className="text-sm font-medium">Feedback sent — thank you!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <Label htmlFor="feedback-title" className="text-xs text-muted-foreground">
                Title
              </Label>
              <Input
                id="feedback-title"
                placeholder="Short idea or suggestion"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="bg-muted/40 border-border/60 focus-visible:border-border"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="feedback-message" className="text-xs text-muted-foreground">
                Details
              </Label>
              <textarea
                id="feedback-message"
                placeholder="Describe your idea, improvement, or suggestion..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
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

              <Button
                type="submit"
                size="sm"
                disabled={!title.trim() || sending}
              >
                {sending ? "Sending…" : "Send feedback"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}