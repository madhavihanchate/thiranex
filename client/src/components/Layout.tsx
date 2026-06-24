import { ReactNode, useState } from 'react';
import { useAuthStore } from '../store/authStore';

// SVG Icons
const GridIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);

const LogoutIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const PlusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

interface LayoutProps {
  children: ReactNode;
  onNewTask: () => void;
}

export default function Layout({ children, onNewTask }: LayoutProps) {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface-primary flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border bg-glass-strong backdrop-blur-xl fixed inset-y-0 left-0 z-30">
        {/* Logo */}
        <div className="p-6 border-b border-border">
          <h1 className="text-xl font-bold gradient-text">✦ Thiranex</h1>
          <p className="text-xs text-text-muted mt-1">Task Management</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4">
          <a
            href="#"
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-accent-primary/10 text-accent-tertiary font-medium text-sm transition-all"
          >
            <GridIcon />
            Dashboard
          </a>
        </nav>

        {/* User */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center text-white text-sm font-bold">
              {user?.email?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary truncate">{user?.email}</p>
              <span className={`text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full ${
                user?.role === 'admin' ? 'bg-warning/20 text-warning' : 'bg-info/20 text-info'
              }`}>
                {user?.role}
              </span>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 w-full px-4 py-2.5 mt-2 text-sm text-text-muted hover:text-danger rounded-xl hover:bg-danger/10 transition-all"
          >
            <LogoutIcon /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 pb-20 md:pb-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-20 border-b border-border bg-glass-strong/80 backdrop-blur-xl px-4 md:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-surface-tertiary transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>
              <h2 className="text-lg font-semibold text-text-primary">My Tasks</h2>
            </div>
            <button onClick={onNewTask} className="btn-primary">
              <PlusIcon /> <span className="hidden sm:inline">New Task</span>
            </button>
          </div>
        </header>

        <div className="p-4 md:p-8">{children}</div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-glass-strong border-t border-border backdrop-blur-xl">
        <div className="flex items-center justify-around py-2">
          <button className="flex flex-col items-center gap-1 p-2 text-accent-tertiary">
            <GridIcon />
            <span className="text-[10px] font-medium">Dashboard</span>
          </button>
          <button
            onClick={onNewTask}
            className="flex items-center justify-center w-12 h-12 -mt-6 rounded-full bg-gradient-to-br from-accent-primary to-accent-secondary shadow-lg shadow-accent-primary/30"
          >
            <PlusIcon />
          </button>
          <button onClick={logout} className="flex flex-col items-center gap-1 p-2 text-text-muted">
            <LogoutIcon />
            <span className="text-[10px] font-medium">Logout</span>
          </button>
        </div>
      </nav>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-40 animate-fade-in" onClick={() => setSidebarOpen(false)}>
          <div className="absolute inset-0 bg-overlay" />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-surface-secondary border-r border-border p-6 animate-slide-up">
            <h1 className="text-xl font-bold gradient-text mb-6">✦ Thiranex</h1>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-tertiary/50">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center text-white text-sm font-bold">
                {user?.email?.[0]?.toUpperCase() || '?'}
              </div>
              <div>
                <p className="text-sm font-medium text-text-primary">{user?.email}</p>
                <span className="text-xs text-text-muted">{user?.role}</span>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
