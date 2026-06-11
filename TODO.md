# TODO - Sub-reminder sequencing (Awaiting → Current → Previous)

- [ ] Add/confirm DB column `reminder_items.status` (enum/text: awaiting|current|previous) default `awaiting`.
- [ ] Update `app/api/reminders/create/route.ts` to initialize all inserted sub-reminders with `status='awaiting'`.
- [ ] After successful create/edit, set the earliest (calculated reminder_time, tie by due_date) item to `current`, rest to `awaiting`.
- [ ] Update `app/api/reminders/update/route.ts` to reset statuses for updated items to match the same sequencing rules.
- [x] Update `app/api/reminders/getAll/route.ts` to include `reminder_items.status`.

- [ ] Refactor `app/api/cron/route.ts` to:
  - [ ] sequence per parent by earliest calculated reminder_time
  - [ ] change previous/current/awaiting in DB
  - [ ] send email immediately when an item becomes current
  - [ ] loop until no further due awaiting items for that parent in a single cron run
  - [ ] after the last sub-reminder email, reset all statuses back to `awaiting`
- [ ] Update `app/components/home/ReminderList.tsx` to render status badge and opacity based on `item.status`.
- [ ] Update `app/components/home/ReminderItemCard.tsx` if needed so it uses `item.status` + existing wrapper classes.
- [ ] Update `app/globals.css` for fade/fading effect of `.alarm-reminder-current`.
- [ ] Run lint/typecheck and sanity test flow with 4 sub-reminders.

