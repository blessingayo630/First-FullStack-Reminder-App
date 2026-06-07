export type ReminderItem = {
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

export type Reminder = {
  id: number;
  title: string;
  user_email: string;
  phone_number?: string | null;
  is_enabled: boolean;
  created_at: string;
  reminder_items: ReminderItem[];
};

export type RepeatMode = 'once' | 'daily' | 'mon_fri' | 'custom';

export type DescriptionItem = {
  text: string;
  dueDate: string;
  remindBefore: number;
  remindUnit: string;
  repeatMode: RepeatMode;
  customWeekdays: number[] | null;
};

