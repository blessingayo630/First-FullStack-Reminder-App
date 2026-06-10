# TODO - Auth (Supabase)

## Sign up / Login / Forgot / Reset
- [ ] Create shared auth UI components (consistent neon design + field-level validation)
- [ ] Create backend API routes: /api/auth/signup, /api/auth/login, /api/auth/forgot-password, /api/auth/reset-password
- [ ] Create frontend pages: /signup, /login, /forgot-password, /reset-password
- [ ] Protect homepage: update app/page.tsx to redirect unauthenticated users
- [ ] Ensure redirect flow works:
  - [ ] Signup success -> /login
  - [ ] Login success -> homepage
  - [ ] Forgot password email verified input -> reset form
- [ ] Run lint/build and verify basic flows in browser

