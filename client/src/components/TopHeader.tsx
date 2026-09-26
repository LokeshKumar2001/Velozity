import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../redux/store.ts';
import { loginUser } from '../redux/authSlice.ts';
import { markNotificationRead, markAllNotificationsRead } from '../redux/notificationsSlice.ts';
import { Search, Bell, Menu, CheckCheck, ChevronDown } from 'lucide-react';

interface TopHeaderProps {
  onMobileMenuToggle?: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({ onMobileMenuToggle }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const { onlineCount } = useAppSelector((state) => state.dashboard);
  const { items: notifications, unreadCount } = useAppSelector((state) => state.notifications);

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const DEMO_PERSONAS = [
    { label: 'Admin (Aarav Mehta)', email: 'admin@velozity.com', role: 'ADMIN' },
    { label: 'PM (Priya Sharma)', email: 'priya@velozity.com', role: 'PROJECT_MANAGER' },
    { label: 'PM (Rahul Kumar)', email: 'rahul@velozity.com', role: 'PROJECT_MANAGER' },
    { label: 'Dev (Ravi Teja)', email: 'ravi@velozity.com', role: 'DEVELOPER' },
    { label: 'Dev (Sneha Reddy)', email: 'sneha@velozity.com', role: 'DEVELOPER' },
  ];

  const handleQuickSwitch = async (email: string) => {
    setShowUserMenu(false);
    await dispatch(loginUser({ email, password: 'Password@123' }));
    navigate('/dashboard');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/tasks?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-6 flex items-center justify-between sticky top-0 z-30 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      {/* Left Search & Mobile Toggle */}
      <div className="flex items-center gap-4 flex-1 max-w-lg">
        {onMobileMenuToggle && (
          <button
            onClick={onMobileMenuToggle}
            className="md:hidden p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects, tasks, users..."
            className="w-full pl-10 pr-12 py-2 bg-slate-50 border border-slate-200/90 rounded-2xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-xs"
          />
          <kbd className="hidden sm:inline-flex items-center gap-0.5 absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 bg-white border border-slate-200 rounded-md shadow-2xs pointer-events-none">
            ⌘K
          </kbd>
        </form>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Live Presence Indicator */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50/80 border border-emerald-200/80 text-xs font-semibold text-emerald-700 shadow-2xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[11px] font-bold">
            {onlineCount || 5} Online
          </span>
        </div>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2.5 rounded-2xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 relative transition-all duration-150 border border-transparent hover:border-slate-200/80"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-3xl border border-slate-200/90 shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100">
                <span className="text-xs font-extrabold text-slate-900">Notifications ({unreadCount})</span>
                {unreadCount > 0 && (
                  <button
                    onClick={() => dispatch(markAllNotificationsRead())}
                    className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="p-5 text-center text-xs text-slate-400">No new notifications</div>
                ) : (
                  notifications.slice(0, 5).map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => !notif.isRead && dispatch(markNotificationRead(notif.id))}
                      className={`p-3.5 text-xs cursor-pointer transition-colors ${
                        notif.isRead ? 'bg-white text-slate-500' : 'bg-blue-50/40 text-slate-800 font-semibold'
                      } hover:bg-slate-50`}
                    >
                      <p className="line-clamp-2 leading-relaxed">{notif.message}</p>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))
                )}
              </div>

              <div className="px-4 py-2.5 border-t border-slate-100 text-center bg-slate-50/50 rounded-b-3xl">
                <Link
                  to="/notifications"
                  onClick={() => setShowNotifications(false)}
                  className="text-xs font-bold text-blue-600 hover:underline"
                >
                  View all notifications &rarr;
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Switcher / Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1.5 rounded-2xl border border-slate-200/80 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'AM'}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-bold text-slate-900 leading-tight">{user?.name || 'Aarav Mehta'}</div>
              <div className="text-[10px] text-slate-400 font-medium">
                {user?.role === 'ADMIN' ? 'Admin' : user?.role === 'PROJECT_MANAGER' ? 'PM' : 'Developer'}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-60 bg-white rounded-3xl border border-slate-200/90 shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Quick Persona Switch</p>
              </div>
              <div className="py-1">
                {DEMO_PERSONAS.map((persona) => (
                  <button
                    key={persona.email}
                    onClick={() => handleQuickSwitch(persona.email)}
                    className={`w-full text-left px-4 py-2.5 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors ${
                      user?.email === persona.email ? 'font-bold text-blue-600 bg-blue-50/50' : 'text-slate-700'
                    }`}
                  >
                    <span className="truncate">{persona.label}</span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500 font-bold ml-2">
                      {persona.role === 'ADMIN' ? 'ADMIN' : persona.role === 'PROJECT_MANAGER' ? 'PM' : 'DEV'}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
