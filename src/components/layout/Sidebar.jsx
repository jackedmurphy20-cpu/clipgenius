import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Plus, Library, Sparkles, LogOut, BarChart2, TrendingUp } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const navItems = [
  { path: '/Dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/NewProject', label: 'New Project', icon: Plus },
  { path: '/ContentLibrary', label: 'Content Library', icon: Library },
  { path: '/Analytics', label: 'Analytics', icon: BarChart2 },
  { path: '/ViralTracker', label: 'Viral Tracker', icon: TrendingUp },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-card border-r border-border flex flex-col z-50">
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-base font-bold text-foreground tracking-tight">ClipForge</h1>
            <p className="text-[11px] text-muted-foreground">AI Content Generator</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {navItems.map(({ path, label, icon: Icon }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-primary/15 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-border">
        <button
          onClick={() => base44.auth.logout()}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary w-full transition-all"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}