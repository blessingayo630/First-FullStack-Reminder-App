# TODO

## Task: Remove verify email flow and redirect to `/homepage` after successful login

- [x] Create initial edit plan
- [ ] Update `app/api/auth/login/route.ts` to stop returning error on "Email not confirmed".
- [ ] Update `app/login/page.tsx` to redirect to `/homepage` on successful login.
- [ ] Remove verify-email page route (`app/verify-email/page.tsx`).
- [ ] Remove/disable confirm-email API route (`app/api/auth/confirm-email/route.ts`).
- [ ] Ensure homepage route exists: implement `app/homepage/page.tsx` and route to current homepage.
- [ ] Update any auth/session redirects that send users to `/login` or `/`.
- [ ] Run `npm run lint` and `npm run build`.

