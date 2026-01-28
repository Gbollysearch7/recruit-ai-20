'use client';

import { AppLayout } from '@/components/AppLayout';
import { useAuth } from '@/lib/hooks/useAuth';
import { useState } from 'react';
import {
  User,
  Bell,
  Shield,
  Palette,
  Save,
  Check,
  Trash2,
  AlertTriangle,
  Download
} from 'lucide-react';

export default function SettingsPage() {
  const { user, profile, isAuthenticated, isLoading, signOut } = useAuth();
  const [saved, setSaved] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    searchComplete: true,
    weeklyDigest: false,
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE') return;

    setIsDeleting(true);
    // TODO: Implement actual account deletion via Supabase
    // For now, sign out and show success
    setTimeout(async () => {
      await signOut();
      window.location.href = '/?deleted=true';
    }, 1000);
  };

  const handleExportData = () => {
    // TODO: Implement data export
    alert('Data export feature coming soon. Contact support@talist.ai to request your data.');
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 bg-[var(--bg-surface)] rounded" />
          <div className="h-64 bg-[var(--bg-surface)] rounded-lg" />
        </div>
      </AppLayout>
    );
  }

  if (!isAuthenticated) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 bg-[var(--bg-surface)] rounded-full flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-[var(--text-tertiary)]" />
          </div>
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">Sign in required</h2>
          <p className="text-[var(--text-secondary)] max-w-sm">
            Please sign in to access your account settings.
          </p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Settings</h1>

        {/* Profile Section */}
        <section className="bg-[var(--bg-elevated)] rounded-lg border border-[var(--border-light)] p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <User className="w-5 h-5 text-[var(--text-tertiary)]" />
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">Profile</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                Display Name
              </label>
              <input
                type="text"
                defaultValue={profile?.full_name || user?.email?.split('@')[0] || ''}
                className="w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                Email
              </label>
              <input
                type="email"
                defaultValue={user?.email || ''}
                disabled
                className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-light)] rounded-lg text-[var(--text-tertiary)] text-sm cursor-not-allowed"
              />
              <p className="text-xs text-[var(--text-tertiary)] mt-1">Email cannot be changed</p>
            </div>
          </div>
        </section>

        {/* Notifications Section */}
        <section className="bg-[var(--bg-elevated)] rounded-lg border border-[var(--border-light)] p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Bell className="w-5 h-5 text-[var(--text-tertiary)]" />
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">Notifications</h2>
          </div>

          <div className="space-y-4">
            {[
              { key: 'email', label: 'Email notifications', desc: 'Receive updates via email' },
              { key: 'searchComplete', label: 'Search completed', desc: 'Get notified when a search finishes' },
              { key: 'weeklyDigest', label: 'Weekly digest', desc: 'Summary of your sourcing activity' },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">{item.label}</p>
                  <p className="text-xs text-[var(--text-tertiary)]">{item.desc}</p>
                </div>
                <button
                  onClick={() => setNotifications(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof prev] }))}
                  className={`w-10 h-6 rounded-full transition-colors ${
                    notifications[item.key as keyof typeof notifications]
                      ? 'bg-[var(--primary)]'
                      : 'bg-[var(--bg-surface)]'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${
                      notifications[item.key as keyof typeof notifications]
                        ? 'translate-x-5'
                        : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Appearance Section */}
        <section className="bg-[var(--bg-elevated)] rounded-lg border border-[var(--border-light)] p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Palette className="w-5 h-5 text-[var(--text-tertiary)]" />
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">Appearance</h2>
          </div>

          <p className="text-sm text-[var(--text-secondary)]">
            Theme preferences can be toggled using the theme button in the top navigation bar.
          </p>
        </section>

        {/* Data & Privacy Section */}
        <section className="bg-[var(--bg-elevated)] rounded-lg border border-[var(--border-light)] p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-5 h-5 text-[var(--text-tertiary)]" />
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">Data & Privacy</h2>
          </div>

          <div className="space-y-4">
            {/* Export Data */}
            <div className="flex items-center justify-between p-4 bg-[var(--bg-surface)] rounded-lg">
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">Export your data</p>
                <p className="text-xs text-[var(--text-tertiary)]">Download a copy of all your data</p>
              </div>
              <button
                onClick={handleExportData}
                className="btn btn-secondary"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>

            {/* Delete Account */}
            <div className="flex items-center justify-between p-4 bg-[var(--error)]/5 border border-[var(--error)]/20 rounded-lg">
              <div>
                <p className="text-sm font-medium text-[var(--error)]">Delete account</p>
                <p className="text-xs text-[var(--text-tertiary)]">Permanently delete your account and all data</p>
              </div>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="btn bg-[var(--error)] text-white hover:bg-red-600"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        </section>

        {/* Save Button */}
        <button
          onClick={handleSave}
          className="btn btn-primary"
        >
          {saved ? (
            <>
              <Check className="w-4 h-4" />
              Saved
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Changes
            </>
          )}
        </button>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowDeleteModal(false)}
          />
          <div className="relative bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-light)] shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[var(--error)]/10 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-[var(--error)]" />
              </div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">Delete your account?</h3>
            </div>

            <p className="text-sm text-[var(--text-secondary)] mb-4">
              This action is <strong>permanent and cannot be undone</strong>. All your data including:
            </p>
            <ul className="text-sm text-[var(--text-secondary)] mb-6 space-y-1 ml-4">
              <li>• Your profile and settings</li>
              <li>• All saved searches</li>
              <li>• Candidate lists and notes</li>
              <li>• Search history</li>
            </ul>

            <p className="text-sm text-[var(--text-secondary)] mb-2">
              Type <strong>DELETE</strong> to confirm:
            </p>
            <input
              type="text"
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              placeholder="DELETE"
              className="w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--error)]/50 mb-4"
            />

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmation('');
                }}
                className="flex-1 btn btn-secondary justify-center"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmation !== 'DELETE' || isDeleting}
                className="flex-1 btn bg-[var(--error)] text-white hover:bg-red-600 justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  'Delete Account'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
