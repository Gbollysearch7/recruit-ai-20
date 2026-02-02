'use client';

import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { useAuth } from '@/lib/hooks/useAuth';
import { useToast } from '@/components/Toast';
import Link from 'next/link';

export default function SettingsPage() {
  const { user, profile, isAuthenticated, isLoading: authLoading, updateProfile, updatePassword, signOut } = useAuth();
  const { addToast } = useToast();

  const [fullName, setFullName] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Populate form from profile
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setCompany(profile.company || '');
      setRole(profile.role || '');
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      await updateProfile({
        full_name: fullName.trim() || undefined,
        company: company.trim() || undefined,
        role: role.trim() || undefined,
      });
      addToast('Profile updated', 'success');
    } catch {
      addToast('Failed to update profile', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      addToast('Passwords do not match', 'error');
      return;
    }
    if (newPassword.length < 6) {
      addToast('Password must be at least 6 characters', 'error');
      return;
    }

    setIsChangingPassword(true);
    try {
      await updatePassword(newPassword);
      addToast('Password updated', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      addToast('Failed to update password', 'error');
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Auth gate
  if (!authLoading && !isAuthenticated) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-14 h-14 rounded-full bg-[var(--primary-light)] flex items-center justify-center mb-4">
            <span className="material-icons-outlined text-2xl text-[var(--primary)]">lock</span>
          </div>
          <h1 className="text-lg font-semibold text-[var(--text-primary)] tracking-tight mb-1.5">
            Sign in to access settings
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mb-5">
            You need to be signed in to manage your profile and preferences.
          </p>
          <Link href="/auth/login?redirect=/settings" className="btn btn-primary">
            <span className="material-icons-outlined text-sm">login</span>
            Sign In
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-xl font-semibold text-[var(--text-primary)] tracking-tight">Settings</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5">Manage your profile and account settings</p>
        </div>

        {/* Profile Section */}
        <div className="bg-[var(--bg-elevated)] rounded-lg border border-[var(--border-light)] overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--border-light)]">
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">Profile</h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">Your personal information</p>
          </div>

          <div className="p-5 space-y-4">
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-lg bg-[var(--primary)] flex items-center justify-center text-white text-xl font-semibold">
                {(fullName || user?.email || '?').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">{fullName || 'No name set'}</p>
                <p className="text-xs text-[var(--text-muted)]">{user?.email}</p>
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1.5">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your name"
                className="w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-primary)] px-3 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--border-focus)] focus:outline-none transition-colors"
              />
            </div>

            {/* Company */}
            <div>
              <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1.5">Company</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Your company"
                className="w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-primary)] px-3 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--border-focus)] focus:outline-none transition-colors"
              />
            </div>

            {/* Role */}
            <div>
              <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1.5">Role</label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g., Recruiter, HR Manager, Hiring Manager"
                className="w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-primary)] px-3 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--border-focus)] focus:outline-none transition-colors"
              />
            </div>

            {/* Email (read-only) */}
            <div>
              <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1.5">Email</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full rounded-lg border border-[var(--border-light)] bg-[var(--bg-surface)] px-3 py-2.5 text-sm text-[var(--text-muted)] cursor-not-allowed"
              />
              <p className="text-[10px] text-[var(--text-muted)] mt-1">Email cannot be changed</p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="px-4 py-2 text-xs font-medium bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>

        {/* Password Section */}
        <div className="bg-[var(--bg-elevated)] rounded-lg border border-[var(--border-light)] overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--border-light)]">
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">Change Password</h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">Update your account password</p>
          </div>

          <div className="p-5 space-y-4">
            <div>
              <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1.5">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-primary)] px-3 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--border-focus)] focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1.5">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-primary)] px-3 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--border-focus)] focus:outline-none transition-colors"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleChangePassword}
                disabled={isChangingPassword || !newPassword || !confirmPassword}
                className="px-4 py-2 text-xs font-medium bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isChangingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-[var(--bg-elevated)] rounded-lg border border-[var(--error)]/20 overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--error)]/10">
            <h2 className="text-sm font-semibold text-[var(--error)]">Danger Zone</h2>
          </div>

          <div className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">Sign Out</p>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">Sign out of your account on this device</p>
              </div>
              <button
                onClick={async () => {
                  await signOut();
                  window.location.href = '/';
                }}
                className="px-4 py-2 text-xs font-medium border border-[var(--error)]/20 text-[var(--error)] rounded-lg hover:bg-[var(--error-bg)] transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
