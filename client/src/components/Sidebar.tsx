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
  LogOut,
  Sparkles
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
    <aside className="w-64 bg-[#0b132b] text-slate-300 flex flex-col h-screen flex-shrink-0 select-none border-r border-slate-800/80 shadow-2xl relative z-20">
      {/* Brand Header */}
      <div className="p-5 flex items-center justify-between border-b border-slate-800/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25 text-white font-black text-xl tracking-tight border border-white/20">
            V
          </div>
          <div>
            <div className="text-white font-bold text-base leading-tight tracking-tight flex items-center gap-1">
              <span>Velozity</span>
            </div>
            <div className="text-[10px] font-semibold text-blue-400/90 tracking-wider uppercase">Global Solutions</div>
          </div>
        </div>
        <div className="w-2 h-2 rounded-full bg-emerald-400 ring-4 ring-emerald-500/20" title="System Online"></div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Main Workspace
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onMobileClose}
              className={({ isActive }) =>
                `group relative flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-600/90 text-white shadow-md shadow-blue-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 ? (
                    <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-rose-500 text-white shadow-sm ring-2 ring-rose-500/20">
                      {item.badge}
                    </span>
                  ) : null}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Workspace Plan Badge */}
      <div className="px-3 py-2 mx-3 mb-2 rounded-2xl bg-gradient-to-r from-blue-950/60 to-indigo-950/60 border border-blue-800/40 p-3">
        <div className="flex items-center gap-2 text-xs font-bold text-white">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Enterprise Workspace</span>
        </div>
        <p className="text-[10px] text-slate-400 mt-0.5">Real-time sync & WebSocket enabled</p>
      </div>

      {/* User Footer Profile */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/50">
        <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-inner">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-extrabold text-xs border border-white/20 flex items-center justify-center shadow-xs flex-shrink-0">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'AD'}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-white truncate">{user?.name || 'Aarav Mehta'}</div>
              <div className="text-[10px] font-medium text-slate-400 truncate flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>{user?.role === 'ADMIN' ? 'Administrator' : user?.role === 'PROJECT_MANAGER' ? 'Project Manager' : 'Developer'}</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            title="Log out"
            className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
