"use client";

import type { DescriptionItem, RepeatMode } from './useHomePageData';

import CustomDropdown from '../home/CustomDropdown';
import RepeatDropdown from '../RepeatDropdown';

const unitOptions = [
  { value: 'minutes', label: 'Minutes Before' },
  { value: 'hours', label: 'Hours Before' },
  { value: 'days', label: 'Days Before' },
  { value: 'weeks', label: 'Weeks Before' },
  { value: 'months', label: 'Months Before' },
];

export default function ReminderDescriptionsEditor({
  descriptions,
  onChange,
  onAddField,
  onRemoveField,
  addLabel,
}: {
  descriptions: DescriptionItem[];
  onChange: (index: number, patch: Partial<DescriptionItem>) => void;
  onAddField: () => void;
  onRemoveField: (index: number) => void;
  addLabel: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <button
          type="button"
          aria-label="Add another description"
          title="Add description"
          onClick={onAddField}
          className="flex-shrink-0 inline-flex items-center justify-center w-11 h-11 rounded-lg alarm-btn alarm-btn--ghost text-white hover:scale-105 transition"
        >
          <span className="text-2xl leading-none">+</span>
        </button>

        <label className="block text-sm font-medium text-white/70">{addLabel}</label>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {descriptions.map((desc, index) => (
          <div key={index} className="rounded-lg border border-white/10 p-4">
            <div className="flex items-end gap-2 mb-3">
              <div className="flex-1">
                <label className="block text-sm font-medium text-white/70 mb-1">
                  Label {index + 1}
                </label>
                <input
                  type="text"
                  className="alarm-input"
                  value={desc.text}
                  onChange={(e) => onChange(index, { text: e.target.value })}
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
                    onClick={() => onRemoveField(index)}
                    className="flex-shrink-0 inline-flex items-center justify-center w-11 h-11 rounded-lg alarm-btn alarm-btn--ghost text-white/90 hover:text-white transition"
                  >
                    <span className="text-xl leading-none">×</span>
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">
                  Due Date &amp; Time *
                </label>
                <input
                  type="datetime-local"
                  required
                  className="alarm-input"
                  value={desc.dueDate}
                  onChange={(e) => onChange(index, { dueDate: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">
                  Remind Me *
                </label>
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
                      onChange(index, { remindBefore: next });
                    }}
                  />

                  <CustomDropdown
                    value={desc.remindUnit}
                    onChange={(val) => onChange(index, { remindUnit: val })}
                    options={unitOptions}
                    className="flex-1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">
                    Repeat *
                  </label>
                  <RepeatDropdown
                    value={desc.repeatMode as RepeatMode}
                    customWeekdays={
                      desc.repeatMode === 'custom'
                        ? desc.customWeekdays ?? undefined
                        : undefined
                    }
                    onChange={(repeatMode, customWeekdays) => {
                      onChange(index, {
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
    </div>
  );
}

