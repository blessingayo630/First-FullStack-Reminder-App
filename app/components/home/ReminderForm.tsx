'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';
import RepeatDropdown from '../RepeatDropdown';
import type { DescriptionItem, RepeatMode } from './ReminderTypes';
import CustomDropdown from './CustomDropdown';

const unitOptions = [
  { value: 'minutes', label: 'Minutes Before' },
  { value: 'hours', label: 'Hours Before' },
  { value: 'days', label: 'Days Before' },
  { value: 'weeks', label: 'Weeks Before' },
  { value: 'months', label: 'Months Before' },
];

export default function ReminderForm({
  mode,
  initial,
  onCancel,
  onSubmit,
}: {
  mode: 'create' | 'edit';
  initial: {
    title: string;
    userEmail: string;
    phoneNumber: string;
    isEnabled: boolean;
    descriptions: DescriptionItem[];
  };
  onCancel: () => void;
  onSubmit: (payload: {
    title: string;
    userEmail: string;
    phoneNumber: string;
    isEnabled: boolean;
    descriptions: DescriptionItem[];
    fcmToken: string | null;
  }) => Promise<void>;
}) {
  const [formData, setFormData] = useState(initial);

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
            repeatMode: 'once',
            customWeekdays: [1, 2, 3, 4, 5],
          },
        ],
      };
    });
  };

  const removeDescriptionField = (index: number) => {
    if (index === 0) return;
    setFormData((prev) => ({ ...prev, descriptions: prev.descriptions.filter((_, i) => i !== index) }));
  };

  return (
    <div className="card-neon rounded-lg p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4 text-white/90">{mode === 'create' ? 'Add New Reminder' : 'Edit Reminder'}</h2>

      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const items = formData.descriptions
            .map((d) => {
              const date = new Date(d.dueDate);
              if (isNaN(date.getTime())) return null;

              const customWeekdaysCsv = (d.customWeekdays ?? []).slice().sort((a, b) => a - b).join(',');

              return {
                text: d.text,
                dueDate: date.toISOString(),
                remindBefore: d.remindBefore,
                remindUnit: d.remindUnit,
                repeatMode: d.repeatMode,
                customWeekdays: d.repeatMode === 'custom' ? customWeekdaysCsv : null,
              };
            })
            .filter(Boolean) as Array<{
              text: string;
              dueDate: string;
              remindBefore: number;
              remindUnit: string;
              repeatMode: RepeatMode;
              customWeekdays: string | null;
            }>;

          if (items.length === 0 || items.every((i) => !i.text || !String(i.text).trim())) {
            toast.error('Please add at least one description');
            return;
          }

          await onSubmit({
            title: formData.title,
            userEmail: formData.userEmail,
            phoneNumber: formData.phoneNumber,
            isEnabled: formData.isEnabled,
            descriptions: formData.descriptions,
            fcmToken: null,
          });
        }}
      >
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
            <label className="block text-sm font-medium text-white/70 mb-3">Descriptions</label>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {formData.descriptions.map((desc, index) => (
                <div key={index} className="rounded-lg border border-white/10 p-4 relative">
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
                        />
                      </div>

                      <RepeatDropdown
                        value={desc.repeatMode}
                        customWeekdays={desc.repeatMode === 'custom' ? desc.customWeekdays ?? undefined : undefined}
                        onChange={(repeatMode: RepeatMode, customWeekdays) => {
                          updateDescriptionField(index, {
                            repeatMode,
                            customWeekdays: customWeekdays ?? [],
                          });
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}

              <div className="flex justify-end">
                <button
                  type="button"
                  aria-label="Add another description"
                  title="Add description"
                  onClick={addDescriptionField}
                  className="-mt-2 mr-1 flex-shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-lg alarm-btn alarm-btn--ghost text-white hover:scale-105 transition"
                >
                  <span className="text-2xl leading-none">+</span>
                </button>
              </div>

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

            </div>

            <div className="mt-2 sm:col-span-2 lg:col-span-2">
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  type="submit"
                  className="alarm-btn alarm-btn--primary cursor-pointer text-white px-4 py-2 rounded-lg transition sm:px-6"
                >
                  {mode === 'create' ? 'Create Reminder' : 'Update Reminder'}
                </button>
                <button type="button" onClick={onCancel} className="alarm-btn alarm-btn--danger cursor-pointer text-white px-4 py-2 rounded-lg transition sm:px-6">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

