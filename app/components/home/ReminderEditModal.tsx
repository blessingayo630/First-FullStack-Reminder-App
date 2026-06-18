"use client";

import type { DescriptionItem, RepeatMode } from './useHomePageData';

import ReminderDescriptionsEditor from './ReminderDescriptionsEditor';

export default function ReminderEditModal({
  open,
  onClose,
  formData,
  onChange,
  onAddDescription,
  onRemoveDescription,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  formData: {
    title: string;
    descriptions: DescriptionItem[];
    userEmail: string;
    phoneNumber: string;
    isEnabled: boolean;
  };
  onChange: (patch: Partial<typeof formData>) => void;
  onAddDescription: () => void;
  onRemoveDescription: (index: number) => void;
  onSubmit: (e: React.FormEvent) => void;
}) {
  if (!open) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="card-neon rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white/90">Edit Reminder</h2>
            <button
              onClick={onClose}
              className="text-white/50 hover:text-white transition text-2xl"
            >
              &times;
            </button>
          </div>

          <form onSubmit={onSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  className="alarm-input"
                  value={formData.title}
                  onChange={(e) => onChange({ title: e.target.value })}
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
                  onChange={(e) => onChange({ userEmail: e.target.value })}
                  placeholder="you@example.com"
                />
              </div>

              <div className="md:col-span-2">
                <ReminderDescriptionsEditor
                  descriptions={formData.descriptions}
                  addLabel="Label (edit multiple labels)"
                  onAddField={onAddDescription}
                  onRemoveField={onRemoveDescription}
                  onChange={(index, patch) => {
                    const nextDescriptions = formData.descriptions.map((d, i) =>
                      i === index ? ({ ...d, ...patch } as DescriptionItem) : d
                    );
                    onChange({ descriptions: nextDescriptions });
                  }}
                />

                <div className="p-0 flex flex-col">
                  <label className="block text-sm font-medium text-white/70 mb-1">
                    Phone Number (for SMS - optional)
                  </label>
                  <input
                    type="tel"
                    className="alarm-input"
                    placeholder="e.g., +1234567890 or 0712345678"
                    value={formData.phoneNumber}
                    onChange={(e) => onChange({ phoneNumber: e.target.value })}
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
                      onClick={onClose}
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
  );
}

