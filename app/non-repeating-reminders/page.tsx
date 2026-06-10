'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Switch from '@mui/material/Switch';
import { toast } from 'react-toastify';
import Loading from '@/app/components/Loading';

type ReminderItem = {
  id: number;
  description: string;
  due_date: string;
  remind_before: number;
  remind_unit: string;
  is_sent: boolean;
  is_enabled?: boolean;
  repeat_mode?: 'once' | 'daily' | 'mon_fri' | 'custom' | null;
  custom_weekdays?: string | null;
};

type Reminder = {
  id: number;
  title: string;
  user_email: string;
  phone_number?: string | null;
  is_enabled: boolean;
  created_at: string;
  reminder_items: ReminderItem[];
};

function formatDate(dateString: string) {
  if (!dateString) return '';
  return new Date(dateString).toLocaleString('en-GB', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).replace(',', '');
}

export default function NonRepeatingRemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const refetch = useCallback(async () => {
    const response = await fetch('/api/reminders/getAll', { cache: 'no-store' });
    const data = await response.json();
    setReminders(Array.isArray(data) ? data : []);
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        await refetch();
      } catch (e) {
        console.error('Error fetching reminders:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [refetch]);

  // Simple polling to keep list updated
  useEffect(() => {
    const intervalId = window.setInterval(() => {
      if (document.visibilityState === 'hidden') return;
      refetch().catch((e) => console.error('Polling error:', e));
    }, 10000);

    return () => window.clearInterval(intervalId);
  }, [refetch]);

  const nonRepeatingReminders = useMemo(() => {
    const withOnceItems = reminders
      .map((r) => {
        // Only show items that are 'once' AND have been sent (email message received)
        const items = (r.reminder_items ?? []).filter(
          (it) => (it.repeat_mode ?? 'once') === 'once' && it.is_sent
        );

        return {
          reminder: r,
          onceItems: items,

          // ordering rule: top if only one sub-reminder AND that one is repeat once
          // below if multiple subs-reminders AND (any is repeat once)
          topRank:
            (r.reminder_items?.length ?? 0) === 1 &&
            (r.reminder_items?.some((it) => (it.repeat_mode ?? 'once') === 'once') ?? false)
              ? 0
              : 1,
        };
      })
      .filter((x) => x.onceItems.length > 0);

    withOnceItems.sort((a, b) => {
      if (a.topRank !== b.topRank) return a.topRank - b.topRank;

      // secondary sort: earlier due date first (using min due date of the once items)
      const ad = Math.min(...a.onceItems.map((it) => new Date(it.due_date).getTime() || 0));
      const bd = Math.min(...b.onceItems.map((it) => new Date(it.due_date).getTime() || 0));
      return ad - bd;
    });

    return withOnceItems;
  }, [reminders]);

  const handleToggleParent = async (reminder: Reminder, nextEnabled: boolean) => {
    // optimistic
    setReminders((prev) => prev.map((r) => (r.id === reminder.id ? { ...r, is_enabled: nextEnabled } : r)));

    try {
      const items = reminder.reminder_items ?? [];
      const firstItem = items[0];

      const payload = {
        id: reminder.id,
        title: reminder.title,
        userEmail: reminder.user_email,
        phoneNumber: reminder.phone_number ?? null,
        isEnabled: nextEnabled,
        description: items.map((it) => it.description ?? '').join('|||'),
        dueDate: firstItem?.due_date ?? new Date().toISOString(),
        remindBefore: firstItem?.remind_before ?? 1,
        remindUnit: firstItem?.remind_unit ?? 'days',
        repeatMode: firstItem?.repeat_mode ?? 'once',
        customWeekdays: firstItem?.repeat_mode === 'custom' ? null : null,
        fcmToken: null,
      };

      const res = await fetch('/api/reminders/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error || res.statusText);
      }

      toast.success(nextEnabled ? 'Reminder enabled' : 'Reminder disabled');
      await refetch();
    } catch (e) {
      setReminders((prev) => prev.map((r) => (r.id === reminder.id ? { ...r, is_enabled: !nextEnabled } : r)));
      console.error('Error toggling reminder:', e);
      toast.error('Failed to update reminder toggle');
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="card-neon rounded-lg p-6 mb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">🔕 One-Time Reminders</h1>
              <p className="text-white/60 mt-2 text-sm sm:text-base">Reminders/sub-reminders that are set to repeat Once</p>
            </div>
            <button
              className="alarm-btn alarm-btn--primary cursor-pointer text-white px-4 py-2 rounded-lg transition sm:px-6"
              onClick={() => (window.location.href = '/homepage')}
              type="button"
            >
              Back Home
            </button>
          </div>
        </div>

        {nonRepeatingReminders.length === 0 ? (
          <div className="card-neon rounded-lg p-12 text-center text-white/55">
            <p className="text-lg">No non-repeating reminders yet</p>
            <p className="text-sm mt-2">Create a reminder and set sub-reminder repeat mode to “Once”.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {nonRepeatingReminders.map(({ reminder, onceItems }) => {
              const totalSubs = reminder.reminder_items?.length ?? 0;
              const top =
                totalSubs === 1 && onceItems.length === 1 && (onceItems[0]?.repeat_mode ?? 'once') === 'once';

              return (
                <div key={reminder.id} className="card-neon rounded-lg p-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-white">{reminder.title}</h3>
                        {/* <span className={`alarm-status-badge ${top ? 'alarm-status-badge--current' : 'alarm-status-badge--awaiting'}`}>
                          {top ? 'Top' : 'Below'}
                        </span> */}
                      </div>
                      <p className="text-white/50 text-sm">{reminder.user_email}</p>
                    </div>

                    <div className="flex items-center shrink-0">
                      <Switch
                        className="alarm-switch alarm-switch--parent"
                        checked={!!reminder.is_enabled}
                        onChange={(e) => handleToggleParent(reminder, e.target.checked)}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': { color: '#ffb020' },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#ffb020' },
                          '& .MuiSwitch-track': { backgroundColor: 'rgba(255,176,32,0.35)' },
                        }}
                      />
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    {onceItems.map((it) => (
                      <div key={it.id} className="border border-white/10 rounded-lg p-3">
                        <p className="text-white/80 font-medium truncate" title={it.description}>
                          {it.description}
                        </p>
                        <p className="text-white/60 text-sm">📅 {formatDate(it.due_date)}</p>
                        <p className="text-[rgba(255,176,32,0.95)] text-sm">
                          ⏰ {String(it.remind_before)} {String(it.remind_unit)}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Delete not requested, but keep parity with ability to remove from original page */}
                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      disabled={deletingId === reminder.id}
                      onClick={async () => {
                        setDeletingId(reminder.id);
                        toast.dismiss();
                        try {
                          const toastId = toast.loading('Deleting reminder...');
                          const res = await fetch(`/api/reminders/delete?id=${reminder.id}`, { method: 'DELETE' });
                          if (!res.ok) {
                            const err = await res.json().catch(() => null);
                            throw new Error(err?.error || res.statusText);
                          }
                          await refetch();
                          toast.update(toastId, {
                            render: 'Reminder deleted successfully!',
                            type: 'success',
                            isLoading: false,
                            autoClose: 3000,
                          });
                        } catch (e: unknown) {
                          const msg = e instanceof Error ? e.message : 'Failed to delete reminder';
                          toast.error(msg);
                        } finally {
                          setDeletingId(null);
                        }
                      }}
                      className="alarm-btn alarm-btn--danger text-white px-3 py-2 rounded-lg transition text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

