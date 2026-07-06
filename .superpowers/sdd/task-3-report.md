# Task 3 Report: dot追従（translateX）とグリッド列幅変更

## Summary
Successfully implemented Task 3 changes: extended the wavy CAREER timeline to apply translateX transforms to each dot so they follow the curve, and widened the grid column holding the dots to prevent overlap with text content.

## Implementation Details

### Changes Made

1. **SCSS Grid Column Width Update** (`src/assets/scss/page/top/_career.scss:256`)
   - Changed `.career__item`'s `grid-template-columns` from `1fr vwmin(40) 1fr` to `1fr vwmin(96) 1fr`
   - Desktop viewport only (PC layout)
   - SP layout's `vw(40)` unchanged as specified

2. **JavaScript Dot Transform Addition** (`src/assets/js/top.portfolio.js:243-245`)
   - Added forEach loop inside `buildCareerLine()` after careerLinePoints assignment
   - Each dot now receives: `transform: translateX(Npx)` based on its position on the curve
   - Formula: `Math.round(dotPoints[i].x - centerX)` provides the offset from centerline
   - Reuses existing `dotPoints` and `centerX` variables from Task 2 implementation

### Verification

✓ **SCSS Compilation**: `npm run build:scss` executed successfully with no errors
✓ **Compiled CSS**: Verified output shows correct compiled value: 
  - `grid-template-columns: 1fr min(calc(96 / var(--vw-min) * 100vw), 96px) 1fr;`
✓ **Code Location**: Both changes placed exactly where the task brief specified
✓ **Scope**: Modified only the two required files; no unintended changes
✓ **Git Worktree Path**: Verified as `/Users/hiroshi/Desktop/work/portfolio-2026-anime/.claude/worktrees/career-timeline`

## Self-Review Checklist

- [x] Changed ONLY PC grid column width (`vwmin(40)` → `vwmin(96)`), left SP block's `vw(40)` untouched
- [x] Added translateX line inside `buildCareerLine()`, placed correctly after careerLinePoints and before `const d = ...`
- [x] Used existing `dotPoints`/`centerX` variables (no duplicate calculations)
- [x] Confirmed worktree path matches exactly before committing
- [x] Avoided adding anything under `dist/` to git (build output only)
- [x] Staged only the two required source files for commit

## Files Changed
- `src/assets/js/top.portfolio.js` — +3 lines (dot transform loop)
- `src/assets/scss/page/top/_career.scss` — +1 change (grid column width)

## Git Commit
- **SHA:** `e98ac3a`
- **Message:** "feat: make CAREER dots follow the wavy line, widen dot column"
- **Committed from:** `/Users/hiroshi/Desktop/work/portfolio-2026-anime/.claude/worktrees/career-timeline` (correct worktree)

## Conclusion
Task 3 complete. Dots now follow the wavy curve with translateX positioning, and the grid column is widened to accommodate horizontal dot movement without text overlap.

## Fix Round 1 — Verification

**Command Run:**
```bash
node .claude-check-career-t3-verify.mjs
```

**Playwright Output (Step 4 Verification):**
```json
[
  "matrix(1, 0, 0, 1, -48, 0)",
  "matrix(1, 0, 0, 1, 48, 0)"
]
```

**Verification Result:**
✓ Both dots have computed `transform` values (not `"none"`)
✓ First dot: `matrix(1, 0, 0, 1, -48, 0)` — horizontal translation component = **-48**
✓ Second dot: `matrix(1, 0, 0, 1, 48, 0)` — horizontal translation component = **+48**
✓ **Opposite-sign confirmation**: -48 and +48 are opposite signs ✓

**Conclusion**: Task 3 dot-translateX functionality verified. `.js-careerDot` elements correctly receive opposite-sign horizontal transforms to follow the wavy line curve.
