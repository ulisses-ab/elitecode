import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useState } from "react";
import { stringifyObject } from "./stringifyObject";
import { cn } from "@/lib/utils";
import { Copy, Check, Lock } from "lucide-react";

const DEFAULT_CODE_BLOCK_HEIGHT = 128; // px — matches old max-h-32
const MIN_CODE_BLOCK_HEIGHT = 60;

type StatusConfig = {
  container: string;
  label: string;
  labelClass: string;
  errorBorder: string;
  errorBg: string;
  errorLabel: string;
  errorText: string;
};

function getStatusConfig(status: string): StatusConfig {
  switch (status) {
    case "ACCEPTED":
      return {
        container: "border-emerald-500/20 bg-emerald-500/[0.03]",
        label: "Accepted",
        labelClass: "text-emerald-400",
        errorBorder: "", errorBg: "", errorLabel: "", errorText: "",
      };
    case "REJECTED":
      return {
        container: "border-rose-500/20 bg-rose-500/[0.03]",
        label: "Wrong Answer",
        labelClass: "text-rose-400",
        errorBorder: "", errorBg: "", errorLabel: "", errorText: "",
      };
    case "TLE":
      return {
        container: "border-amber-500/20 bg-amber-500/[0.03]",
        label: "Time Limit",
        labelClass: "text-amber-400",
        errorBorder: "border-amber-500/15",
        errorBg: "bg-amber-500/[0.04]",
        errorLabel: "text-amber-400/60",
        errorText: "text-amber-300/80",
      };
    case "FAILED":
      return {
        container: "border-amber-500/20 bg-amber-500/[0.03]",
        label: "Error",
        labelClass: "text-amber-400",
        errorBorder: "border-amber-500/15",
        errorBg: "bg-amber-500/[0.04]",
        errorLabel: "text-amber-400/60",
        errorText: "text-amber-300/80",
      };
    default:
      return {
        container: "border-border/50",
        label: "",
        labelClass: "",
        errorBorder: "", errorBg: "", errorLabel: "", errorText: "",
      };
  }
}

