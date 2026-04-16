# Mobile Responsiveness — Context & Changes Log

> **Date**: March 31, 2026  
> **Scope**: Platform-wide mobile responsiveness adaptation (320px–768px)  
> **Approach**: Responsive overrides only — NO redesign, NO new layouts, NO color/typography changes

---

## Architecture Context

The NeetCode platform uses a **viewport-locked layout system**:
- `html, body` have `height: 100dvh` + `overflow: hidden`
- Pages are wrapped in `MainLayout` which creates a flex row: Sidebar | Main Content
- Each page uses `h-full overflow-hidden` to fill the available space exactly
- Internal scroll (where needed) is managed per-component (e.g., profile pages use `overflow-y-auto`)

**Problem on mobile**: The viewport lock prevents any scrolling, so content that doesn't fit in ~500–700px of vertical space gets cut off. This is fine on desktop (1080p+) but breaks everything on mobile.

---

## Strategy Used

**Responsive overflow unlock**: Keep the viewport-locked behavior on `lg:` (desktop) but allow natural scrolling on smaller screens.

Pattern applied across all pages:
```
BEFORE: h-full overflow-hidden
AFTER:  h-auto lg:h-full overflow-visible lg:overflow-hidden
```

This preserves the exact desktop experience while unlocking mobile scrollability.

---

## Files Modified

### 1. `src/app/globals.css`
- Added `@media (max-width: 768px)` block
- Unlocks `overflow-y: auto` on `html, body` for mobile
- Converts `.viewport-page` to min-height instead of fixed height
- Adds `overflow-x: hidden` + `max-width: 100vw` to prevent horizontal overflow globally

### 2. `src/components/layouts/main-layout.tsx`
- Root flex container: `h-screen` → `min-h-screen lg:h-screen` with responsive overflow
- Main content area: `overflow-hidden` → responsive overflow (scrolls on mobile, locked on desktop)
- Content wrapper: `overflow-hidden` → `overflow-x-hidden overflow-y-auto lg:overflow-hidden`

### 3. `src/app/(core-pages)/dashboard/page.tsx`
- Root: `h-full overflow-hidden` → `h-auto lg:h-full overflow-y-auto lg:overflow-hidden`
- Main layout box, right column, chart grid: all converted to responsive overflow
- Chart flex containers: Added `min-h-[140px]` / `min-h-[180px]` on mobile so Recharts renders properly when stacked
- Chart grid: `flex-[3]` → `lg:flex-[3]` (prevents flex sizing issues on mobile)

### 4. `src/app/(core-pages)/problems/page.tsx`
- Root: `h-full overflow-hidden` → `h-auto lg:h-full overflow-visible lg:overflow-hidden`

### 5. `src/app/(core-pages)/practice/page.tsx`
- Root: `h-full overflow-hidden` → `h-auto lg:h-full overflow-x-hidden overflow-y-auto lg:overflow-hidden`
- Inner wrapper: responsive overflow unlock

### 6. `src/app/(core-pages)/leaderboard/page.tsx`
- Root: responsive overflow unlock (same pattern)
- Inner content wrapper: `h-full` → `lg:h-full` for proper mobile stacking
- Rankings grid: responsive overflow

### 7. `src/app/(core-pages)/communities/page.tsx`
- Root: `h-full overflow-hidden` → `h-auto lg:h-full overflow-visible lg:overflow-hidden`

### 8. `src/components/communities/CommunityLayout.tsx`
- Root wrapper, section, and main content area: all converted to responsive overflow
- This fixes ALL community sub-pages (chat, tests, analytics, leaderboard, members, settings)

### 9. `src/app/(core-pages)/neetcode-150/page.tsx`
- Converted from `min-h-screen` (was fighting the viewport lock) to `h-full overflow-y-auto scrollbar-emerald`
- Reduced padding for mobile: `p-6 md:p-12` → `p-4 md:p-6 lg:p-12`
- Header title: `text-4xl md:text-5xl` → `text-3xl md:text-4xl lg:text-5xl`
- Progress bar in accordion: `w-32` → `w-16 md:w-32` to prevent overflow on small screens
- Category title: Added `truncate min-w-0 flex-1` for text overflow handling
- Progress card: Added `w-full md:w-auto shrink-0` for proper stacking

### NOT Modified (Already Mobile-Safe)
- `src/app/page.tsx` (Landing) — Already uses `min-h-screen`, responsive grids, mobile menu
- `src/app/profile/page.tsx` — Already uses `overflow-y-auto`
- `src/app/profile/[id]/page.tsx` — Already uses `overflow-y-auto`
- `src/components/layouts/Sidebar.tsx` — Already has mobile slide-in/out behavior
- Auth pages (login/register) — Outside the MainLayout, naturally scrollable

---

## Key Patterns for Future Development

When creating new pages within `MainLayout`:

```tsx
// ✅ DO: Use responsive overflow pattern
<div className="h-auto lg:h-full overflow-y-auto lg:overflow-hidden ...">

// ❌ DON'T: Use hard overflow-hidden (breaks mobile)
<div className="h-full overflow-hidden ...">

// ✅ DO: Add mobile min-heights to chart containers
<div className="flex-1 min-h-[140px] lg:min-h-0">

// ❌ DON'T: Let chart containers collapse to 0 on mobile
<div className="flex-1 min-h-0">
```

---

## Testing Checklist

- [x] Build succeeds (`npm run build` — exit code 0)
- [ ] 320px viewport — no horizontal scroll, content visible
- [ ] 375px viewport — standard mobile experience
- [ ] 480px viewport — larger phone screens
- [ ] 768px viewport — tablet/breakpoint boundary
- [ ] Desktop unchanged — viewport lock behavior preserved
