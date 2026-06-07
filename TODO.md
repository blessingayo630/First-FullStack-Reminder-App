# TODO

## Reminders toggle fixes
- [ ] Update parent reminder switch in `app/components/HomePage.tsx` to send the full `descriptions` array (all sub-reminders) to `/api/reminders/update`.
- [ ] Remove dependency on legacy `description`/`dueDate`/`remindBefore`/`remindUnit` fields for parent toggle.
- [ ] Ensure optimistic UI updates are reverted correctly if the API call fails.
- [ ] (If errors persist) harden `/api/reminders/update/route.ts` so missing `descriptions` never overwrites all `reminder_items` unexpectedly.
- [ ] Verify behavior:
  - [ ] Toggle a single sub-reminder off/on works without error.
  - [ ] Toggle parent off turns off all sub-reminders.
  - [ ] Toggle parent on turns on all sub-reminders.

