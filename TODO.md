## TODO
- [x] Update `lib/scheduler.ts` to remove all references to `reminders.reminder_time`.
- [x] Align `lib/scheduler.ts` with current `app/api/cron/route.ts` approach (use `reminder_items` and compute due time from `due_date`, `remind_before`, `remind_unit`).

- [ ] Ensure `sendReminderEmail` and `sendSMSReminder` calls receive the required reminder fields.
- [ ] Run `npm run build` (or `npm run lint`) to confirm TypeScript correctness.
- [ ] Re-test cron locally by hitting `GET /api/cron` and confirm Vercel logs no longer mention `reminders.reminder_time`.

