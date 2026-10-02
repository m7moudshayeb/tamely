# Tamely design system

**Style:** compact monochrome minimalism, in the spirit of macOS / Apple's Human Interface Guidelines (close to what Linear and Vercel do). Quiet light grays, ink text, small type, tight spacing, color only where it means something.

The tokens in `src/ui/tokens/` are the source of truth. Never use a raw color, size or radius outside `src/ui`.

## Rules in one glance

| Thing | Rule |
|---|---|
| Canvas | Warm light gray `--c-canvas`, cards a step lighter `--c-surface`. Never pure white pages. |
| Accent | Light gray `--c-accent` fill + ink text `--c-on-accent`. Links and emphasis in graphite `--c-accent-ink`. No brand hue. |
| Color | Only for meaning: status (good / attention / info / danger, always with an icon + label), charts (blue, pink, aqua), icon tiles. |
| Type | Body 14px. Small labels 11–12px. Page titles 24px. Hero only: up to ~70px with the elevated text shadow. |
| Spacing | 4px grid. Rows 36px, buttons 28px (24 small, 34 large), fields 30px. Page padding 24/20px. Section gaps 20px. |
| Radius | 6px buttons and controls, 7–9px fields and lists, 10px cards and panels. Pills only for tiny badges and the eyebrow tag. |
| Icons | Own SF-style set (`src/ui/icons`). 13–15px inline, 18px tiles in lists, 22px tiles in page titles. No icon inside a box unless it's a tile. |
| Illustrations | Small animated SVG scenes (`src/ui/illustrations`) on topic cards only. Token colors, one tint per scene, short loops, still under reduced motion. |
| Elevation | Hairline borders (0.5px) + barely-there shadows. The big shadow is for sheets and menus only. |
| Motion | Short and springy: 120–380ms, fade + small rise. Respect reduced motion. |

## Layout patterns

- **Landing:** centered 100vh hero (eyebrow, headline, one line, one button) → connect steps → footer. Nothing else.
- **App:** 216px sidebar, content max 760px (980px for charts, 1180px for Everything else). Home: greeting heading, then the briefing as the assistant's first message.
- **Masonry:** topic cards in CSS columns, each showing its full list so heights differ naturally. Never equal-height grids.
- **Lists:** iOS-style inset grouped rows with a small tile, title, one-line subtitle, trailing control.
- **Sidebar:** 236px. People add any page from Everything else (it joins its topic's section; only topics without one go under Your shortcuts) and remove or reorder links in Edit sidebar, or by asking the assistant. Ask & briefing, Everything else and Setup & help always stay. Saved in the browser only.
- **Guides:** a Cloudflare page without its own Tamely screen opens a guide: title, one line, Open on Cloudflare / Ask about this / Official docs, where it lives on Cloudflare, steps written from the official docs with citations, and related pages.
- **Chat box:** two rows tall, grows to six; send button pinned bottom-right.
- **Forms:** show only the fields the chosen type needs (pick a type from a select, then fill it in).
- **Changes:** never run directly from the assistant. Always a Confirm card with a one-line plain summary.

## Copy

Plain words, no jargon. When a Cloudflare term is unavoidable, explain it in a few words and link the official docs.

## Don'ts

- No dark themes, no indigo, no orange (too close to Cloudflare), no Cloudflare logo or cloud imagery.
- No native selects, checkboxes or radios. Use `Select`, `Switch`, `SegmentedControl`.
- No two-column marketing heroes, mock product cards or decorative sections.
