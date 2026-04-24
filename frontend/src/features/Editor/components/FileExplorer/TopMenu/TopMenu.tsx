import { AddNodeButton } from "./AddNodeButton"

export function TopMenu() {
  return (
    <div className="h-8 flex items-center border-b border-white/[0.06] justify-between px-3 text-[10px] uppercase tracking-widest text-muted-foreground/40 font-medium">
      <span>Explorer</span>
      <div className="flex space-x-0.5 items-center">
        <AddNodeButton type="file" />
        <AddNodeButton type="folder" />
      </div>
    </div>
  )
}