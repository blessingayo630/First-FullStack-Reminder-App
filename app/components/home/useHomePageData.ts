"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import { requestNotificationPermission } from '@/lib/notifications';
import { supabase } from '@/lib/supabase';

import type { Reminder, ReminderItem } from './ReminderTypes';

type InlineToast =
  | {
      variant: 'success' | 'error';
      title: string;
      message?: string;
      durationMs: number;
    }
  | null;

export type RepeatMode = 'once' | 'daily' | 'mon_fri' | 'custom';

export type DescriptionItem = {
  text: string;
  dueDate: string;
  remindBefore: number;
  remindUnit: string;
  repeatMode: RepeatMode;
  customWeekdays: number[] | null;
};

export type UseHomePageDataResult = {

  reminders: Reminder[];
  filteredReminders: (Reminder & { reminder_items: ReminderItem[] })[];
  loading: boolean;

  showForm: boolean;
  setShowForm: (v: boolean) => void;

  fcmToken: string | null;
  inlineToast: InlineToast;
  setInlineToast: (v: InlineToast) => void;

  editingReminder: Reminder | null;
  showEditForm: boolean;
  setShowEditForm: (v: boolean) => void;
  setEditingReminder: (r: Reminder | null) => void;

  deletingId: number | null;
  openMenuForId: number | null;
  setOpenMenuForId: (id: number | null) => void;
  setDeletingId: (id: number | null) => void;

  currentPath: string;
  userEmail: string;

  formatDate: (dateString: string) => string;

  handleLogout: () => Promise<void>;
};

export function useHomePageData(): UseHomePageDataResult {
  const router = useRouter();

  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);

  const [fcmToken, setFcmToken] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);

  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);

  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [openMenuForId, setOpenMenuForId] = useState<number | null>(null);

  const [inlineToast, setInlineToast] = useState<InlineToast>(null);

  const [userEmail, setUserEmail] = useState<string>('');

  const [currentPath] = useState<string>(() => {
    if (typeof window === 'undefined') return '';
    return window.location.pathname;
  });

  useEffect(() => {
    if (!inlineToast) return;
    const t = window.setTimeout(() => setInlineToast(null), inlineToast.durationMs);
    return () => window.clearTimeout(t);
  }, [inlineToast]);

  const filteredReminders = useMemo(() => {
    return reminders.map((r) => ({
      ...r,
      reminder_items: (r.reminder_items ?? []).map((it) => ({ ...it })),
    }));
  }, [reminders]);

  useEffect(() => {
    let cancelled = false;

    const loadEmail = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const email = data?.session?.user?.email ?? '';
        if (cancelled) return;
        setUserEmail(email);
      } catch {
        // ignore
      }
    };

    loadEmail();
    return () => {
      cancelled = true;
    };
  }, []);

  const refetch = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/reminders/getAll?email=${encodeURIComponent(userEmail)}`,
        { cache: 'no-store' }
      );
      const data = await response.json();
      setReminders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error refetching reminders:', error);
    }
  }, [userEmail]);

  // (intentionally not returned) refetch is used by mutation handlers in the parent via polling.


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
        if (
          !window.location.href.includes('/success?') &&
          !window.location.href.includes('/error?')
        ) {
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
        const response = await fetch(
          `/api/reminders/getAll?email=${encodeURIComponent(userEmail)}`
        );
        const data = await response.json();
        setReminders(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching reminders:', error);
      } finally {
        setLoading(false);
      }
    };

    if (!userEmail) return;
    loadReminders();
  }, [userEmail]);

  useEffect(() => {
    if (!userEmail) return;

    let cancelled = false;

    const poll = async () => {
      if (cancelled) return;
      if (document.visibilityState === 'hidden') return;

      try {
        const response = await fetch(
          `/api/reminders/getAll?email=${encodeURIComponent(userEmail)}`,
          { cache: 'no-store' }
        );
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
  }, [userEmail]);

  const formatDate = useCallback((dateString: string) => {
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
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) return;
    } catch {
      // ignore
    }
    router.push('/login');
  }, [router]);

  // silence unused warning for refetch (used by mutation components later)
  useEffect(() => {
    void refetch;
  }, [refetch]);

  return {
    reminders,
    filteredReminders,
    loading,

    showForm,
    setShowForm,

    fcmToken,
    inlineToast,
    setInlineToast,

    editingReminder,
    showEditForm,
    setShowEditForm,
    setEditingReminder,

    deletingId,
    openMenuForId,
    setOpenMenuForId,
    setDeletingId,

    currentPath,
    userEmail,

    formatDate,

    handleLogout,
  };
}