export function TestItem({
  testcase,
  index,
  results,
}: {
  testcase: any;
  index: number;
  results: any;
}) {
  const [codeBlockHeight, setCodeBlockHeight] = useState(DEFAULT_CODE_BLOCK_HEIGHT);

  function display(obj: any) {
    return typeof obj === "string" ? obj : stringifyObject(obj);
  }

  function startResize(e: React.MouseEvent | React.TouchEvent) {
    e.preventDefault();
    const startY = "touches" in e ? e.touches[0].clientY : e.clientY;
    const startHeight = codeBlockHeight;

    document.body.style.userSelect = "none";

    function onMove(e: MouseEvent | TouchEvent) {
      const y = "touches" in e ? e.touches[0].clientY : e.clientY;
      setCodeBlockHeight(Math.max(MIN_CODE_BLOCK_HEIGHT, startHeight + (y - startY)));
    }

    function onUp() {
      document.body.style.userSelect = "";
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      document.removeEventListener("touchmove", onMove);
      document.removeEventListener("touchend", onUp);
    }

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
    document.addEventListener("touchmove", onMove, { passive: false });
    document.addEventListener("touchend", onUp);
  }

  const status = getStatusConfig(results?.status);
  const isHidden = testcase.hidden === true;
  const hasError = (results?.status === "FAILED" || results?.status === "TLE") && results?.error;
  const hasStats = results?.time_ms != null || results?.memory_kb != null;

  return (
    <AccordionItem
      value={`testcase-${index}`}
      className={cn(
        "group rounded-xl border bg-card/40 transition-colors duration-150",
        status.container
      )}
    >
      <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-transparent [&>svg]:text-muted-foreground/40">
        <div className="flex w-full items-center justify-between pr-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-foreground/80">
              Case {index + 1}
            </span>
            {isHidden && (
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground/40">
                <Lock size={9} />
                hidden
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {hasStats && (
              <span className="text-[10px] font-mono tabular-nums text-muted-foreground/35">
                {results.time_ms != null && `${Math.round(results.time_ms)} ms`}
                {results.time_ms != null && results.memory_kb != null && " · "}
                {results.memory_kb != null && `${results.memory_kb} KB`}
              </span>
            )}
            {results?.status && (
              <span className={cn("text-xs font-medium", status.labelClass)}>
                {status.label}
              </span>
            )}
          </div>
        </div>
      </AccordionTrigger>

      <AccordionContent className="px-4 pb-0 pt-0">
        {isHidden ? (
          <div className="pb-3 grid gap-3 grid-cols-1 sm:grid-cols-3">
            <HiddenBlock title="Input" />
            <HiddenBlock title="Expected" />
            <HiddenBlock title="Output" />
          </div>
        ) : (<>
          <div className="space-y-3">
            {hasError && (
              <div className={cn("rounded-lg border p-3", status.errorBorder, status.errorBg)}>
                <p className={cn("text-[10px] uppercase tracking-widest font-medium mb-1.5", status.errorLabel)}>
                  {results.errorType ?? "Error"}
                </p>
                <pre className={cn("text-xs font-mono whitespace-pre-wrap leading-relaxed", status.errorText)}>
                  {results.error}
                </pre>
              </div>
            )}

            <div className="grid gap-3 grid-cols-1 sm:grid-cols-3">
              <CodeBlock title="Input" content={display(testcase.input)} maxHeight={codeBlockHeight} />
              <CodeBlock title="Expected" content={display(testcase.output)} maxHeight={codeBlockHeight} />
              <CodeBlock
                title="Output"
                content={results?.actual_output != null ? display(results.actual_output) : null}
                maxHeight={codeBlockHeight}
                highlight={
                  results?.status === "REJECTED" ? "wrong" :
                  results?.status === "ACCEPTED" ? "correct" : undefined
                }
              />
            </div>

            {results?.stdout && (
              <CodeBlock title="Stdout" content={results.stdout} maxHeight={codeBlockHeight} mono />
            )}

          </div>
          <div
            onMouseDown={startResize}
            onTouchStart={startResize}
            className="group-data-[state=closed]:hidden mt-3 h-3 flex items-center justify-center cursor-row-resize rounded-b-xl"
          >
            <div className="w-6 h-px rounded-full bg-white/[0.10] group-hover:bg-white/[0.22] transition-colors" />
          </div>
        </>)}
      </AccordionContent>
    </AccordionItem>
  );
}

function HiddenBlock({ title }: { title: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[10px] uppercase tracking-widest text-muted-foreground/40 font-medium">
        {title}
      </span>
      <div className="rounded-lg border border-border/50 bg-background/40 p-3 flex items-center gap-1.5 text-muted-foreground/25">
        <Lock size={10} />
        <span className="text-xs italic">hidden</span>
      </div>
    </div>
  );
}

function CodeBlock({
  title,
  content,
  highlight,
  maxHeight,
  mono = true,
}: {
  title: string;
  content: string | null;
  highlight?: "correct" | "wrong";
  maxHeight: number;
  mono?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!content) return;
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const borderClass =
    highlight === "correct"
      ? "border-emerald-500/25"
      : highlight === "wrong"
      ? "border-rose-500/25"
      : "border-border/50";

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[10px] uppercase tracking-widest text-muted-foreground/40 font-medium">
        {title}
      </span>

      <div className={cn("relative group rounded-lg border bg-background/40", borderClass)}>
        <div className="overflow-y-auto p-3" style={{ maxHeight }}>
          {content ? (
            <pre
              className={cn(
                "text-xs whitespace-pre-wrap leading-relaxed",
                mono ? "font-mono" : "font-sans",
                highlight === "correct" && "text-emerald-300/90",
                highlight === "wrong" && "text-rose-300/90",
                !highlight && "text-foreground/75"
              )}
            >
              {content}
            </pre>
          ) : (
            <span className="text-xs text-muted-foreground/25 italic">—</span>
          )}
        </div>

        {content && (
          <button
            onClick={handleCopy}
            className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-1 rounded text-muted-foreground/40 hover:text-muted-foreground hover:bg-white/[0.06] opacity-0 group-hover:opacity-100 transition-all"
          >
            {copied ? <Check size={11} /> : <Copy size={11} />}
          </button>
        )}
      </div>
    </div>
  );
}
