  'use client';

import Switch from '@mui/material/Switch';
import type { Reminder, ReminderItem } from './ReminderTypes';

function calculateReminderTime(it: ReminderItem) {
  const due = new Date(it.due_date);
  if (isNaN(due.getTime())) return null;

  const t = new Date(due);
  const before = Number(it.remind_before ?? 0);
  const unit = it.remind_unit ?? 'days';

  switch (unit) {
    case 'minutes':
      t.setMinutes(t.getMinutes() - before);
      break;
    case 'hours':
      t.setHours(t.getHours() - before);
      break;
    case 'days':
      t.setDate(t.getDate() - before);
      break;
    case 'weeks':
      t.setDate(t.getDate() - before * 7);
      break;
    case 'months':
      t.setMonth(t.getMonth() - before);
      break;
  }
  return t;
}

export default function ReminderList({
  reminders,
  fcmToken,
  openMenuForId,
  deletingId,
  setOpenMenuForId,
  onEdit,
  onDelete,
  onToggleParent,
  onToggleItem,
  formatDate,
}: {
  reminders: Reminder[];
  fcmToken: string | null;
  openMenuForId: number | null;
  deletingId: number | null;
  setOpenMenuForId: (id: number | null) => void;
  onEdit: (r: Reminder) => void;
  onDelete: (id: number) => void;
  onToggleParent: (r: Reminder, nextEnabled: boolean) => void;
  onToggleItem: (parentId: number, itemId: number, nextEnabled: boolean) => void;
  formatDate: (d: string) => string;
}) {
  return (
    <div className="card-neon rounded-lg">
      <div className="p-6 border-b border-white/10">
        <h2 className="text-xl font-semibold text-white">Your Reminders</h2>
        <p className="text-white/60 text-sm mt-1">
          {reminders.length} reminder{reminders.length !== 1 ? 's' : ''} total
        </p>
      </div>

      {reminders.length === 0 ? (
        <div className="p-12 text-center text-white/55">
          <p className="text-lg">No reminders yet</p>
          <p className="text-sm mt-2">Click the &quot;Add Reminder&quot; button to create one</p>
        </div>
      ) : (
        <div className="space-y-4 px-0">
          {reminders.map((reminder) => {
            const items = reminder.reminder_items ?? [];
            const withSort = items
              .map((it) => ({ it, reminderTime: calculateReminderTime(it) }))
              .sort((a, b) => {
                const at = a.reminderTime?.getTime() ?? Number.POSITIVE_INFINITY;
                const bt = b.reminderTime?.getTime() ?? Number.POSITIVE_INFINITY;
                if (at !== bt) return at - bt;
                const ad = new Date(a.it.due_date).getTime() || 0;
                const bd = new Date(b.it.due_date).getTime() || 0;
                return ad - bd;
              });

            return (
              <div key={reminder.id} className="card-neon rounded-lg p-6 alarm-list-item">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="text-lg font-semibold text-white">{reminder.title}</h3>
                        <p className="text-white/50 text-sm">{reminder.user_email}</p>
                      </div>

                      <div className="flex items-center shrink-0">
                        <Switch
                          className="alarm-switch alarm-switch--parent"
                          checked={!!reminder.is_enabled}
                          onChange={(e) => onToggleParent(reminder, e.target.checked)}
                          sx={{
                            '& .MuiSwitch-switchBase.Mui-checked': { color: '#ffb020' },
                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                              backgroundColor: '#ffb020',
                            },
                            '& .MuiSwitch-track': { backgroundColor: 'rgba(255,176,32,0.35)' },
                          }}
                        />
                      </div>
                    </div>

                    <div className="mt-4 space-y-4 flex flex-col items-center">
                      {withSort.map(({ it }) => {
                        const timeText = `${String(it.remind_before ?? '')} ${String(it.remind_unit ?? '')}`.trim();

                        const statusKind = (it.status as 'previous' | 'current' | 'awaiting' | undefined) ?? 'awaiting';

                        return (
                          <div
                            key={it.id}
                            className={`border border-white/10 rounded-lg p-3 w-full max-w-[90%] ${
                              statusKind === 'previous'
                                ? 'alarm-reminder-previous'
                                : statusKind === 'current'
                                  ? 'alarm-reminder-current'
                                  : 'alarm-reminder-awaiting'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  {statusKind === 'previous' && (
                                    <span className="alarm-status-badge alarm-status-badge--previous">✓ Previous</span>
                                  )}
                                  {statusKind === 'current' && (
                                    <span className="alarm-status-badge alarm-status-badge--current">🔔 Current</span>
                                  )}
                                  {statusKind === 'awaiting' && (
                                    <span className="alarm-status-badge alarm-status-badge--awaiting">⏳ Awaiting</span>
                                  )}
                                </div>

                                <p
                                  className="text-white/80 font-medium truncate"
                                  title={it.description}
                                >
                                  {it.description || '—'}
                                </p>
                                <p className="text-white/60 text-sm">📅 {formatDate(it.due_date)}</p>
                                <p className="text-[rgba(255,176,32,0.95)] text-sm">⏰ {timeText || '—'}</p>
                                <p className="text-white/70 text-sm">
                                  🔁 Repeat: {(() => {
                                    const mode = it.repeat_mode ?? 'once';
                                    if (mode === 'once') return 'Once';
                                    if (mode === 'daily') return 'Daily';
                                    if (mode === 'mon_fri') return 'Mon to Fri';
                                    if (mode === 'custom') {
                                      const csv = it.custom_weekdays ?? '';
                                      const days = String(csv)
                                        .split(',')
                                        .map((x) => Number.parseInt(x, 10))
                                        .filter((n) => !Number.isNaN(n));
                                      const labels: Record<number, string> = {
                                        1: 'Mon',
                                        2: 'Tue',
                                        3: 'Wed',
                                        4: 'Thu',
                                        5: 'Fri',
                                        6: 'Sat',
                                        7: 'Sun',
                                      };
                                      if (!days.length) return 'Custom';
                                      return `Custom (${days.map((d) => labels[d] ?? String(d)).join(', ')})`;
                                    }
                                    return mode;
                                  })()}
                                </p>
                              </div>

                              <div className="shrink-0 mt-0.5">
                                <Switch
                                  checked={it.is_enabled !== false}
                                  onChange={(e) =>
                                    onToggleItem(reminder.id, it.id, e.target.checked)
                                  }
                                  sx={{
                                    '& .MuiSwitch-switchBase.Mui-checked': { color: '#ffb020' },
                                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                      backgroundColor: '#ffb020',
                                    },
                                    '& .MuiSwitch-track': {
                                      backgroundColor: 'rgba(255,176,32,0.35)',
                                    },
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="relative flex items-center justify-end sm:w-auto w-full">
                    <div className="hidden sm:flex items-center">
                      <button
                        type="button"
                        aria-label="Open reminder actions"
                        title="Actions"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuForId(openMenuForId === reminder.id ? null : reminder.id);
                        }}
                        className="inline-flex items-center justify-center w-9 h-9 rounded-lg cursor-pointer hover:bg-white/5 transition"
                      >
                        <span className="text-white/70 text-xl leading-none">⋮</span>
                      </button>

                      {openMenuForId === reminder.id && (
                        <div
                          data-reminder-menu="true"
                          className="absolute right-0 mt-2 w-32 alarm-dropdown rounded-lg shadow-lg overflow-hidden z-10 border border-white/10"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setOpenMenuForId(null);
                              onEdit(reminder);
                            }}
                            className="w-full text-left px-3 py-2 text-sm text-white/85 cursor-pointer hover:bg-white/5"
                          >
                            Edit
                          </button>

                          <div className="h-px bg-white/10" />

                          <button
                            type="button"
                            onClick={() => {
                              setOpenMenuForId(null);
                              onDelete(reminder.id);
                            }}
                            disabled={deletingId === reminder.id}
                            className={`w-full text-left px-3 py-2 text-sm transition ${
                              deletingId === reminder.id
                                ? 'text-white/25 cursor-not-allowed bg-transparent'
                                : 'text-[rgba(255,59,92,0.95)] cursor-pointer hover:bg-[rgba(255,59,92,0.08)]'
                            }`}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="flex sm:hidden gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuForId(null);
                          onEdit(reminder);
                        }}
                        className="alarm-btn alarm-btn--primary text-white px-3 py-2 rounded-lg transition text-sm"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuForId(null);
                          onDelete(reminder.id);
                        }}
                        disabled={deletingId === reminder.id}
                        className={`alarm-btn alarm-btn--danger text-white px-3 py-2 rounded-lg transition text-sm ${
                          deletingId === reminder.id ? 'opacity-60 cursor-not-allowed' : ''
                        }`}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

