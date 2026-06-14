'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import Loading from './Loading';
import PopupStatusToast from './PopupStatusToast';

import RepeatDropdown from './RepeatDropdown';

import { requestNotificationPermission } from '@/lib/notifications';
import { supabase } from '@/lib/supabase';
import ReminderList from './home/ReminderList';
import type { Reminder, ReminderItem } from './home/ReminderTypes';



type RepeatMode = 'once' | 'daily' | 'mon_fri' | 'custom';

type DescriptionItem = {
  text: string;
  dueDate: string;
  remindBefore: number;
  remindUnit: string;
  repeatMode: RepeatMode;
  customWeekdays: number[] | null;
};

const unitOptions = [
  { value: 'minutes', label: 'Minutes Before' },
  { value: 'hours', label: 'Hours Before' },
  { value: 'days', label: 'Days Before' },
  { value: 'weeks', label: 'Weeks Before' },
  { value: 'months', label: 'Months Before' },
];

function CustomDropdown({
  value,
  onChange,
  options,
  className = '',
}: {
  value: string;
  onChange: (val: string) => void;
  options: { value: string; label: string; icon?: React.ReactNode }[];
  className?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find((opt) => opt.value === value) || options[0];

  useEffect(() => {
    if (!isOpen) return;
    const handleClick = () => setIsOpen(false);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [isOpen]);

  return (
    <div
      className={`relative w-full ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="alarm-input flex items-center justify-between text-left cursor-pointer w-full h-full"
      >
        <span>{selectedOption.label}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 alarm-dropdown rounded-lg overflow-hidden border border-white/10 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="py-1">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-white/10 ${
                  value === option.value
                    ? 'text-[#ffb020] bg-white/5'
                    : 'text-white/80'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function HomePage() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    descriptions: [
      {
        text: '',
        dueDate: '',
        remindBefore: 1,
        remindUnit: 'days',
        repeatMode: 'once',
        customWeekdays: [1, 2, 3, 4, 5],
      },
    ] as DescriptionItem[],
    userEmail: '',
    phoneNumber: '',
    isEnabled: true,
  });

  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [openMenuForId, setOpenMenuForId] = useState<number | null>(null);
  const router = useRouter();

  const [currentPath] = useState<string>(() => {
    if (typeof window === 'undefined') return '';
    return window.location.pathname;
  });


  const [inlineToast, setInlineToast] = useState<{
    variant: 'success' | 'error';
    title: string;
    message?: string;
    durationMs: number;
  } | null>(null);


  useEffect(() => {
    if (!inlineToast) return;
    const t = window.setTimeout(() => setInlineToast(null), inlineToast.durationMs);
    return () => window.clearTimeout(t);
  }, [inlineToast]);

  const filteredReminders = useMemo(() => {
    const processed = reminders.map((r) => ({ ...r, reminder_items: r.reminder_items ?? [] }));

    return processed
      .map((r) => {
        const items = (r.reminder_items ?? []).filter((it) => {
          const repeatMode = it.repeat_mode ?? 'once';
          // Keep repeating modes always.
          if (repeatMode !== 'once') return true;
          // For "once" items: keep only if NOT sent yet.
          return !it.is_sent;
        });
        return { ...r, reminder_items: items };
      })
      .filter((r) => (r.reminder_items ?? []).length > 0);
  }, [reminders]);

  const refetch = useCallback(async () => {
    try {
      const response = await fetch('/api/reminders/getAll', { cache: 'no-store' });
      const data = await response.json();
      setReminders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error refetching reminders:', error);
    }
  }, []);

  useEffect(() => {
    const initNotifications = async () => {
      const token = await requestNotificationPermission();
      if (token) setFcmToken(token);
    };
    initNotifications();
  }, []);

  useEffect(() => {
    let cancelled = false;

    const checkSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (cancelled) return;

        const session = data?.session;
        if (!session) {
          // Don't interrupt in-app navigation to success/error routes.
          const currentPath = window.location.pathname;
          const currentUrl = window.location.href;
          const isSuccessOrError =
            currentPath.startsWith('/success') ||
            currentPath.startsWith('/error') ||
            currentUrl.includes('/success?') ||
            currentUrl.includes('/error?');

          if (!isSuccessOrError) {
            window.location.href = '/login';
          }
        }
      } catch {
        // Avoid clobbering a redirect that was already triggered.
        if (!window.location.href.includes('/success?') && !window.location.href.includes('/error?')) {
          window.location.href = '/login';
        }
      }
    };

    checkSession();

    return () => {
      cancelled = true;
    };
  }, []);


  useEffect(() => {
    const loadReminders = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/reminders/getAll');
        const data = await response.json();
        setReminders(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching reminders:', error);
      } finally {
        setLoading(false);
      }
    };

    loadReminders();
  }, []);

  useEffect(() => {
    let cancelled = false;

    const poll = async () => {
      if (cancelled) return;
      if (document.visibilityState === 'hidden') return;

      try {
        const response = await fetch('/api/reminders/getAll', { cache: 'no-store' });
        const data = await response.json();
        if (!Array.isArray(data)) return;

        setReminders((prev) => {
          if (!Array.isArray(prev)) return data;
          if (prev.length !== data.length) return data;

          for (let i = 0; i < prev.length; i++) {
            const a = prev[i];
            const b = data[i];
            if (a.id !== b.id) return data;

            const aItems = a.reminder_items ?? [];
            const bItems = b.reminder_items ?? [];
            if (aItems.length !== bItems.length) return data;

            for (let j = 0; j < aItems.length; j++) {
              if (aItems[j].is_sent !== bItems[j].is_sent) return data;
              if (aItems[j].due_date !== bItems[j].due_date) return data;
            }
          }

          return prev;
        });
      } catch (error) {
        console.error('Polling error:', error);
      }
    };

    poll();
    const intervalId = window.setInterval(poll, 10000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    const handleDocumentMouseDown = (e: MouseEvent) => {
      if (openMenuForId === null) return;
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const menuContainer = target.closest('[data-reminder-menu="true"]');
      if (menuContainer) return;

      setOpenMenuForId(null);
    };

    document.addEventListener('mousedown', handleDocumentMouseDown);
    return () => document.removeEventListener('mousedown', handleDocumentMouseDown);
  }, [openMenuForId]);

  const resetForm = () => {
    setFormData({
      title: '',
      descriptions: [
        {
          text: '',
          dueDate: '',
          remindBefore: 1,
          remindUnit: 'days',
          repeatMode: 'once',
          customWeekdays: [1, 2, 3, 4, 5],
        },
      ],
      userEmail: '',
      phoneNumber: '',
      isEnabled: true,
    });
  };

  const updateDescriptionField = (index: number, patch: Partial<DescriptionItem>) => {
    setFormData((prev) => {
      const next = [...prev.descriptions];
      next[index] = { ...next[index], ...patch };
      return { ...prev, descriptions: next };
    });
  };

  const addDescriptionField = () => {
    setFormData((prev) => {
      const last = prev.descriptions[prev.descriptions.length - 1];

      const isIncomplete =
        !last.text.trim() || !last.dueDate || !last.remindBefore || !last.remindUnit;
      if (isIncomplete) return prev;

      return {
        ...prev,
        descriptions: [
          ...prev.descriptions,
          {
            text: '',
            dueDate: '',
            remindBefore: 1,
            remindUnit: 'days',
            repeatMode: 'once',
            customWeekdays: [1, 2, 3, 4, 5],
          },
        ],
      };
    });
  };

  const removeDescriptionField = (index: number) => {
    if (index === 0) return;
    setFormData((prev) => ({
      ...prev,
      descriptions: prev.descriptions.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {

      const items = formData.descriptions
        .map((d) => {
          const date = new Date(d.dueDate);
          if (isNaN(date.getTime())) return null;

          const customWeekdaysCsv = (d.customWeekdays ?? [])
            .slice()
            .sort((a, b) => a - b)
            .join(',');

          return {
            text: d.text,
            dueDate: date.toISOString(),
            remindBefore: d.remindBefore,
            remindUnit: d.remindUnit,
            repeatMode: d.repeatMode,
            customWeekdays: d.repeatMode === 'custom' ? customWeekdaysCsv : null,
          };
        })
        .filter(Boolean) as {
        text: string;
        dueDate: string;
        remindBefore: number;
        remindUnit: string;
      }[];

      if (items.length === 0 || items.every((i) => !i.text || !i.text.trim())) return;

      const response = await fetch('/api/reminders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          userEmail: formData.userEmail,
          phoneNumber: formData.phoneNumber || null,
          fcmToken,
          isEnabled: formData.isEnabled,
          items,
        }),
      });

      if (!response.ok) {
        let message = 'Failed to create reminder';
        try {
          message = await response.text();
        } catch {
          // ignore
        }
        setInlineToast({ variant: 'error', title: 'Something went wrong', message, durationMs: 4500 });
        return;
      }

      resetForm();
      setShowForm(false);

      await refetch();

      // Popup after modal closes (no redirect)
      setInlineToast({
        variant: 'success',
        title: 'Success',
        message: 'Your reminder was created successfully.',
        durationMs: 3500,
      });

    } catch (error) {
      console.error('Error adding reminder:', error);
      setInlineToast({
        variant: 'error',
        title: 'Something went wrong',
        message: 'Failed to create reminder',
        durationMs: 4500,
      });
    }

  };

  const handleEditClick = async (reminder: Reminder) => {
    try {
      const response = await fetch(`/api/reminders?id=${reminder.id}`);
      if (!response.ok) throw new Error(await response.text());

      const latestReminder = await response.json();
      setEditingReminder(latestReminder);

      const items: ReminderItem[] = Array.isArray(latestReminder.reminder_items)
        ? (latestReminder.reminder_items as ReminderItem[])
        : [];

      const toLocalDateTimeInput = (utcISOString?: string) => {
        if (!utcISOString) return '';
        const d = new Date(String(utcISOString));
        if (isNaN(d.getTime())) return '';
        return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 16);
      };

      const descriptions: DescriptionItem[] = items.length
        ? items.map((it) => ({
            text: it.description ?? '',
            dueDate: toLocalDateTimeInput(it.due_date),
            remindBefore: it.remind_before ?? 1,
            remindUnit: it.remind_unit ?? 'days',
            repeatMode: (it.repeat_mode as RepeatMode) || 'once',
            customWeekdays: it.custom_weekdays
              ? String(it.custom_weekdays)
                  .split(',')
                  .map((x) => Number.parseInt(x, 10))
                  .filter((n) => n >= 1 && n <= 7)
              : [1, 2, 3, 4, 5],
          }))
        : [
            {
              text: '',
              dueDate: '',
              remindBefore: 1,
              remindUnit: 'days',
              repeatMode: 'once',
              customWeekdays: [1, 2, 3, 4, 5],
            },
          ];

      setFormData({
        title: latestReminder.title ?? '',
        descriptions,
        userEmail: latestReminder.user_email ?? '',
        phoneNumber: latestReminder.phoneNumber || '',
        isEnabled:
          typeof latestReminder.is_enabled === 'boolean' ? latestReminder.is_enabled : true,
      });

      setShowEditForm(true);
    } catch (error) {
      console.error('Error loading reminder for edit:', error);
    }
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReminder) return;

    try {

      const firstDueDate = formData.descriptions[0]?.dueDate;
      const date = new Date(firstDueDate);
      if (isNaN(date.getTime())) return;

      const utcDueDate = date.toISOString();

      const response = await fetch('/api/reminders/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingReminder.id,
          title: formData.title,
          userEmail: formData.userEmail,
          phoneNumber: formData.phoneNumber || null,
          isEnabled: formData.isEnabled,
          fcmToken,
          descriptions: formData.descriptions
            .map((d) => {
              const date = new Date(d.dueDate);
              if (isNaN(date.getTime())) return null;

              return {
                text: d.text,
                dueDate: date.toISOString(),
                remindBefore: d.remindBefore,
                remindUnit: d.remindUnit,
                repeatMode: d.repeatMode,
                customWeekdays:
                  d.repeatMode === 'custom'
                    ? (d.customWeekdays ?? [])
                        .slice()
                        .sort((a, b) => a - b)
                        .join(',')
                    : null,
              };
            })
            .filter((x): x is NonNullable<typeof x> => x != null) as {
            text: string;
            dueDate: string;
            remindBefore: number;
            remindUnit: string;
          }[],
          description: formData.descriptions.map((d) => d.text).filter((text) => text.trim() !== '').join('|||'),
          dueDate: utcDueDate,
          remindBefore: formData.descriptions[0]?.remindBefore || 1,
          remindUnit: formData.descriptions[0]?.remindUnit || 'days',
          repeatMode: formData.descriptions[0]?.repeatMode ?? 'once',
          customWeekdays:
            formData.descriptions[0]?.repeatMode === 'custom'
              ? (formData.descriptions[0]?.customWeekdays ?? [])
                  .slice()
                  .sort((a, b) => a - b)
                  .join(',')
              : null,
        }),
      });

      if (!response.ok) {
        let message = 'Failed to update reminder';
        try {
          message = await response.text();
        } catch {
          // ignore
        }
        setInlineToast({
          variant: 'error',
          title: 'Something went wrong',
          message,
          durationMs: 4500,
        });
        return;
      }


      resetForm();
      setEditingReminder(null);
      setShowEditForm(false);
      await refetch();

      // Popup after modal closes (no redirect)
      setInlineToast({
        variant: 'success',
        title: 'Success',
        message: 'Your reminder was updated successfully.',
        durationMs: 3500,
      });

    } catch (error) {
      console.error('Error updating reminder:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (deletingId === id) return;

    setDeletingId(id);

    try {
      const response = await fetch(`/api/reminders/delete?id=${id}`, { method: 'DELETE' });
      if (!response.ok) return;
      await refetch();
    } catch (error) {
      console.error('Error deleting reminder:', error);
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString)
      .toLocaleString('en-GB', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      })
      .replace(',', '');
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) return;
      window.location.href = '/login';
    } catch {
      window.location.href = '/login';
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen">
      {inlineToast ? (
        <PopupStatusToast
          variant={inlineToast.variant}
          title={inlineToast.title}
          message={inlineToast.message}
          durationMs={inlineToast.durationMs}
          onClose={() => setInlineToast(null)}
        />
      ) : null}


      {(currentPath === '/404' || currentPath === '/not-found') && (
        <div className="absolute inset-0 z-[60] bg-[#070912]/50 flex items-center justify-center p-6">
          <div className="card-neon rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold text-white">404 - Page not found</h2>
            <p className="text-white/60 mt-2">
              The page you’re looking for doesn’t exist or the link is broken.
            </p>
            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={() => (window.location.href = '/')}
                className="alarm-btn alarm-btn--primary cursor-pointer text-white px-4 py-2 rounded-lg transition"
              >
                Go Home
              </button>
              <button
                type="button"
                onClick={() => (window.location.href = '/login')}
                className="alarm-btn alarm-btn--ghost cursor-pointer text-white px-4 py-2 rounded-lg transition"
              >
                Login
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#070912]/70 backdrop-blur shadow-[0_8px_30px_rgba(0,0,0,0.45)] px-4 py-3">

        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center justify-start flex-1 min-w-0">
              <div className="text-white font-semibold text-sm sm:text-base truncate">Reminder App</div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => (window.location.href = '/settings')}
                className="alarm-btn alarm-btn--ghost cursor-pointer text-white text-sm px-2.5 py-1.5 rounded-lg transition"
              >
                Settings
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="alarm-btn alarm-btn--danger cursor-pointer text-white text-sm px-2.5 py-1.5 rounded-lg transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 pt-6">
        <div className="card-neon rounded-lg p-6 mb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">⏰ Reminder App</h1>
              <p className="text-white/60 mt-2 text-sm sm:text-base">Never miss important events or payments again</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => {
                  window.location.href = '/non-repeating-reminders';
                }}
                className="alarm-btn alarm-btn--ghost cursor-pointer text-white px-4 py-2 rounded-lg transition sm:px-6"
              >
                🔕 One-Time Reminders
              </button>

              <button
                type="button"
                onClick={() => setShowForm(!showForm)}
                className={`${showForm ? 'alarm-btn alarm-btn--danger' : 'alarm-btn alarm-btn--primary'} cursor-pointer text-white px-4 py-2 rounded-lg transition sm:px-6`}
              >
                {showForm ? 'Cancel' : '+ Add Reminder'}
              </button>
            </div>
          </div>
        </div>

        {showForm && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="card-neon rounded-lg p-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-white/90">Add New Reminder</h2>
                  <button
                    onClick={() => setShowForm(false)}
                    className="text-white/50 hover:text-white transition text-2xl"
                  >
                    &times;
                  </button>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-1">Title *</label>
                      <input
                        type="text"
                        required
                        className="alarm-input"
                        value={formData.title}
                        onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                        placeholder="e.g., Pay electricity bill"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-1">Your Email *</label>
                      <input
                        type="email"
                        required
                        className="alarm-input"
                        value={formData.userEmail}
                        onChange={(e) => setFormData((p) => ({ ...p, userEmail: e.target.value }))}
                        placeholder="you@example.com"
                      />
                    </div>

                    <div className="md:col-span-2">
                      {/* <div className="flex items-center justify-between gap-3 mb-3">
                        <label className="block text-sm font-medium text-white/70">Label (add multiple labels)</label>

                        <button
                          type="button"
                          aria-label="Add another description"
                          title="Add description"
                          onClick={addDescriptionField}
                          className="flex-shrink-0 inline-flex items-center justify-center w-11 h-11 rounded-lg alarm-btn alarm-btn--ghost text-white hover:scale-105 transition"
                        >
                          <span className="text-2xl leading-none">+</span>
                        </button>
                      </div> */}

                      <div className="flex items-center gap-3 mb-3">
  <button
    type="button"
    aria-label="Add another description"
    title="Add description"
    onClick={addDescriptionField}
    className="flex-shrink-0 inline-flex items-center justify-center w-11 h-11 rounded-lg alarm-btn alarm-btn--ghost text-white hover:scale-105 transition"
  >
    <span className="text-2xl leading-none">+</span>
  </button>

  <label className="block text-sm font-medium text-white/70">
    Label (edit multiple labels)
  </label>
</div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {formData.descriptions.map((desc, index) => (
                          <div key={index} className="rounded-lg border border-white/10 p-4">
                            <div className="flex items-end gap-2 mb-3">
                              <div className="flex-1">
                                <label className="block text-sm font-medium text-white/70 mb-1">Label {index + 1}</label>
                                <input
                                  type="text"
                                  className="alarm-input"
                                  value={desc.text}
                                  onChange={(e) =>
                                    updateDescriptionField(index, { text: e.target.value })}
                                  placeholder={
                                    index === 0
                                      ? 'Additional details'
                                      : `Additional details ${index + 1}`
                                  }
                                />
                              </div>

                              <div className="flex items-center gap-2">
                                {/* {index === formData.descriptions.length - 1 && (
                                  <button
                                    type="button"
                                    aria-label="Add another description"
                                    title="Add description"
                                    onClick={addDescriptionField}
                                    className="flex-shrink-0 inline-flex items-center justify-center w-11 h-11 rounded-lg alarm-btn alarm-btn--ghost text-white hover:scale-105 transition"
                                  >
                                    <span className="text-2xl leading-none">+</span>
                                  </button>
                                )} */}

                                {index !== 0 && (
                                  <button
                                    type="button"
                                    aria-label={`Delete description ${index + 1}`}
                                    title="Delete"
                                    onClick={() => removeDescriptionField(index)}
                                    className="flex-shrink-0 inline-flex items-center justify-center w-11 h-11 rounded-lg alarm-btn alarm-btn--ghost text-white/90 hover:text-white transition"
                                  >
                                    <span className="text-xl leading-none">×</span>
                                  </button>
                                )}
                              </div>
                            </div>

                            <div className="space-y-3">
                              <div>
                                <label className="block text-sm font-medium text-white/70 mb-1">Due Date &amp; Time *</label>
                                <input
                                  type="datetime-local"
                                  required
                                  className="alarm-input"
                                  value={desc.dueDate}
                                  onChange={(e) => updateDescriptionField(index, { dueDate: e.target.value })}
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-white/70 mb-1">Remind Me * </label>
                                <div className="flex gap-2 items-stretch mb-4">
                                  <input
                                    type="number"
                                    min="1"
                                    required
                                    className="flex-1 alarm-input"
                                    value={String(desc.remindBefore)}
                                    onChange={(e) => {
                                      const raw = e.target.value;
                                      const next = raw === '' ? 0 : Number.parseInt(raw, 10);
                                      updateDescriptionField(index, { remindBefore: next });
                                    }}
                                  />
                                  <CustomDropdown
                                    value={desc.remindUnit}
                                    onChange={(val) => updateDescriptionField(index, { remindUnit: val })}
                                    options={unitOptions}
                                    className="flex-1"
                                  />
                                </div>

                                <div>
                                <label className="block text-sm font-medium text-white/70 mb-1">Repeat *</label>
                                <RepeatDropdown
                                  value={desc.repeatMode}
                                  customWeekdays={
                                    desc.repeatMode === 'custom' ? desc.customWeekdays ?? undefined : undefined
                                  }
                                  onChange={(repeatMode, customWeekdays) => {
                                    updateDescriptionField(index, {
                                      repeatMode,
                                      customWeekdays: customWeekdays ?? [],
                                    });
                                  }}
                                />
                                </div>
                                
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="p-0 flex flex-col">
                        <label className="block text-sm font-medium text-white/70 mb-1">Phone Number (for SMS - optional)</label>
                        <input
                          type="tel"
                          className="alarm-input"
                          placeholder="e.g., +1234567890 or 0712345678"
                          value={formData.phoneNumber}
                          onChange={(e) =>
                            setFormData((p) => ({ ...p, phoneNumber: e.target.value }))}
                        />
                        <p className="text-sm text-white/45 mt-2">Include country code for SMS notifications</p>
                      </div>

                      <div className="mt-2 sm:col-span-2 lg:col-span-2">
                        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                          <button
                            type="submit"
                            className="alarm-btn alarm-btn--primary cursor-pointer text-white px-4 py-2 rounded-lg transition sm:px-6"
                          >
                            Create Reminder
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              resetForm();
                              setShowForm(false);
                            }}
                            className="alarm-btn alarm-btn--danger cursor-pointer text-white px-4 py-2 rounded-lg transition sm:px-6"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {showEditForm && editingReminder && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="card-neon rounded-lg p-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-white/90">Edit Reminder</h2>
                  <button
                    onClick={() => {
                      setShowEditForm(false);
                      setEditingReminder(null);
                    }}
                    className="text-white/50 hover:text-white transition text-2xl"
                  >
                    &times;
                  </button>
                </div>

                <form onSubmit={handleUpdateSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-1">Title *</label>
                      <input
                        type="text"
                        required
                        className="alarm-input"
                        value={formData.title}
                        onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                        placeholder="e.g., Pay electricity bill"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-1">Your Email *</label>
                      <input
                        type="email"
                        required
                        className="alarm-input"
                        value={formData.userEmail}
                        onChange={(e) => setFormData((p) => ({ ...p, userEmail: e.target.value }))}
                        placeholder="you@example.com"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <div className="flex items-center justify-start gap-3 mb-3">
                        <button
    type="button"
    aria-label="Add another description"
    title="Add description"
    onClick={addDescriptionField}
    className="flex-shrink-0 inline-flex items-center justify-center w-11 h-11 rounded-lg alarm-btn alarm-btn--ghost text-white hover:scale-105 transition"
  >
    <span className="text-2xl leading-none">+</span>
  </button>
                        <label className="block text-sm font-medium text-white/70">Label (edit multiple labels)</label>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {formData.descriptions.map((desc, index) => (
                          <div key={index} className="rounded-lg border border-white/10 p-4">
                            <div className="flex items-end gap-2 mb-3">
                              <div className="flex-1">
                                <label className="block text-sm font-medium text-white/70 mb-1">Label {index + 1}</label>
                                <input
                                  type="text"
                                  className="alarm-input"
                                  value={desc.text}
                                  onChange={(e) =>
                                    updateDescriptionField(index, { text: e.target.value })}
                                  placeholder={
                                    index === 0
                                      ? 'Additional details'
                                      : `Additional details ${index + 1}`
                                  }
                                />
                              </div>

                              <div className="flex items-center gap-2">
                               

                                {index !== 0 && (
                                  <button
                                    type="button"
                                    aria-label={`Delete description ${index + 1}`}
                                    title="Delete"
                                    onClick={() => removeDescriptionField(index)}
                                    className="flex-shrink-0 inline-flex items-center justify-center w-11 h-11 rounded-lg alarm-btn alarm-btn--ghost text-white/90 hover:text-white transition"
                                  >
                                    <span className="text-xl leading-none">×</span>
                                  </button>
                                )}
                              </div>
                            </div>

                            <div className="space-y-3">
                              <div>
                                <label className="block text-sm font-medium text-white/70 mb-1">Due Date &amp; Time *</label>
                                <input
                                  type="datetime-local"
                                  required
                                  className="alarm-input"
                                  value={desc.dueDate}
                                  onChange={(e) => updateDescriptionField(index, { dueDate: e.target.value })}
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-white/70 mb-1">Remind Me *</label>
                                <div className="flex gap-2 items-stretch mb-4">
                                  <input
                                    type="number"
                                    min="1"
                                    required
                                    className="flex-1 alarm-input"
                                    value={String(desc.remindBefore)}
                                    onChange={(e) => {
                                      const raw = e.target.value;
                                      const next = raw === '' ? 0 : Number.parseInt(raw, 10);
                                      updateDescriptionField(index, { remindBefore: next });
                                    }}
                                  />
                                  <CustomDropdown
                                    value={desc.remindUnit}
                                    onChange={(val) => updateDescriptionField(index, { remindUnit: val })}
                                    options={unitOptions}
                                    className="flex-1"
                                  />
                                </div>

                                <div>
                                <label className="block text-sm font-medium text-white/70 mb-1">Repeat *</label>
                                 <RepeatDropdown
                                  value={desc.repeatMode}
                                  customWeekdays={
                                    desc.repeatMode === 'custom' ? desc.customWeekdays ?? undefined : undefined
                                  }
                                  onChange={(repeatMode, customWeekdays) => {
                                    updateDescriptionField(index, {
                                      repeatMode,
                                      customWeekdays: customWeekdays ?? [],
                                    });
                                  }}
                                />
                                </div>
                               
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="p-0 flex flex-col">
                        <label className="block text-sm font-medium text-white/70 mb-1">Phone Number (for SMS - optional)</label>
                        <input
                          type="tel"
                          className="alarm-input"
                          placeholder="e.g., +1234567890 or 0712345678"
                          value={formData.phoneNumber}
                          onChange={(e) =>
                            setFormData((p) => ({ ...p, phoneNumber: e.target.value }))}
                        />
                        <p className="text-sm text-white/45 mt-2">Include country code for SMS notifications</p>
                      </div>

                      <div className="mt-2 sm:col-span-2 lg:col-span-2">
                        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                          <button
                            type="submit"
                            className="alarm-btn alarm-btn--primary cursor-pointer text-white px-4 py-2 rounded-lg transition sm:px-6"
                          >
                            Update Reminder
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowEditForm(false);
                              setEditingReminder(null);
                            }}
                            className="alarm-btn alarm-btn--danger cursor-pointer text-white px-4 py-2 rounded-lg transition sm:px-6"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6">
          <ReminderList
            reminders={filteredReminders}
            fcmToken={fcmToken}
            openMenuForId={openMenuForId}
            deletingId={deletingId}
            setOpenMenuForId={setOpenMenuForId}
            onEdit={handleEditClick}
            onDelete={handleDelete}
            onToggleParent={async (r, nextEnabled) => {
              try {
                const res = await fetch('/api/reminders/toggle-parent', {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ id: r.id, isEnabled: nextEnabled }),
                });
                if (!res.ok) return;
                await refetch();
              } catch (e) {
                console.error(e);
              }
            }}
            onToggleItem={async (parentId, itemId, nextEnabled) => {
              try {
                const res = await fetch('/api/reminders/toggle-item', {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ id: itemId, parent_id: parentId, isEnabled: nextEnabled }),
                });
                if (!res.ok) return;
                await refetch();
              } catch (e) {
                console.error(e);
              }
            }}
            formatDate={formatDate}
          />
        </div>
      </div>
    </div>
  );
}

