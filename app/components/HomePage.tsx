'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Loading from './Loading';


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

export default function Home() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    remindBefore: 1,
    remindUnit: 'days',
    userEmail: '',
    phoneNumber: ''
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
      // new Date(string) uses the user's browser timezone
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
          dueDate: utcDueDate, // Send actual UTC ISO string
          phoneNumber: formData.phoneNumber || null
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
      const localDateString = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
      
      setFormData({
        title: latestReminder.title,
        description: latestReminder.description,
        dueDate: localDateString,
        remindBefore: latestReminder.remind_before,
        remindUnit: latestReminder.remind_unit,
        userEmail: latestReminder.user_email,
        phoneNumber: latestReminder.phoneNumber || ''
      });
      setShowEditForm(true);
    } catch (error) {
      console.error('Error loading reminder for edit:', error);
      toast.error('Failed to load reminder');
    }
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
          id: editingReminder.id,
          dueDate: utcDueDate // Send actual UTC ISO string
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

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      dueDate: '',
      remindBefore: 1,
      remindUnit: 'days',
      userEmail: '',
      phoneNumber: ''
    });
  };

  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [openMenuForId, setOpenMenuForId] = useState<number | null>(null);


  const handleDelete = async (id: number) => {
    // Prevent double-clicks
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

      // If click happens inside an open reminder menu container, don't close.
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
    
    // Convert UTC from database to user's local time for display
    const date = new Date(dateString);
    return date.toLocaleString('en-GB', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).replace(',', '');
  };

  const getReminderText = (reminder: Reminder) => {
    return `Remind ${reminder.remind_before} ${reminder.remind_unit} before due date`;
  };

  // if (loading) {
  //   return (
  //     <div className="flex items-center justify-center min-h-screen">
  //       <div className="text-xl">Loading reminders...</div>
  //     </div>
  //   );
  // }

