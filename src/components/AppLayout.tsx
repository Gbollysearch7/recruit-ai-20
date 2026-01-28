'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { ThemeToggle } from './ThemeToggle';
import { useAuth } from '@/lib/hooks/useAuth';
import { useToast } from './Toast';
import {
  LayoutDashboard,
  Search,
  History,
  Folder,
  ScanSearch,
  X,
  Sparkles,
  Settings,
  HelpCircle,
  LogOut,
  LogIn,
  Menu,
  Bell,
  ChevronDown,
  User
} from 'lucide-react';

interface AppLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Search', href: '/search', icon: Search },
  { name: 'Saved Searches', href: '/searches', icon: History },
  { name: 'My Lists', href: '/lists', icon: Folder },
];

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, profile, isLoading, isAuthenticated, isConfigured, signInWithGoogle, signOut } = useAuth();
  const { addToast } = useToast();

  const handleSignIn = async () => {
    if (!isConfigured) {
      addToast('Authentication is not configured', 'error');
      return;
    }
    try {
      await signInWithGoogle();
    } catch {
      addToast('Failed to sign in. Please try again.', 'error');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      addToast('Signed out successfully', 'success');
      setShowUserMenu(false);
    } catch {
      addToast('Failed to sign out. Please try again.', 'error');
    }
  };

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'User';
  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url;

  return (
    <div className="min-h-screen bg-[var(--bg-secondary)]">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-[220px] bg-[var(--bg-elevated)] border-r border-[var(--border-light)] transform transition-transform duration-200 ease-out lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-12 px-4 border-b border-[var(--border-light)]">
            <Link href="/" className="flex items-center gap-2 text-[var(--primary)] hover:opacity-80 transition-opacity">
              <ScanSearch className="w-5 h-5" />
              <span className="text-sm font-semibold text-[var(--text-primary)] tracking-tight">talist.ai</span>
            </Link>
            <button
              className="lg:hidden p-1 rounded text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Action */}
          <div className="px-3 py-3">
            <Link
              href="/search"
              className="btn btn-primary w-full justify-center"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              New Search
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-1 space-y-0.5 overflow-y-auto sidebar-scroll">
            <p className="px-2 py-1.5 text-[9px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Menu
            </p>
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-2 px-2 py-1.5 rounded text-xs font-medium transition-all ${isActive
                      ? 'bg-[var(--primary-light)] text-[var(--primary)]'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)]'
                    }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className={`w-4 h-4 ${isActive ? 'text-[var(--primary)]' : 'text-[var(--text-muted)]'}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Bottom section */}
          <div className="px-2 py-2 border-t border-[var(--border-light)] space-y-0.5">
            <Link
              href="/settings"
              className="flex items-center gap-2 px-2 py-1.5 rounded text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)] transition-all"
            >
              <Settings className="w-4 h-4 text-[var(--text-muted)]" />
              Settings
            </Link>
            <Link
              href="/help"
              className="flex items-center gap-2 px-2 py-1.5 rounded text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)] transition-all"
            >
              <HelpCircle className="w-4 h-4 text-[var(--text-muted)]" />
              Help & Support
            </Link>
          </div>

          {/* User section */}
          <div className="px-2 py-2 border-t border-[var(--border-light)]">
            {isLoading ? (
              <div className="flex items-center gap-2 px-2 py-1.5">
                <div className="w-7 h-7 rounded bg-[var(--bg-surface)] animate-pulse" />
                <div className="flex-1 min-w-0">
                  <div className="h-3 bg-[var(--bg-surface)] rounded animate-pulse w-20" />
                  <div className="h-2 bg-[var(--bg-surface)] rounded animate-pulse w-16 mt-1" />
                </div>
              </div>
            ) : isAuthenticated ? (
              <div className="flex items-center gap-2 px-2 py-1.5">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    className="w-7 h-7 rounded object-cover"
                  />
                ) : (
                  <div className="w-7 h-7 rounded bg-[var(--primary)] flex items-center justify-center text-white text-[10px] font-medium">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-[var(--text-primary)] truncate">{displayName}</p>
                  <p className="text-[10px] text-[var(--text-tertiary)] truncate">{user?.email}</p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="p-1 rounded text-[var(--text-tertiary)] hover:text-[var(--error)] hover:bg-[var(--error-bg)] transition-colors"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleSignIn}
                className="flex items-center gap-2 px-2 py-1.5 w-full rounded text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)] transition-all"
              >
                <div className="w-7 h-7 rounded bg-[var(--text-muted)] flex items-center justify-center text-white">
                  <User className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-xs font-medium text-[var(--text-primary)]">Guest User</p>
                  <p className="text-[10px] text-[var(--text-tertiary)]">Click to sign in</p>
                </div>
                <LogIn className="w-4 h-4 text-[var(--primary)]" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-[220px]">
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-12 bg-[var(--bg-elevated)]/95 backdrop-blur-sm border-b border-[var(--border-light)]">
          <div className="flex items-center justify-between h-full px-4">
            <div className="flex items-center gap-2">
              <button
                className="lg:hidden p-1.5 -ml-1.5 rounded text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <ThemeToggle />
              <button className="relative p-1.5 rounded text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-[var(--error)] rounded-full" />
              </button>
              <div className="hidden sm:block w-px h-5 bg-[var(--border-light)] mx-1" />
              {isLoading ? (
                <div className="hidden sm:flex items-center gap-1.5 px-2 py-1">
                  <div className="w-6 h-6 rounded bg-[var(--bg-surface)] animate-pulse" />
                  <div className="w-12 h-3 bg-[var(--bg-surface)] rounded animate-pulse" />
                </div>
              ) : isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] transition-colors"
                  >
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={displayName}
                        className="w-6 h-6 rounded object-cover"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded bg-[var(--primary)] flex items-center justify-center text-white text-[10px] font-medium">
                        {displayName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="font-medium max-w-[80px] truncate">{displayName}</span>
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                  {showUserMenu && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowUserMenu(false)}
                      />
                      <div className="absolute right-0 top-full mt-1 w-48 bg-[var(--bg-elevated)] rounded-lg shadow-lg border border-[var(--border-light)] py-1 z-50">
                        <div className="px-3 py-2 border-b border-[var(--border-light)]">
                          <p className="text-xs font-medium text-[var(--text-primary)] truncate">{displayName}</p>
                          <p className="text-[10px] text-[var(--text-tertiary)] truncate">{user?.email}</p>
                        </div>
                        <Link
                          href="/settings"
                          className="flex items-center gap-2 px-3 py-2 text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <Settings className="w-3.5 h-3.5" />
                          Settings
                        </Link>
                        <button
                          onClick={handleSignOut}
                          className="flex items-center gap-2 px-3 py-2 text-xs text-[var(--error)] hover:bg-[var(--error-bg)] transition-colors w-full"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          Sign Out
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <button
                  onClick={handleSignIn}
                  className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] transition-colors"
                >
                  <div className="w-6 h-6 rounded bg-[var(--text-muted)] flex items-center justify-center text-white">
                    <User className="w-4 h-4" />
                  </div>
                  <span className="font-medium">Sign In</span>
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
