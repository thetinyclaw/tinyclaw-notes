# Active Projects - Current Session Notes

## Flight Tracker ✈️
**Last Updated:** 2026-02-11 10:07 CST

### Recent Work (This Session)
- Verified cron job configuration (28800000ms = 8 hours, 3x/day)
- Implemented API optimizations:
  - Added `time.sleep(0.15)` between API calls
  - Reduced search depth from 2 dates → 1 date per route
  - Updated config.json: `check_interval_hours` 6 → 8
- Pushed changes to GitHub
- README.md updated with optimization notes

### Status
✅ Running with optimizations. Next check scheduled per cron.

---

## Torch 🔥
**Last Updated:** 2026-02-11 09:37 CST
Status: Prototyping/Integration. No changes this session.

---

## BrainBytes 🧠
**Last Updated:** 2026-02-11 09:54 CST
Status: Repository split from workspace. Now properly isolated.

---

## Repository Reorganization
**Status:** ✅ COMPLETE
- Workspace root now tracks to `tinyclaw-notes` repo
- BrainBytes isolated in `BrainBytes/` folder (separate git)
- Secrets secured in `.secrets` (git-ignored)
- Profile backup in `tinyclaw-profile/` (local only)

---

## Loose Ends / Todos
- None currently critical
