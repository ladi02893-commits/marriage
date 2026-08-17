'use client';

import React, { useState } from 'react';
import { Settings, Lock, Bell, UserX, Save, Check } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';

export default function AccountSettingsPage() {
  const { currentUser } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [notifyOnInterest, setNotifyOnInterest] = useState(true);
  const [notifyOnMessage, setNotifyOnMessage] = useState(true);
  const [notifyNewsletter, setNotifyNewsletter] = useState(false);

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword !== confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }
    toast.success('Password updated securely.');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleSaveNotifications = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Notification preferences updated.');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="border-b border-border pb-4">
        <h1 className="text-2xl font-bold font-serif text-foreground">Account & Security Settings</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Manage your password, login sessions, and transactional email notification rules.
        </p>
      </div>

      {/* Password Change Form */}
      <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <Lock className="h-5 w-5 text-brand-600" />
          <h3 className="text-sm font-bold text-foreground">Change Account Password</h3>
        </div>

        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs text-foreground focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">New Secure Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs text-foreground focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs text-foreground focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="rounded-xl bg-brand-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-brand-700"
          >
            Update Password
          </button>
        </form>
      </div>

      {/* Notifications Preferences */}
      <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <Bell className="h-5 w-5 text-gold-600" />
          <h3 className="text-sm font-bold text-foreground">Email Notifications</h3>
        </div>

        <form onSubmit={handleSaveNotifications} className="space-y-3 text-xs">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={notifyOnInterest}
              onChange={(e) => setNotifyOnInterest(e.target.checked)}
              className="rounded border-border text-brand-600 focus:ring-brand-500 h-4 w-4"
            />
            <span className="text-foreground font-medium">
              Send instant email notification when a new match expresses connection interest
            </span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={notifyOnMessage}
              onChange={(e) => setNotifyOnMessage(e.target.checked)}
              className="rounded border-border text-brand-600 focus:ring-brand-500 h-4 w-4"
            />
            <span className="text-foreground font-medium">
              Send instant email notification for unread direct messages
            </span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={notifyNewsletter}
              onChange={(e) => setNotifyNewsletter(e.target.checked)}
              className="rounded border-border text-brand-600 focus:ring-brand-500 h-4 w-4"
            />
            <span className="text-foreground font-medium">
              Subscribe to TRUEPAIR weekly curated matchmaking digest
            </span>
          </label>

          <div className="pt-2">
            <button
              type="submit"
              className="rounded-xl bg-brand-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-brand-700"
            >
              Save Email Preferences
            </button>
          </div>
        </form>
      </div>

      {/* Danger Zone: Account Deletion */}
      <div className="rounded-3xl border border-rose-200 bg-rose-50/50 p-6 sm:p-8 shadow-sm dark:border-rose-950 dark:bg-rose-950/20 space-y-3">
        <div className="flex items-center gap-2">
          <UserX className="h-5 w-5 text-rose-600" />
          <h3 className="text-sm font-bold text-rose-900 dark:text-rose-200">Delete Account & Purge Dossier</h3>
        </div>
        <p className="text-xs text-rose-800/80 dark:text-rose-300 leading-relaxed">
          Permanently delete your profile, photos, and chat history in accordance with GDPR right to erasure. This action cannot be undone.
        </p>
        <button
          type="button"
          onClick={() => toast.error('To protect members, account deletion requires contacting the compliance desk.')}
          className="rounded-xl border border-rose-300 bg-white px-4 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 shadow-sm dark:bg-card dark:border-rose-800 dark:text-rose-300"
        >
          Request Account Deletion
        </button>
      </div>
    </div>
  );
}
