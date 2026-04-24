import { SubmitButtons } from "./SubmitButtons";
import { SelectLanguage } from "./SelectLanguage";

export function NavbarMenu() {
  return (
    <div className="flex items-center gap-2 px-1 py-0.5 rounded-lg border border-border/40 bg-card/30 backdrop-blur-sm">
      <SelectLanguage/>
      <div className="w-px h-4 bg-border/50" />
      <div className="flex gap-2 w-36">
        <SubmitButtons />
      </div>
    </div>
  )
}