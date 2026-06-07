'use client';

import { useEffect, useMemo, useState } from 'react';

type RepeatMode = 'once' | 'daily' | 'mon_fri' | 'custom';

type Props = {
  value?: RepeatMode | null;
  customWeekdays?: number[] | null;
  onChange: (repeatMode: RepeatMode, customWeekdays: number[] | null) => void;
};

const repeatOptions: { value: RepeatMode; label: string; icon?: React.ReactNode }[] = [
  { value: 'once', label: 'Once' },
  { value: 'daily', label: 'Daily' },
  { value: 'mon_fri', label: 'Mon to Fri' },
  { value: 'custom', label: 'Custom' },
];

const weekdayLabels: Record<number, string> = {
  1: 'Mon',
  2: 'Tue',
  3: 'Wed',
  4: 'Thu',
  5: 'Fri',
  6: 'Sat',
  7: 'Sun',
};

function sameDays(a: number[] | null | undefined, b: number[] | null | undefined) {
  const aa = (a ?? []).slice().sort((x, y) => x - y);
  const bb = (b ?? []).slice().sort((x, y) => x - y);
  return aa.length === bb.length && aa.every((v, i) => v === bb[i]);
}

export default function RepeatDropdown({ value, customWeekdays, onChange }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedMode: RepeatMode = (value ?? 'once') as RepeatMode;
  const safeCustomWeekdays = useMemo(() => {
    const arr = (customWeekdays ?? []).filter((n) => n >= 1 && n <= 7);
    return Array.from(new Set(arr)).sort((a, b) => a - b);
  }, [customWeekdays]);

  const [tempCustomDays, setTempCustomDays] = useState<number[]>(safeCustomWeekdays);

  useEffect(() => {
    if (!isOpen) return;
    if (selectedMode !== 'custom') return;
    // Sync temp selection when opening custom dropdown.
    if (!sameDays(tempCustomDays, safeCustomWeekdays)) {
      // Avoid cascading renders by scheduling the update after the effect.
      queueMicrotask(() => {
        setTempCustomDays(safeCustomWeekdays);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMode, safeCustomWeekdays, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleClick = () => setIsOpen(false);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [isOpen]);

  const selectedLabel = repeatOptions.find((o) => o.value === selectedMode)?.label ?? 'Once';

  const commitOnce = () => {
    setIsOpen(false);
    onChange('once', null);
  };

  const commitDaily = () => {
    setIsOpen(false);
    onChange('daily', null);
  };

  const commitMonFri = () => {
    setIsOpen(false);
    onChange('mon_fri', null);
  };

  const commitCustom = () => {
    setIsOpen(false);
    onChange('custom', tempCustomDays.length ? tempCustomDays : null);
  };

  const toggleTempDay = (d: number) => {
    setTempCustomDays((prev) => {
      const has = prev.includes(d);
      if (has) return prev.filter((x) => x !== d).sort((a, b) => a - b);
      return [...prev, d].sort((a, b) => a - b);
    });
  };

  return (
    <div className="relative w-full" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        onClick={() => setIsOpen((s) => !s)}
        className="alarm-input flex items-center justify-between text-left cursor-pointer w-full h-full"
      >
        <span className="opacity-95">{selectedLabel}</span>
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
            <div className="px-4 pt-3 pb-2">
              <div className="text-xs text-white/60">Repeat</div>
            </div>

            {repeatOptions.map((opt) => {
              const active = opt.value === selectedMode;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    if (opt.value === 'once') commitOnce();
                    if (opt.value === 'daily') commitDaily();
                    if (opt.value === 'mon_fri') commitMonFri();
                    if (opt.value === 'custom') {
                      // Switch mode immediately; days grid should appear right away.
                      onChange('custom', tempCustomDays.length ? tempCustomDays : null);
                      setIsOpen(true);
                    }
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-white/10 ${
                    opt.value === 'once' ? 'mt-1' : ''
                  } ${
                    active ? 'text-[#ffb020] bg-white/5' : 'text-white/80'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {opt.value === 'once' && active && <span className="text-[#ffb020]">✓</span>}
                    <span>{opt.label}</span>
                  </div>
                </button>
              );
            })}


            {selectedMode === 'custom' && (
              <div className="border-t border-white/10 mt-1 pt-3 px-4 pb-3">
                <div className="text-xs text-white/60 mb-2">Select days</div>
                <div className="grid grid-cols-4 gap-2">
                  {Object.keys(weekdayLabels).map((k) => {
                    const day = Number(k);
                    const checked = tempCustomDays.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleTempDay(day)}
                        className={`px-2 py-1 rounded-md text-xs border transition ${
                          checked
                            ? 'border-[#ffb020] bg-white/5 text-[#ffb020]'
                            : 'border-white/10 bg-transparent text-white/70 hover:bg-white/5'
                        }`}
                      >
                        {weekdayLabels[day]}
                      </button>
                    );
                  })}
                </div>

                <div className="flex justify-end mt-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                    }}
                    className="px-3 py-1.5 rounded-md text-sm text-white/70 hover:text-white hover:bg-white/5 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={commitCustom}
                    className="px-3 py-1.5 rounded-md text-sm text-[#121212] bg-[#ffb020] hover:bg-[#ffcf66] transition font-semibold"
                  >
                    OK
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

