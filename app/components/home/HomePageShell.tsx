"use client";

import Loading from '../Loading';
import PopupStatusToast from '../PopupStatusToast';
import ReminderList from './ReminderList';
import LogoutPopup from './LogoutPopup';

import ReminderCreateModal from './ReminderCreateModal';
import ReminderEditModal from './ReminderEditModal';

import type { Reminder, ReminderItem } from './ReminderTypes';
import type { DescriptionItem } from './useHomePageData';

type InlineToast =
  | {
      variant: 'success' | 'error';
      title: string;
      message?: string;
      durationMs: number;
    }
  | null;

export default function HomePageShell({
  loading,
  inlineToast,
  setInlineToast,
  currentPath,
  showLogoutPopup,
  onLogoutPopupDone,

  showForm,
  setShowForm,

  showEditForm,
  onCloseEdit,

  formData,
  setFormData,

  deletingId,
  openMenuForId,
  setOpenMenuForId,

  filteredReminders,
  fcmToken,

  onSubmitCreate,
  onSubmitUpdate,
  onEditClick,
  onDelete,
  onToggleParent,
  onToggleItem,
  formatDate,
}: {
  loading: boolean;

  inlineToast: InlineToast;
  setInlineToast: (v: InlineToast) => void;

  currentPath: string;

  showLogoutPopup: boolean;
  onLogoutPopupDone: () => void;

  showForm: boolean;
  setShowForm: (v: boolean) => void;

  showEditForm: boolean;
  onCloseEdit: () => void;

  formData: {
    title: string;
    descriptions: DescriptionItem[];
    userEmail: string;
    phoneNumber: string;
    isEnabled: boolean;
  };
  setFormData: React.Dispatch<
    React.SetStateAction<{
      title: string;
      descriptions: DescriptionItem[];
      userEmail: string;
      phoneNumber: string;
      isEnabled: boolean;
    }>
  >;

  deletingId: number | null;
  openMenuForId: number | null;
  setOpenMenuForId: (id: number | null) => void;

  filteredReminders: (Reminder & { reminder_items: ReminderItem[] })[];
  fcmToken: string | null;

  onSubmitCreate: (e: React.FormEvent) => void;
  onSubmitUpdate: (e: React.FormEvent) => void;

  onEditClick: (r: Reminder) => void;
  onDelete: (id: number) => void;
  onToggleParent: (r: Reminder, nextEnabled: boolean) => Promise<void>;
  onToggleItem: (parentId: number, itemId: number, nextEnabled: boolean) => Promise<void>;

  formatDate: (dateString: string) => string;
}) {
  if (loading) return <Loading />;

  return (
    <div className="min-h-screen">
      {inlineToast ? (
        <PopupStatusToast
          variant={inlineToast.variant}
          title={inlineToast.title}
          message={inlineToast.message}
          durationMs={inlineToast.durationMs}
          onClose={() => setInlineToast(null)}
        />
      ) : null}

      {showLogoutPopup ? <LogoutPopup onDone={onLogoutPopupDone} /> : null}

      {(currentPath === '/404' || currentPath === '/not-found') && (
        <div className="absolute inset-0 z-[60] bg-[#070912]/50 flex items-center justify-center p-6">
          <div className="card-neon rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold text-white">404 - Page not found</h2>
            <p className="text-white/60 mt-2">
              The page you’re looking for doesn’t exist or the link is broken.
            </p>
          </div>
        </div>
      )}

      <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#070912]/70 backdrop-blur shadow-[0_8px_30px_rgba(0,0,0,0.45)] px-4 py-3">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center justify-start flex-1 min-w-0">
              <div className="text-white font-semibold text-sm sm:text-base truncate">
                Reminder App
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  window.location.href = '/settings';
                }}
                className="alarm-btn alarm-btn--ghost cursor-pointer text-white text-sm px-2.5 py-1.5 rounded-lg transition"
              >
                Settings
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 pt-6">
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

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => {
                  window.location.href = '/non-repeating-reminders';
                }}
                className="alarm-btn alarm-btn--ghost cursor-pointer text-white px-4 py-2 rounded-lg transition sm:px-6"
              >
                🔕 One-Time Reminders
              </button>

              <button
                type="button"
                onClick={() => setShowForm(!showForm)}
                className={`${
                  showForm
                    ? 'alarm-btn alarm-btn--danger'
                    : 'alarm-btn alarm-btn--primary'
                } cursor-pointer text-white px-4 py-2 rounded-lg transition sm:px-6`}
              >
                {showForm ? 'Cancel' : '+ Add Reminder'}
              </button>
            </div>
          </div>
        </div>

        <ReminderCreateModal
          open={showForm}
          onClose={() => setShowForm(false)}
          formData={formData}
          onChange={(patch) => setFormData((p) => ({ ...p, ...patch }))}
          onAddDescription={() => {
            // handled by parent
          }}
          onRemoveDescription={() => {
            // handled by parent
          }}
          onSubmit={onSubmitCreate}
        />

        <ReminderEditModal
          open={showEditForm}
          onClose={onCloseEdit}
          formData={formData}
          onChange={(patch) => setFormData((p) => ({ ...p, ...patch }))}
          onAddDescription={() => {
            // handled by parent
          }}
          onRemoveDescription={() => {
            // handled by parent
          }}
          onSubmit={onSubmitUpdate}
        />

        <div className="mt-6">
          <ReminderList
            reminders={filteredReminders}
            fcmToken={fcmToken}
            openMenuForId={openMenuForId}
            deletingId={deletingId}
            setOpenMenuForId={setOpenMenuForId}
            onEdit={onEditClick}
            onDelete={onDelete}
            onToggleParent={onToggleParent}
            onToggleItem={onToggleItem}
            formatDate={formatDate}
          />
        </div>
      </div>
    </div>
  );
}

