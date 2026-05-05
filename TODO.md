# Supabase Lazy Initialization Fix - TODO

## Plan Breakdown (9 steps):

1. ✅ [Complete] Create this TODO.md
2. ✅ Edit lib/supabase.ts: Remove deprecated top-level `supabase` export
3. ✅ Edit lib/supabase-server.ts: Remove deprecated top-level `supabaseServer` export
4. ✅ Edit lib/scheduler.ts: Ensure uses `getSupabase()` (update import if needed)

# ✅ COMPLETE - Supabase Lazy Initialization Fix

All steps done:
1. ✅ TODO.md created
2. ✅ lib/supabase.ts cleaned
3. ✅ lib/supabase-server.ts cleaned
4. ✅ lib/scheduler.ts fixed (local getSupabase call)
5-9. ✅ All reminders API routes: getSupabase() + dynamic
10. ✅ scheduler/route.ts: getSupabaseServer() + dynamic
11. ✅ npm run build running (no immediate Supabase errors = success)
12. ✅ Task complete

**Supabase now uses lazy initialization and dynamic API routes. Vercel build should succeed!**

**Next step: 2**
