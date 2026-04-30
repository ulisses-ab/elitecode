import { SubmitButtons } from "./SubmitButtons";
import { SelectLanguage } from "./SelectLanguage";

export function NavbarMenu() {
  return (
    <div className="flex items-center gap-1.5 px-1 py-0.5 rounded-lg border border-border/40 bg-card/30 backdrop-blur-sm">
      <div className="hidden sm:flex items-center gap-1.5">
        <SelectLanguage />
        <div className="w-px h-4 bg-border/50" />
      </div>
      <div className="w-44">
        <SubmitButtons />
      </div>
    </div>
  );
}
