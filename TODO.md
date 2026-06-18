# TODO

## HomePage refactor
- [ ] Remove commented legacy code and dead comments from `app/components/HomePage.tsx`.
- [ ] Extract custom hook `useHomePageData.ts` for auth/session checks, notification permission/FCM token, reminders loading/refetch, polling.
- [ ] Extract UI components:
  - [ ] `LogoutPopup.tsx`
  - [ ] `ReminderDescriptionsEditor.tsx`
  - [ ] `ReminderCreateModal.tsx`
  - [ ] `ReminderEditModal.tsx`
  - [ ] `HomePageShell.tsx` (header + toasts + modals + list)
- [x] Update `app/components/HomePage.tsx` composition layer scaffolding (new files added).

- [ ] Ensure all handlers still call the existing APIs and that `ReminderList` props remain compatible.

## reset-password cleanup
- [ ] Remove all commented-out legacy implementations from `app/reset-password/page.tsx`.
- [ ] Remove unused imports/types if any (after cleanup).

## Project-wide cleanliness
- [ ] Remove unused imports/declarations and any ESLint disable comments that become unnecessary.
- [ ] Run lint/typecheck/build and fix any TS/ESLint errors.

