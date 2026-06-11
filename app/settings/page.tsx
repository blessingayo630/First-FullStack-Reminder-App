          'use client';
 
import React from 'react';
import Switch from '@mui/material/Switch';
import clsx from 'clsx';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useRouter } from 'next/navigation'; 

type TabKey = 'notification_preference' | 'change_email';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = React.useState<TabKey>('notification_preference');
const router = useRouter();
  const [emailEnabled, setEmailEnabled] = React.useState(true);
  const [newEmail, setNewEmail] = React.useState('');
  const [whatsappEnabled, setWhatsappEnabled] = React.useState(false);

  const toggleEmail = (checked: boolean) => {
  setEmailEnabled(checked); 

  // If Email is turned off, automatically enable WhatsApp
  if (!checked) {
    setWhatsappEnabled(true);
  }
};

const toggleWhatsapp = (checked: boolean) => {
  setWhatsappEnabled(checked);

  // If WhatsApp is turned off, automatically enable Email
  if (!checked) {
    setEmailEnabled(true);
  }
};

  // const toggleEmail = (checked: boolean) => {
    // Must keep at least one channel enabled.
    // if (!checked && !whatsappEnabled) return;
  //   setEmailEnabled(checked);
  //   if (!checked && whatsappEnabled) setWhatsappEnabled(true);
  // };

  // const toggleWhatsapp = (checked: boolean) => {
  //   // Must keep at least one channel enabled.
  //   if (!checked && !emailEnabled) return;
  //   setWhatsappEnabled(checked);
  //   if (!checked && emailEnabled) setEmailEnabled(true);
  // };

  const tabButtonBase =
    'px-5 py-3 text-sm font-semibold transition cursor-pointer select-none border-b-2';

  return (
    <div 
    className="min-h-screen flex items-center justify-center px-4 py-10"
    // className="min-h-screen px-4 py-10"
    >
      <div className="w-full max-w-3xl">
        <div className="card-neon rounded-lg p-6">
          <div className="flex justify-between item-align item-center">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white">Settings</h1>
            <p className="text-white/60 mt-2 text-sm">
              Notification & account preferences.
            </p>
          </div>

          <div>
            <button
    type="button"
    onClick={() => router.push('/homepage')}
    className="
      flex items-center gap-2
      text-white/70
      hover:text-amber-300
      transition-colors
      cursor-pointer
    "
  >
        <ArrowBackIcon fontSize="small" />
         <span>Back</span>
     </button>
          </div>

          </div>

          <div className="mb-6">
            <div className="flex w-full justify-center border-b border-white/10">
              <div className="flex w-full justify-center">
                <button
                  type="button"
                  onClick={() => setActiveTab('notification_preference')}
                  className={clsx(tabButtonBase, {
                    'text-amber-200 border-amber-300':
                      activeTab === 'notification_preference',
                    'text-white/70 hover:text-white/90 border-transparent':
                      activeTab !== 'notification_preference',
                  })}
                  aria-selected={activeTab === 'notification_preference'}
                  role="tab"
                >
                  Notification Preference
                </button>

                <button
                  type="button" 
                  onClick={() => setActiveTab('change_email')}
                  className={clsx(tabButtonBase, {
                    'text-amber-200 border-amber-300': activeTab === 'change_email',
                    'text-white/70 hover:text-white/90 border-transparent':
                      activeTab !== 'change_email',
                  })}
                  aria-selected={activeTab === 'change_email'}
                  role="tab"
                >
                  Change Email
                </button>
              </div>
            </div>
          </div>

          <div role="tabpanel">
            {activeTab === 'notification_preference' ? (
              <div className="flex flex-col gap-5">
                <div className="flex items-start justify-between gap-4 rounded-lg border border-white/10 bg-black/10 p-4">
                  <div className="min-w-0">
                    <p className="text-white font-semibold">Email</p>
                    <p className="text-white/60 text-sm mt-1">Get reminder alerts by email.</p>
                  </div>
                  <Switch
                    className="alarm-switch"
                    checked={emailEnabled}
                    onChange={(e) => toggleEmail(e.target.checked)}
                    aria-label="Enable email reminders"
                  />

                </div>

                <div 
                className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md p-5 transition-all duration-300 hover:border-amber-300/30 hover:bg-white/[0.05]"
                // className="flex items-start justify-between gap-4 rounded-lg border border-white/10 bg-black/10 p-4"
                >
                  <div className="min-w-0">
                    <p className="text-white font-semibold">WhatsApp Business</p>
                    <p className="text-white/60 text-sm mt-1">Receive reminder alerts on WhatsApp.</p>
                  </div>
                  <Switch
                    className="alarm-switch"
                    checked={whatsappEnabled}
                    onChange={(e) => toggleWhatsapp(e.target.checked)}
                    aria-label="Enable whatsapp business reminders"
                  />
                </div>

                <div className="text-white/60 text-xs mt-1">
                  Tip: At least one notification channel must stay enabled.
                </div>
              </div>
            ) : null}

           {activeTab === 'change_email' ? (
  <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md p-5">

    <div className="flex flex-col gap-2">
      <label
        htmlFor="change-email"
        className="text-md font-medium text-white/80"
      >
        Change Email
      </label>
       <p className="text-white/60 text-sm">
        Update the email address associated with your account.
      </p>

      <input
        id="change-email"
        type="email"
        value={newEmail}
        onChange={(e) => setNewEmail(e.target.value)}
        placeholder="Enter new email address"
        className="
          w-full
          rounded-xl
          border
          border-white/10
          bg-black/20
          px-4
          py-3
          text-white
          placeholder:text-white/40
          outline-none
          transition-all
          focus:border-amber-300
          focus:ring-2
          focus:ring-amber-300/20
        "
      />
    </div>

    <button
      type="button"
      className="
        mt-5
        alarm-btn
        alarm-btn--primary
        px-5
        py-2
        rounded-lg
        text-white
      "
    >
      Update Email
    </button>
  </div>
) : null}
          </div>
        </div>
      </div>
    </div>
  );
}







