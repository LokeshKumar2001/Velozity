import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../redux/store.ts';
import { logoutUser } from '../redux/authSlice.ts';
import { markNotificationRead, markAllNotificationsRead } from '../redux/notificationsSlice.ts';
import { useTheme } from '../context/ThemeContext.tsx';
import { Search, Bell, Menu, CheckCheck, ChevronDown, User as UserIcon, LogOut, Sun, Moon } from 'lucide-react';

interface TopHeaderProps {
  onMobileMenuToggle?: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({ onMobileMenuToggle }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { user } = useAppSelector((state) => state.auth);
  const { items: notifications, unreadCount } = useAppSelector((state) => state.notifications);

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = async () => {
    setShowUserMenu(false);
    await dispatch(logoutUser());
    navigate('/login');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/tasks?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-6 flex items-center justify-between sticky top-0 z-30 shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition-colors">
      {/* Left Search & Mobile Toggle */}
      <div className="flex items-center gap-4 flex-1 max-w-lg">
        {onMobileMenuToggle && (
          <button
            onClick={onMobileMenuToggle}
            className="md:hidden p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects, tasks, users..."
            className="w-full pl-10 pr-12 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/90 dark:border-slate-700/80 rounded-2xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-xs"
          />
          <kbd className="hidden sm:inline-flex items-center gap-0.5 absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md shadow-2xs pointer-events-none">
            ⌘K
          </kbd>
        </form>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="p-2.5 rounded-2xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 relative transition-all duration-150 border border-transparent hover:border-slate-200/80 dark:hover:border-slate-700/80 cursor-pointer"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600" />
          )}
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2.5 rounded-2xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 relative transition-all duration-150 border border-transparent hover:border-slate-200/80 dark:hover:border-slate-700/80"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900"></span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-extrabold text-slate-900 dark:text-slate-100">Notifications ({unreadCount})</span>
                {unreadCount > 0 && (
                  <button
                    onClick={() => dispatch(markAllNotificationsRead())}
                    className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                {notifications.length === 0 ? (
                  <div className="p-5 text-center text-xs text-slate-400">No new notifications</div>
                ) : (
                  notifications.slice(0, 5).map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => !notif.isRead && dispatch(markNotificationRead(notif.id))}
                      className={`p-3.5 text-xs cursor-pointer transition-colors ${
                        notif.isRead ? 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400' : 'bg-blue-50/40 dark:bg-blue-950/30 text-slate-800 dark:text-slate-200 font-semibold'
                      } hover:bg-slate-50 dark:hover:bg-slate-800/50`}
                    >
                      <p className="line-clamp-2 leading-relaxed">{notif.message}</p>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))
                )}
              </div>

              <div className="px-4 py-2.5 border-t border-slate-100 dark:border-slate-800 text-center bg-slate-50/50 dark:bg-slate-900/50 rounded-b-3xl">
                <Link
                  to="/notifications"
                  onClick={() => setShowNotifications(false)}
                  className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  View all notifications &rarr;
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Standard User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors shadow-2xs cursor-pointer"
          >
            <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'AM'}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight">{user?.name || 'Aarav Mehta'}</div>
              <div className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                {user?.role === 'ADMIN' ? 'Admin' : user?.role === 'PROJECT_MANAGER' ? 'PM' : 'Developer'}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                <p className="text-xs font-extrabold text-slate-900 dark:text-slate-100 truncate">{user?.name || 'Aarav Mehta'}</p>
                <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 truncate">{user?.email || 'admin@velozity.com'}</p>
                <span className="inline-block text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 mt-1.5">
                  {user?.role === 'ADMIN' ? 'Administrator' : user?.role === 'PROJECT_MANAGER' ? 'Project Manager' : 'Developer'}
                </span>
              </div>
              <div className="py-1 text-xs">
                <button
                  onClick={() => { setShowUserMenu(false); navigate('/users'); }}
                  className="w-full text-left px-4 py-2.5 flex items-center gap-2.5 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors font-medium cursor-pointer"
                >
                  <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                  My Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2.5 flex items-center gap-2.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors font-bold border-t border-slate-100 dark:border-slate-800 mt-1 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-500" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
