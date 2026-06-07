'use client';

import Switch from '@mui/material/Switch';
import type { Reminder, ReminderItem } from './ReminderTypes';

export default function ReminderItemCard({
  reminder,
  item,
  statusKind,
  onToggleItem,
  formatDate,
}: {
  reminder: Reminder;
  item: ReminderItem & { id: number };
  statusKind: 'previous' | 'current' | 'awaiting';
  onToggleItem: (nextEnabled: boolean) => void;
  formatDate: (d: string) => string;
}) {
  const wrapperClass =
    statusKind === 'previous'
      ? 'alarm-reminder-previous'
      : statusKind === 'current'
        ? 'alarm-reminder-current'
        : 'alarm-reminder-awaiting';

  const timeText = `${String(item.remind_before ?? '')} ${String(item.remind_unit ?? '')}`.trim();

  return (
    <div key={item.id} className={`border border-white/10 rounded-lg p-3 ${wrapperClass}`}>
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

          <p className="text-white/80 font-medium truncate max-w-full" title={item.description}>
            {item.description}
          </p>
          <p className="text-white/60 text-sm">📅 {formatDate(item.due_date)}</p>
          <p className="text-[rgba(255,176,32,0.95)] text-sm">⏰ {timeText || '—'}</p>
        </div>

        <div className="shrink-0 mt-0.5">
          <Switch
            checked={item.is_enabled !== false}
            onChange={(e) => onToggleItem(e.target.checked)}
            sx={{
              '& .MuiSwitch-switchBase.Mui-checked': { color: '#ffb020' },
              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#ffb020' },
              '& .MuiSwitch-track': { backgroundColor: 'rgba(255,176,32,0.35)' },
            }}
          />
        </div>
      </div>
    </div>
  );
}

