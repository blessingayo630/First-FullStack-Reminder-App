# Edit plan: remove verify email + redirect after login

## Information gathered
- `app/api/auth/login/route.ts` currently checks Supabase error message and returns 400 when `message === 'Email not confirmed'`.
- `app/login/page.tsx` uses `supabase.auth.signInWithPassword` client-side and on success does `router.push('/')`.
- `app/verify-email/page.tsx` exists and performs `/api/auth/confirm-email` calls and redirects to `/`.
- `app/api/auth/confirm-email/route.ts` is present but commented out (POST implementation is commented).
- There is currently a `app/page.tsx` that renders the login page (so `/` is login).
- There is no `app/homepage/page.tsx` in the visible tree; the existing authenticated UI appears to be in `app/components/HomePage.tsx`.
   
## Plan
1. Update `app/api/auth/login/route.ts`
   - Remove the special-case for `'Email not confirmed'` so login succeeds (or at least doesn't hard-fail with that messaging).
2. Update `app/login/page.tsx`
   - Change success redirect from `/` to `/homepage`.
3. Remove verify-email flow
   - Delete `app/verify-email/page.tsx`.
   - Delete `app/api/auth/confirm-email/route.ts` (or make it return 404/500) to prevent unused endpoints.
4. Add `/homepage` route
   - Create `app/homepage/page.tsx` that renders `app/components/HomePage.tsx`.
   - Keep the existing homepage auth/session check in `HomePage.tsx` (it redirects to `/login`).
5. Optional cleanup
   - Update any in-app links that point to `/verify-email` (if found).
6. Test
   - Run `npm run lint` and `npm run build`.

## Dependent files to edit
- `app/api/auth/login/route.ts`
- `app/login/page.tsx`
- `app/verify-email/page.tsx` (delete)
- `app/api/auth/confirm-email/route.ts` (delete)
- `app/homepage/page.tsx` (new)

## Followup steps
- `npm run lint`
- `npm run build`

