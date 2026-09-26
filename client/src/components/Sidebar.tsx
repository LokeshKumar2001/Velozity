import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../redux/store.ts';
import { logoutUser } from '../redux/authSlice.ts';
import { 
  LayoutDashboard, 
  FolderKanban, 
  CheckSquare, 
  Activity, 
  Bell, 
  Users, 
  Building2, 
  LogOut
} from 'lucide-react';

interface SidebarProps {
  onMobileClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onMobileClose }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const { unreadCount } = useAppSelector((state) => state.notifications);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Projects', path: '/projects', icon: FolderKanban },
    { label: 'Tasks', path: '/tasks', icon: CheckSquare },
    { label: 'Activity Feed', path: '/activity', icon: Activity },
    { label: 'Notifications', path: '/notifications', icon: Bell, badge: unreadCount },
    { label: 'Users', path: '/users', icon: Users },
    { label: 'Clients', path: '/clients', icon: Building2 },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 flex flex-col h-screen flex-shrink-0 select-none border-r border-slate-200/90 dark:border-slate-800/90 shadow-sm relative z-20 transition-colors">
      {/* Clean Brand Header */}
      <div className="p-5 flex items-center gap-3 border-b border-slate-100 dark:border-slate-800">
        <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-extrabold text-lg tracking-tight shadow-xs">
          V
        </div>
        <div>
          <div className="text-slate-900 dark:text-slate-100 font-extrabold text-base leading-tight tracking-tight">
            Velozity
          </div>
          <div className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 tracking-wider uppercase mt-0.5">
            Global Solutions
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onMobileClose}
              className={({ isActive }) =>
                `group relative flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/80 dark:hover:bg-slate-800/60'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-200'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 ? (
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${isActive ? 'bg-white text-blue-700' : 'bg-rose-500 text-white'}`}>
                      {item.badge}
                    </span>
                  ) : null}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Clean User Profile Footer */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60">
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700/80 shadow-2xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'AM'}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{user?.name || 'Aarav Mehta'}</div>
              <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400 truncate">
                {user?.role === 'ADMIN' ? 'Administrator' : user?.role === 'PROJECT_MANAGER' ? 'Project Manager' : 'Developer'}
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            title="Log out"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