if (loading) {
  return <Loading />;
}


  return (
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="card-neon rounded-lg p-6 mb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">⏰ Reminder App</h1>
              <p className="text-gray-600 mt-2 text-sm sm:text-base">Never miss important events or payments again</p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className={`${showForm ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} cursor-pointer text-white px-4 py-2 rounded-lg transition sm:px-6`}
            >
              {showForm ? 'Cancel' : '+ Add Reminder'}
            </button>
          </div>
        </div>


        {/* Add Reminder Form */}
        {showForm && (
          <div className="card-neon rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Add New Reminder</h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Pay electricity bill"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Your Email *
                  </label>
                  <input
                    type="email"
                    required
                    className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.userEmail}
                    onChange={(e) => setFormData({ ...formData, userEmail: e.target.value })}
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Due Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description (Optional)
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Additional details"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number (for SMS - optional)
                  </label>
                  <input 
                    type="tel"
                    className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    placeholder="e.g., +1234567890 or 0712345678" 
                    value={formData.phoneNumber} 
                    onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})} 
                  />
                  <p className="text-sm text-gray-500 mt-2">Include country code for SMS notifications</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Remind Me
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="1"
                      required
                      className="w-24 border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.remindBefore}
                      onChange={(e) => setFormData({ ...formData, remindBefore: parseInt(e.target.value) })}
                    />
                    <select
                      className="flex-1 border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.remindUnit}
                      onChange={(e) => setFormData({ ...formData, remindUnit: e.target.value })}
                    >
                      <option value="minutes">Minutes Before</option>
                      <option value="hours">Hours Before</option>
                      <option value="days">Days Before</option>
                      <option value="weeks">Weeks Before</option>
                      <option value="months">Months Before</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  type="submit"
                  className="bg-green-500 hover:bg-green-600 cursor-pointer text-white px-4 py-2 rounded-lg transition sm:px-6"
                >
                  Create Reminder
                </button>
                  <button
                    type="button"
                    onClick={() => {
                      resetForm();
                      setShowForm(false);
                    }}
                    className="bg-red-500 hover:bg-red-600 cursor-pointer text-white px-4 py-2 rounded-lg transition sm:px-6"
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
            <h2 className="text-xl font-semibold mb-4">Edit Reminder</h2>
            <form onSubmit={handleUpdateSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Your Email *
                  </label>
                  <input
                    type="email"
                    required
                    className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.userEmail}
                    onChange={(e) => setFormData({ ...formData, userEmail: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Due Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description (Optional)
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number (for SMS - optional)
                  </label>
                  <input 
                    type="tel"
                    className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    placeholder="e.g., +1234567890 or 0712345678" 
                    value={formData.phoneNumber} 
                    onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})} 
                  />
                  <p className="text-sm text-gray-500 mt-2">Include country code for SMS notifications</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Remind Me
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="1"
                      required
                      className="w-24 border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.remindBefore}
                      onChange={(e) => setFormData({ ...formData, remindBefore: parseInt(e.target.value) })}
                    />
                    <select
                      className="flex-1 border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.remindUnit}
                      onChange={(e) => setFormData({ ...formData, remindUnit: e.target.value })}
                    >
                      <option value="minutes">Minutes Before</option>
                      <option value="hours">Hours Before</option>
                      <option value="days">Days Before</option>
                      <option value="weeks">Weeks Before</option>
                      <option value="months">Months Before</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  type="submit"
                  className="bg-green-500 hover:bg-green-600 cursor-pointer text-white px-4 py-2 rounded-lg transition sm:px-6"
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
                    className="bg-red-500 hover:bg-red-600 cursor-pointer text-white px-4 py-2 rounded-lg transition sm:px-6"
                >
                  Cancel
                </button>
              </div>

            </form>
          </div>
        )}

        {/* Reminders List */}
        <div className="card-neon rounded-lg">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">Your Reminders</h2>
            <p className="text-gray-600 text-sm mt-1">
              {reminders.length} reminder{reminders.length !== 1 ? 's' : ''} total
            </p>
          </div>

          {reminders.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <p className="text-lg">No reminders yet</p>
              <p className="text-sm mt-2">Click the &quot;Add Reminder&quot; button to create one</p>
            </div>
          ) : (
            <div className="divide-y">
              {(Array.isArray(reminders) ? reminders : []).map((reminder) => (
                <div key={reminder.id} className="p-6 hover:bg-gray-50 transition">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="min-w-0 flex items-center gap-3">
                          <h3 className="text-lg font-semibold text-gray-800 break-words">
                            {reminder.title}
                          </h3>
                        </div>

                        <div className="relative flex items-center justify-end w-full sm:w-auto">
                          {/* Sent/Pending badge + Desktop/tablet kebab actions (aligned to end) */}
                          <div className="flex items-center gap-2">
                            <span
                              className={`shrink-0 text-xs px-2 py-1 rounded-full ${
                                reminder.is_sent
                                  ? 'bg-green-500 text-white'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}
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
                                className="inline-flex items-center justify-center w-9 h-9 rounded-lg cursor-pointer hover:bg-gray-100 transition"
                              >
                                <span className="text-gray-600 text-xl leading-none">⋮</span>
                              </button>

                              {openMenuForId === reminder.id && (
                                <div
                                  data-reminder-menu="true"
                                  className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-10"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenMenuForId(null);
                                      handleEditClick(reminder);
                                    }}
                                    className="w-full text-left px-3 py-2 text-sm text-gray-800 cursor-pointer hover:bg-gray-50"
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
                                        ? 'text-red-300 cursor-not-allowed bg-white'
                                        : 'text-red-600 cursor-pointer hover:bg-red-50'
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
                        <p className="text-gray-600 mb-2">{reminder.description}</p>
                      )}
                      
                      <div className="flex flex-wrap gap-3 text-sm">
                        <span className="text-gray-500">
                          📅 Due: {formatDate(reminder.due_date)}
                        </span>
                        <span className="text-green-600">
                          ⏰ {getReminderText(reminder)}
                        </span>
                        <span className="text-gray-500">
                          📧 {reminder.user_email}
                        </span>
                      </div>
                    </div>
                    
                    <div className="relative flex items-center">
                      {/* Mobile actions */}
                      <div className="flex gap-2 sm:hidden">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuForId(null);
                            handleEditClick(reminder);
                          }}
                          className="bg-green-500 hover:bg-green-600 cursor-pointer text-white px-3 py-2 rounded-lg transition text-sm"
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
                          className={`bg-red-500 hover:bg-red-600 cursor-pointer text-white px-3 py-2 rounded-lg transition text-sm ${
                            deletingId === reminder.id ? 'opacity-60 cursor-not-allowed hover:bg-red-500' : ''
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