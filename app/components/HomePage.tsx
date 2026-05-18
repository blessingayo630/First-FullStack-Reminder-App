'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Loading from './Loading';
import { requestNotificationPermission } from '@/lib/notifications';

interface Reminder {
  id: number;
  title: string;
  description: string;
  due_date: string;
  remind_before: number;
  remind_unit: string;
  user_email: string;
  phoneNumber: string | null;
  is_sent: boolean;
}

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
  className = ""
}: { 
  value: string; 
  onChange: (val: string) => void; 
  options: { value: string; label: string }[];
  className?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find(opt => opt.value === value) || options[0];

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
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);

  useEffect(() => {
  requestNotificationPermission();
}, []);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    descriptions: [''],
    dueDate: '',
    remindBefore: 1,
    remindUnit: 'days',
    userEmail: '',
    phoneNumber: '',
  });

  // Initial load effect - direct fetch, no callback needed
  useEffect(() => {
    const loadReminders = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/reminders/getAll');
        const data = await response.json();
        if (Array.isArray(data)) {
          setReminders(data);
        } else {
          console.error('Invalid data from API:', data);
          setReminders([]);
        }
      } catch (error) {
        console.error('Error fetching reminders:', error);
      } finally {
        setLoading(false);
      }
    };

    loadReminders();
  }, []);

  // Separate refetch for event handlers (stable)
  const refetch = useCallback(async () => {
    try {
      const response = await fetch('/api/reminders/getAll', { cache: 'no-store' });
      const data = await response.json();
      if (Array.isArray(data)) {
        setReminders(data);
      } else {
        console.error('Invalid data from API:', data);
        setReminders([]);
      }
    } catch (error) {
      console.error('Error refetching reminders:', error);
    }
  }, []);

  // Polling: keep UI in sync with server-side scheduler updates (Pending -> Sent)
  useEffect(() => {
    let cancelled = false;

    const poll = async () => {
      if (cancelled) return;
      // Reduce unnecessary calls when tab is not visible
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;

      try {
        const response = await fetch('/api/reminders/getAll', { cache: 'no-store' });
        const data = await response.json();
        if (!Array.isArray(data)) return;

        // Change detection to avoid re-render spam
        setReminders((prev) => {
          if (!Array.isArray(prev)) return data;

          if (prev.length !== data.length) return data;

          // Compare by id + is_sent (and due_date just to be safe)
          for (let i = 0; i < prev.length; i++) {
            const a = prev[i];
            const b = data[i];
            if (a.id !== b.id) return data;
            if (a.is_sent !== b.is_sent) return data;
            if (a.due_date !== b.due_date) return data;
          }

          return prev;
        });
      } catch (error) {
        // Swallow polling errors to keep UI responsive
        console.error('Polling error:', error);
      }
    };

    // initial poll right after mount (in addition to initial load)
    poll();

    const intervalId = window.setInterval(poll, 10000); // 10s

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, []);

  // Simple submit - send the local datetime string as-is
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Correctly convert local datetime to UTC ISO string
      const date = new Date(formData.dueDate);
      if (isNaN(date.getTime())) {
        toast.error('Invalid date');
        return;
      }
      const utcDueDate = date.toISOString();

      const response = await fetch('/api/reminders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          description: formData.descriptions.filter(d => d.trim() !== '').join('|||'),
          dueDate: utcDueDate, // Send actual UTC ISO string
          phoneNumber: formData.phoneNumber || null,
        }),
      });

      if (response.ok) {
        resetForm();
        setShowForm(false);
        refetch();
        toast.success('Reminder added successfully!');
      } else {
        const error = await response.json();
        toast.error(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error adding reminder:', error);
      toast.error('Failed to add reminder');
    }
  };

  // For editing: just use the due_date as-is from the database
  const handleEditClick = async (reminder: Reminder) => {
    try {
      const response = await fetch(`/api/reminders?id=${reminder.id}`);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch reminder: ${response.status} ${errorText}`);
      }
      const latestReminder = await response.json();

      setEditingReminder(latestReminder);

      // Convert UTC ISO string from database to local datetime-local format (YYYY-MM-DDTHH:mm)
      const date = new Date(latestReminder.due_date);
      const localDateString = new Date(
        date.getTime() - date.getTimezoneOffset() * 60000
      ).toISOString().slice(0, 16);

      const descriptions = latestReminder.description
        ? latestReminder.description.split('|||')
        : [''];

      setFormData({
        title: latestReminder.title,
        descriptions: descriptions.length > 0 ? descriptions : [''],
        dueDate: localDateString,
        remindBefore: latestReminder.remind_before,
        remindUnit: latestReminder.remind_unit,
        userEmail: latestReminder.user_email,
        phoneNumber: latestReminder.phoneNumber || '',
      });
      setShowEditForm(true);
    } catch (error) {
      console.error('Error loading reminder for edit:', error);
      toast.error('Failed to load reminder');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      descriptions: [''],
      dueDate: '',
      remindBefore: 1,
      remindUnit: 'days',
      userEmail: '',
      phoneNumber: '',
    });
  };

  // Simple update - send the local datetime string as-is
  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingReminder) return;

    try {
      // Correctly convert local datetime to UTC ISO string
      const date = new Date(formData.dueDate);
      if (isNaN(date.getTime())) {
        toast.error('Invalid date');
        return;
      }
      const utcDueDate = date.toISOString();

      const response = await fetch('/api/reminders/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          description: formData.descriptions.filter(d => d.trim() !== '').join('|||'),
          id: editingReminder.id,
          dueDate: utcDueDate, // Send actual UTC ISO string
        }),
      });

      if (response.ok) {
        resetForm();
        setEditingReminder(null);
        setShowEditForm(false);
        refetch();
        toast.success('Reminder updated successfully!');
      } else {
        const error = await response.json();
        toast.error(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error updating reminder:', error);
      toast.error('Failed to update reminder');
    }
  };

  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [openMenuForId, setOpenMenuForId] = useState<number | null>(null);

const addDescriptionField = () => {
  setFormData((prev) => {
    const lastDesc = prev.descriptions[prev.descriptions.length - 1];

    if (prev.descriptions.length === 1 && !lastDesc.trim()) {
      toast.warn('Add your first description');
      return prev;
    }

    return {
      ...prev,
      descriptions: [...prev.descriptions, ''],
    };
  });
};

 const removeDescriptionField = (index: number) => {
  // Prevent deleting the first field
  if (index === 0) return;

  setFormData((prev) => ({
    ...prev,
    descriptions: prev.descriptions.filter((_, i) => i !== index),
  }));
};

  const updateDescription = (index: number, value: string) => {
    const newDescs = [...formData.descriptions];
    newDescs[index] = value;
    setFormData({ ...formData, descriptions: newDescs });
  };

  const handleDelete = async (id: number) => {
    if (deletingId === id) return;

    setDeletingId(id);
    toast.dismiss();

    try {
      const toastId = toast.loading('Deleting reminder...');

      const response = await fetch(`/api/reminders/delete?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await refetch();
        toast.update(toastId, {
          render: 'Reminder deleted successfully!',
          type: 'success',
          isLoading: false,
          autoClose: 3000,
        });
      } else {
        const error = await response.json().catch(() => null);
        toast.update(toastId, {
          render: error?.error ? `Error: ${error.error}` : 'Failed to delete reminder',
          type: 'error',
          isLoading: false,
          autoClose: 5000,
        });
      }
    } catch (error) {
      console.error('Error deleting reminder:', error);
      toast.error('Failed to delete reminder');
    } finally {
      setDeletingId(null);
    }
  };

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
    return () => {
      document.removeEventListener('mousedown', handleDocumentMouseDown);
    };
  }, [openMenuForId]);

  const formatDate = (dateString: string) => {
    if (!dateString) return '';

    const date = new Date(dateString);
    return date
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

  const getReminderText = (reminder: Reminder) => {
    return `Remind ${reminder.remind_before} ${reminder.remind_unit} before due date`;
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="card-neon rounded-lg p-6 mb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                ⏰ Reminder App
              </h1>
              <p className="text-white/60 mt-2 text-sm sm:text-base">
                Never miss important events or payments again
              </p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className={`${showForm ? 'alarm-btn alarm-btn--danger' : 'alarm-btn alarm-btn--primary'} cursor-pointer text-white px-4 py-2 rounded-lg transition sm:px-6`}
            >
              {showForm ? 'Cancel' : '+ Add Reminder'}
            </button>
          </div>
        </div>

        {/* Add Reminder Form */}
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
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, userEmail: e.target.value })}
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">
                    Due Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    className="alarm-input"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  />
                </div>

                <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">
                      Description (Optional)
                    </label>

                    <div className="space-y-3">
                      {formData.descriptions.map((desc, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2"
                        >
                          <div className="flex-1">
                            <input
                              type="text"
                              className="alarm-input"
                              value={desc}
                              onChange={(e) => updateDescription(index, e.target.value)}
                              placeholder={
                                index === 0
                                  ? 'Additional details'
                                  : `Additional details ${index + 1}`
                              }
                            />
                          </div>

                          {/* PLUS button only on first field */}
                          {index === 0 && (
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

                          {/* CLOSE button only for added fields */}
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
                      ))}
                    </div>
                    </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">
                    Phone Number (for SMS - optional)
                  </label>
                  <input
                    type="tel"
                    className="alarm-input"
                    placeholder="e.g., +1234567890 or 0712345678"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  />
                  <p className="text-sm text-white/45 mt-2">Include country code for SMS notifications</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Remind Me</label>
                      <div className="flex gap-2 items-stretch">
                    <input
                      type="number"
                      min="1"
                      required
                      className="flex-1 alarm-input"

                      value={formData.remindBefore}
                      onChange={(e) => setFormData({ ...formData, remindBefore: parseInt(e.target.value) })}
                    />
                    <CustomDropdown
                      value={formData.remindUnit}
                      onChange={(val) => setFormData({ ...formData, remindUnit: val })}
                      options={unitOptions}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button type="submit" className="alarm-btn alarm-btn--primary cursor-pointer text-white px-4 py-2 rounded-lg transition sm:px-6">
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
            </form>
          </div>
        )}

        {/* Edit Reminder Form */}
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
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Your Email *</label>
                  <input
                    type="email"
                    required
                    className="alarm-input"
                    value={formData.userEmail}
                    onChange={(e) => setFormData({ ...formData, userEmail: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Due Date & Time *</label>
                  <input
                    type="datetime-local"
                    required
                    className="alarm-input"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  />
                </div>
{/* 
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">
                    Description (Optional)
                  </label>
                  <input
                    type="text"
                    className="alarm-input"
                    value={formData.descriptions[0] ?? ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        descriptions: [e.target.value, ...(formData.descriptions.slice(1) ?? [])],
                      })
                    }
                  />
                </div> */}

                
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-white/70 mb-1">
                      Description (Optional)
                    </label>

                    {formData.descriptions.map((desc, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="flex-1">
                          <input
                            type="text"
                            className="alarm-input"
                            value={desc}
                            onChange={(e) => updateDescription(index, e.target.value)}
                            placeholder={index === 0 ? 'Additional details' : `Additional details ${index + 1}`}
                          />
                        </div>

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
                    ))}
                  </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">
                    Phone Number (for SMS - optional)
                  </label>
                  <input
                    type="tel"
                    className="alarm-input"
                    placeholder="e.g., +1234567890 or 0712345678"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  />
                  <p className="text-sm text-white/45 mt-2">Include country code for SMS notifications</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Remind Me</label>
                      <div className="flex gap-2 items-stretch">
                    <input
                      type="number"
                      min="1"
                      required
                      className="flex-1 alarm-input"
                      value={formData.remindBefore}

                      onChange={(e) => setFormData({ ...formData, remindBefore: parseInt(e.target.value) })}
                    />
                    <CustomDropdown
                      value={formData.remindUnit}
                      onChange={(val) => setFormData({ ...formData, remindUnit: val })}
                      options={unitOptions}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button type="submit" className="alarm-btn alarm-btn--primary cursor-pointer text-white px-4 py-2 rounded-lg transition sm:px-6">
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
            </form>
          </div>
        )}

        {/* Reminders List */}
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
              {(Array.isArray(reminders) ? reminders : []).map((reminder, idx) => (
                <div
                  key={reminder.id}
                  className="p-6 alarm-list-item"
                  style={{ animationDelay: `${Math.min(idx * 60, 420)}ms` }}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="min-w-0 flex items-center gap-3">
                          <h3 className="text-lg font-semibold text-white wrap-break-word">
                            {reminder.title}
                          </h3>
                        </div>

                        <div className="relative flex items-center justify-end w-full sm:w-auto">
                          <div className="flex items-center gap-2">
                            <span
                              className={`alarm-badge ${reminder.is_sent ? 'alarm-badge--sent' : 'alarm-badge--pending'}`}
                            >
                              {reminder.is_sent ? 'Sent' : 'Pending'}
                            </span>

                            <div className="hidden sm:flex relative items-center">
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
                          </div>
                        </div>
                      </div>

                      {reminder.description && (
                        <div className="space-y-1 mb-2">
                          {reminder.description.split('|||').map((desc, i) => (
                            <p key={i} className="text-white/65 flex items-start gap-2">
                              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-white/30 flex-shrink-0" />
                              {desc}
                            </p>
                          ))}
                        </div>
                      )}

                      <div className="flex flex-wrap gap-3 text-sm">
                        <span className="text-white/55">📅 Due: {formatDate(reminder.due_date)}</span>
                        <span className="text-[rgba(255,176,32,0.95)]">⏰ {getReminderText(reminder)}</span>
                        <span className="text-white/55">📧 {reminder.user_email}</span>
                      </div>
                    </div>

                    <div className="relative flex items-center">
                      <div className="flex gap-2 sm:hidden">
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

