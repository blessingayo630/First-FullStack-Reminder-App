'use client';

import { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Loading from './Loading';
import { requestNotificationPermission } from '@/lib/notifications';
import Switch from '@mui/material/Switch';


type ReminderItem = {
  id: number;
  description: string;
  due_date: string;
  remind_before: number;
  remind_unit: string;
  is_sent: boolean;
  is_enabled?: boolean;
};


type Reminder = {
  id: number;
  title: string;
  user_email: string;
  phone_number?: string;
  is_enabled: boolean;
  created_at: string;
  reminder_items: ReminderItem[];
};

type DescriptionItem = {
  text: string;
  dueDate: string; // datetime-local (local)
  remindBefore: number;
  remindUnit: string;
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
  options: { value: string; label: string }[];
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
    <div className={`relative w-full ${className}`} onClick={(e) => e.stopPropagation()}>
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
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
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
                  value === option.value ? 'text-[#ffb020] bg-white/5' : 'text-white/80'
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

export default function Home() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);

  // Form state (Add + Edit share the same state)
  const [formData, setFormData] = useState({
    title: '',
    descriptions: [
      {
        text: '',
        dueDate: '',
        remindBefore: 1,
        remindUnit: 'days',
      },
    ] as DescriptionItem[],
    userEmail: '',
    phoneNumber: '',
    isEnabled: true,
  });

  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [openMenuForId, setOpenMenuForId] = useState<number | null>(null);

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

  // Initial load
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

  // Polling
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

  // Click-outside for actions menu
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

      const isIncomplete = !last.text.trim() || !last.dueDate || !last.remindBefore || !last.remindUnit;
      if (isIncomplete) {
        toast.warn('Please complete Description, Due Date and Remind Me first');
        return prev;
      }

      return {
        ...prev,
        descriptions: [
          ...prev.descriptions,
          {
            text: '',
            dueDate: '',
            remindBefore: 1,
            remindUnit: 'days',
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
          return {
            text: d.text,
            dueDate: date.toISOString(),
            remindBefore: d.remindBefore,
            remindUnit: d.remindUnit,
          };
        })
        .filter(Boolean) as {
        text: string;
        dueDate: string;
        remindBefore: number;
        remindUnit: string;
      }[];

      if (items.length === 0 || items.every((i) => !i.text || !i.text.trim())) {
        toast.error('Please add at least one description');
        return;
      }

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
        const error = await response.json().catch(() => null);
        toast.error(`Error: ${error?.error || response.statusText}`);
        return;
      }

      resetForm();
      setShowForm(false);
      refetch();
      toast.success('Reminder added successfully!');
    } catch (error) {
      console.error('Error adding reminder:', error);
      toast.error('Failed to add reminder');
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
        return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
      };

      const descriptions: DescriptionItem[] = items.length
        ? items.map((it) => ({
            text: it.description ?? '',
            dueDate: toLocalDateTimeInput(it.due_date),
            remindBefore: it.remind_before ?? 1,
            remindUnit: it.remind_unit ?? 'days',
          }))
        : [
            {
              text: '',
              dueDate: '',
              remindBefore: 1,
              remindUnit: 'days',
            },
          ];

      setFormData({
        title: latestReminder.title ?? '',
        descriptions,
        userEmail: latestReminder.user_email ?? '',
        phoneNumber: latestReminder.phoneNumber || '',
        isEnabled: typeof latestReminder.is_enabled === 'boolean' ? latestReminder.is_enabled : true,
      });

      setShowEditForm(true);
    } catch (error) {
      console.error('Error loading reminder for edit:', error);
      toast.error('Failed to load reminder');
    }
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReminder) return;

    try {
      const firstDueDate = formData.descriptions[0]?.dueDate;
      const date = new Date(firstDueDate);
      if (isNaN(date.getTime())) {
        toast.error('Invalid date');
        return;
      }

      const utcDueDate = date.toISOString();

      const response = await fetch('/api/reminders/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingReminder.id,
          title: formData.title,
          description: formData.descriptions
            .map((d) => d.text)
            .filter((text) => text.trim() !== '')
            .join('|||'),
          dueDate: utcDueDate,
          remindBefore: formData.descriptions[0]?.remindBefore || 1,
          remindUnit: formData.descriptions[0]?.remindUnit || 'days',
          userEmail: formData.userEmail,
          phoneNumber: formData.phoneNumber || null,
          isEnabled: formData.isEnabled,
          fcmToken,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        toast.error(`Error: ${error?.error || response.statusText}`);
        return;
      }

      resetForm();
      setEditingReminder(null);
      setShowEditForm(false);
      refetch();
      toast.success('Reminder updated successfully!');
    } catch (error) {
      console.error('Error updating reminder:', error);
      toast.error('Failed to update reminder');
    }
  };

  const handleDelete = async (id: number) => {
    if (deletingId === id) return;

    setDeletingId(id);
    toast.dismiss();

    try {
      const toastId = toast.loading('Deleting reminder...');

      const response = await fetch(`/api/reminders/delete?id=${id}`, { method: 'DELETE' });
      if (!response.ok) {
        const error = await response.json().catch(() => null);
        toast.update(toastId, {
          render: error?.error ? `Error: ${error.error}` : 'Failed to delete reminder',
          type: 'error',
          isLoading: false,
          autoClose: 5000,
        });
        return;
      }

      await refetch();
      toast.update(toastId, {
        render: 'Reminder deleted successfully!',
        type: 'success',
        isLoading: false,
        autoClose: 3000,
      });
    } catch (error) {
      console.error('Error deleting reminder:', error);
      toast.error('Failed to delete reminder');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString('en-GB', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).replace(',', '');
  };

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="card-neon rounded-lg p-6 mb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">⏰ Reminder App</h1>
              <p className="text-white/60 mt-2 text-sm sm:text-base">Never miss important events or payments again</p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className={`${showForm ? 'alarm-btn alarm-btn--danger' : 'alarm-btn alarm-btn--primary'} cursor-pointer text-white px-4 py-2 rounded-lg transition sm:px-6`}
            >
              {showForm ? 'Cancel' : '+ Add Reminder'}
            </button>
          </div>
        </div>

        {showForm && (
          <div className="card-neon rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-white/90">Add New Reminder</h2>
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
                  <label className="block text-sm font-medium text-white/70 mb-3">
                    Descriptions (each has its own Due Date &amp; Remind Me)
                  </label>

                  {/* IMPORTANT: small = 1 column, large = 2 columns */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {formData.descriptions.map((desc, index) => (
                      <div key={index} className="rounded-lg border border-white/10 p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-white/70 mb-1">Description {index + 1}</label>
                            <input
                              type="text"
                              className="alarm-input"
                              value={desc.text}
                              onChange={(e) => updateDescriptionField(index, { text: e.target.value })}
                              placeholder={index === 0 ? 'Additional details' : `Additional details ${index + 1}`}
                            />
                          </div>

                          <div className="flex items-center gap-2">
                            {index === formData.descriptions.length - 1 && (
                              <button
                                type="button"
                                aria-label="Add another description"
                                title="Add description"
                                onClick={addDescriptionField}
                                className="flex-shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-lg alarm-btn alarm-btn--ghost text-white hover:scale-105 transition"
                              >
                                <span className="text-2xl leading-none">+</span>
                              </button>
                            )}

                            {index !== 0 && (
                              <button
                                type="button"
                                aria-label={`Delete description ${index + 1}`}
                                title="Delete"
                                onClick={() => removeDescriptionField(index)}
                                className="flex-shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-lg alarm-btn alarm-btn--ghost text-white/90 hover:text-white transition"
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
                            <div className="flex gap-2 items-stretch">
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
                          </div>
                        </div>
                      </div>
                    ))}

                    <div className="rounded-lg border border-white/10 p-4">
                      <label className="block text-sm font-medium text-white/70 mb-1">Phone Number (for SMS - optional)</label>
                      <input
                        type="tel"
                        className="alarm-input"
                        placeholder="e.g., +1234567890 or 0712345678"
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData((p) => ({ ...p, phoneNumber: e.target.value }))}
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
              </div>
            </form>
          </div>
        )}

        {showEditForm && editingReminder && (
          <div className="card-neon rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-white/90">Edit Reminder</h2>
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
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-white/70 mb-3">Descriptions (Edit)</label>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {formData.descriptions.map((desc, index) => (
                      <div key={index} className="rounded-lg border border-white/10 p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-white/70 mb-1">Description {index + 1}</label>
                            <input
                              type="text"
                              className="alarm-input"
                              value={desc.text}
                              onChange={(e) => updateDescriptionField(index, { text: e.target.value })}
                              placeholder={index === 0 ? 'Additional details' : `Additional details ${index + 1}`}
                            />
                          </div>

                          <div className="flex items-center gap-2">
                            {index === formData.descriptions.length - 1 && (
                              <button
                                type="button"
                                aria-label="Add another description"
                                title="Add description"
                                onClick={addDescriptionField}
                                className="flex-shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-lg alarm-btn alarm-btn--ghost text-white hover:scale-105 transition"
                              >
                                <span className="text-2xl leading-none">+</span>
                              </button>
                            )}

                            {index !== 0 && (
                              <button
                                type="button"
                                aria-label={`Delete description ${index + 1}`}
                                title="Delete"
                                onClick={() => removeDescriptionField(index)}
                                className="flex-shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-lg alarm-btn alarm-btn--ghost text-white/90 hover:text-white transition"
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
                            <div className="flex gap-2 items-stretch">
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
                          </div>
                        </div>
                      </div>
                    ))}

                    <div className="rounded-lg border border-white/10 p-4">
                      <label className="block text-sm font-medium text-white/70 mb-1">Phone Number (for SMS - optional)</label>
                      <input
                        type="tel"
                        className="alarm-input"
                        placeholder="e.g., +1234567890 or 0712345678"
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData((p) => ({ ...p, phoneNumber: e.target.value }))}
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
                            resetForm();
                            setEditingReminder(null);
                            setShowEditForm(false);
                          }}
                          className="alarm-btn alarm-btn--danger cursor-pointer text-white px-4 py-2 rounded-lg transition sm:px-6"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        )}

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
            <div className="divide-y divide-white/10">
              {reminders.map((reminder) => (
                <div key={reminder.id} className="p-6 alarm-list-item">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="text-lg font-semibold text-white">{reminder.title}</h3>
                          <p className="text-white/50 text-sm">{reminder.user_email}</p>
                        </div>

                        {/* Parent reminder enabled toggle (styled/positioned to match pre-switch layout) */}
                        <div className="flex items-center shrink-0">
                            <Switch
                            className="alarm-switch alarm-switch--parent"
checked={!!reminder.is_enabled}

                            onChange={async (e) => {
                              const nextEnabled = e.target.checked;

                              try {
                                // Optimistic UI update
                                setReminders((prev) =>
                                  prev.map((r) =>
                                    r.id === reminder.id ? { ...r, is_enabled: nextEnabled } : r
                                  )
                                );

                                // Include existing reminder data because update endpoint also updates reminder_items
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
                                  fcmToken,
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
                              } catch (error) {
                                // Revert on failure
                                setReminders((prev) =>
                                  prev.map((r) =>
                                    r.id === reminder.id ? { ...r, is_enabled: !nextEnabled } : r
                                  )
                                );
                                console.error('Error toggling reminder:', error);
                                toast.error('Failed to update reminder toggle');
                              }
                            }}
                            sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#ffb020' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#ffb020' }, '& .MuiSwitch-track': { backgroundColor: 'rgba(255,176,32,0.35)' } }}
                          />
                        </div>

                      </div>

                      <div className="mt-3 space-y-3">
                        {reminder.reminder_items?.map((item) => (
                          <div key={item.id} className="border border-white/10 rounded-lg p-3">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p
                                  className="text-white/80 font-medium truncate max-w-full"
                                  title={item.description}
                                >
                                  {item.description}
                                </p>
                                <p className="text-white/60 text-sm">📅 {formatDate(item.due_date)}</p>
                                <p className="text-[rgba(255,176,32,0.95)] text-sm">
                                  ⏰ {item.remind_before} {item.remind_unit}
                                </p>
                              </div>

                              {/* Item enable toggle (no longer absolute/overlapping) */}
                              <div className="shrink-0 mt-0.5">
                                  <Switch
                                  checked={item.is_enabled !== false}
                                  onChange={async (e) => {

                                    const nextEnabled = e.target.checked;
                                    try {
                                      // Optimistic UI update
                                      setReminders((prev) =>
                                        prev.map((r) =>
                                          r.id === reminder.id
                                            ? {
                                                ...r,
                                                reminder_items: (r.reminder_items ?? []).map((it) =>
                                                  it.id === item.id ? { ...it, is_enabled: nextEnabled } : it
                                                ),
                                              }
                                            : r
                                        )
                                      );

                                      const res = await fetch('/api/reminders/toggle-item', {
                                        method: 'PUT',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ id: item.id, isEnabled: nextEnabled }),
                                      });

                                      if (!res.ok) {
                                        const err = await res.json().catch(() => null);
                                        throw new Error(err?.error || res.statusText);
                                      }

                                      toast.success(nextEnabled ? 'Description enabled' : 'Description disabled');
                                      await refetch();
                                    } catch (error) {
                                      // Revert on failure
                                      setReminders((prev) =>
                                        prev.map((r) =>
                                          r.id === reminder.id
                                            ? {
                                                ...r,
                                                reminder_items: (r.reminder_items ?? []).map((it) =>
                                                  it.id === item.id ? { ...it, is_enabled: !nextEnabled } : it
                                                ),
                                              }
                                            : r
                                        )
                                      );
                                      console.error('Error toggling reminder item:', error);
                                      toast.error('Failed to update description toggle');
                                    }
                                  }}
                                  sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#ffb020' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#ffb020' }, '& .MuiSwitch-track': { backgroundColor: 'rgba(255,176,32,0.35)' } }}
                                />

                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="relative flex items-center justify-end sm:w-auto w-full">
                      {/* Desktop actions */}
                      <div className="hidden sm:flex items-center">
                        <button
                          type="button"
                          aria-label="Open reminder actions"
                          title="Actions"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuForId((prev) => (prev === reminder.id ? null : reminder.id));
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
                                handleEditClick(reminder);
                              }}
                              className="w-full text-left px-3 py-2 text-sm text-white/85 cursor-pointer hover:bg-white/5"
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setOpenMenuForId(null);
                                handleDelete(reminder.id);
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

                      {/* Mobile actions */}
                      <div className="flex sm:hidden gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuForId(null);
                            handleEditClick(reminder);
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
                            handleDelete(reminder.id);
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
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

