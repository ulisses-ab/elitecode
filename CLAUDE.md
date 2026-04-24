# LeetClone — Project Guide

## Frontend UI Style

### Design Philosophy
Minimalist dark coding environment. Every surface should feel intentional and calm — no decorative chrome, no aggressive contrast. Inspired by tools like Linear, Zed, and Vercel's dashboard.

### Color System
Tailwind CSS v4 with OKLch CSS custom properties. All tokens defined in `frontend/src/styles/globals.css`.

**Dark mode is the only mode** (`class="dark"` on `<html>`).

Dark mode palette (indigo-shifted dark — hue ~268°):

| Token | Value | Approx hex | Role |
|---|---|---|---|
| `--background` | `oklch(0.17 0.018 268)` | `#141620` | Page background |
| `--card` | `oklch(0.21 0.018 268)` | `#191b24` | Panel / card surfaces |
| `--muted` | `oklch(0.25 0.015 268)` | `#1e2030` | Subtle fills |
| `--border` | `oklch(1 0 0 / 9%)` | `#ffffff17` | Borders |
| `--muted-foreground` | `oklch(0.62 0.018 268)` | — | Secondary text |

All surfaces share the same **indigo-shifted hue (~268°)**. Never introduce a neutral gray or a different hue family — it will look foreign.

### Editor (Monaco)
The Monaco editor uses a custom theme `lc-dark` defined in `CodeEditor.tsx`. Its colors are hardcoded hex approximations of the CSS tokens above:

- Editor background: `#191b24` (matches `--card`)
- File explorer sidebar: `#141620` (matches `--background`)
- Cursor: `#818cf8` (indigo-400)
- Selection: `#3b4bdb38`
- Line numbers: `#3e4260` / active `#6b7280`

When changing `--background` or `--card`, update these hex values to match.

### Typography
- Font: **Inter** (loaded from Google Fonts), with `font-feature-settings: 'cv11', 'ss01'`
- Body is `antialiased`
- UI labels: `text-xs`, `tracking-wide` or `tracking-widest` for section headers
- Code/IDs: `font-mono`

### Component Conventions

**Navbar** — Sticky, `backdrop-blur-md`, `bg-background/75`, `border-b border-border/60`. Always `z-50`. Logo uses a `<>` monogram badge.

**Panels (Workspace)** — `rounded-xl border border-border/50 bg-card/40`. Two resizable panels side by side with a transparent handle.

**Tabs** — Underline style, not pill/box. Active tab: `border-b-2 border-foreground/80`. Inactive: `text-muted-foreground`. No background on the tab itself.

**Cards (problem list)** — `border-border/50 bg-card/60 backdrop-blur-sm`. Hover: `hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20 hover:border-border`.

**Difficulty badges** — Dot indicator + label. Soft tinted backgrounds:
- Easy: `bg-emerald-500/10 text-emerald-400 border-emerald-500/20`
- Medium: `bg-amber-500/10 text-amber-400 border-amber-500/20`
- Hard: `bg-rose-500/10 text-rose-400 border-rose-500/20`

**Buttons** — Ghost or outline variants. Avoid filled/solid buttons except for primary CTAs. Submit button: green-tinted outline.

**Scrollbars** — Custom, 6px, `bg-white/12` thumb, transparent track.

**Borders** — Always use `border-border/50` or `border-white/[0.06..0.09]` — never opaque borders.

### Layout
- Problems page: centered column, max-w-5xl problem grid (1→2→3 columns)
- Workspace: horizontal resizable split, left 33% default
- File explorer sidebar is narrower than the Monaco pane (default 18%)

### File Explorer
- Sidebar bg: `#141620`, border-right: `border-white/[0.07]`
- Selected node: `bg-indigo-500/20 text-indigo-200`
- Hover: `bg-white/[0.05]`
- Section label: `text-[10px] uppercase tracking-widest text-muted-foreground/40`
- Import/Export buttons: icon-only, live in the **Editor tab bar** (RightSide), not in the sidebar

### What to avoid
- Hardcoded `#1e1e1e`, `#2a2d2e`, `#094771` or other VS Code colors — replace with design tokens
- Opaque white/black borders
- Solid filled backgrounds on interactive elements (use `bg-white/[0.05..0.10]` instead)
- Adding features, comments, or abstractions beyond what's asked
