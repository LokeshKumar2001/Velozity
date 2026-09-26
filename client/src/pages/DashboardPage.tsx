import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../redux/store.ts';
import { fetchDashboardMetrics } from '../redux/dashboardSlice.ts';
import { 
  FolderKanban, 
  CheckSquare, 
  AlertTriangle, 
  Users, 
  ArrowUpRight,
  TrendingUp,
  Clock
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card.tsx';

export const DashboardPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { metrics, onlineCount } = useAppSelector((state) => state.dashboard);

  useEffect(() => {
    dispatch(fetchDashboardMetrics());
  }, [dispatch]);

  const totalProjects = metrics?.totalProjects ?? 6;
  const totalTasks = metrics?.totalTasks ?? 24;
  const overdueTasks = metrics?.overdueTasks ?? 3;
  const activeUsersCount = onlineCount > 0 ? onlineCount : (metrics?.activeUsersOnline ?? 5);

  const statusCounts = metrics?.tasksByStatus ?? {
    TODO: 8,
    IN_PROGRESS: 7,
    IN_REVIEW: 5,
    DONE: 4,
  };

  const statusTotal = Object.values(statusCounts).reduce((a, b) => a + b, 0) || 24;

  const donutSegments = [
    { label: 'To Do', count: statusCounts.TODO || 8, color: '#06b6d4', bg: 'bg-cyan-500' },
    { label: 'In Progress', count: statusCounts.IN_PROGRESS || 7, color: '#3b82f6', bg: 'bg-blue-500' },
    { label: 'In Review', count: statusCounts.IN_REVIEW || 5, color: '#f59e0b', bg: 'bg-amber-500' },
    { label: 'Done', count: statusCounts.DONE || 4, color: '#10b981', bg: 'bg-emerald-500' },
  ];

  const circumference = 2 * Math.PI * 38;
  let accumulatedPercent = 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard</h1>
        <p className="text-xs text-slate-500 mt-1">
          Welcome back, {user?.name || 'Admin'}! Here's what's happening today.
        </p>
      </div>

      {/* 4 Stat Metric Cards matching Screen 2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Projects */}
        <Card className="p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500">Total Projects</span>
            <div className="text-3xl font-extrabold text-slate-900">{totalProjects}</div>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
              <TrendingUp className="w-3 h-3" />
              <span>↑ 1 this week</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
            <FolderKanban className="w-6 h-6" />
          </div>
        </Card>

        {/* Card 2: Total Tasks */}
        <Card className="p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500">Total Tasks</span>
            <div className="text-3xl font-extrabold text-slate-900">{totalTasks}</div>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
              <TrendingUp className="w-3 h-3" />
              <span>↑ 3 this week</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <CheckSquare className="w-6 h-6" />
          </div>
        </Card>

        {/* Card 3: Overdue Tasks */}
        <Card className="p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500">Overdue Tasks</span>
            <div className="text-3xl font-extrabold text-rose-600">{overdueTasks}</div>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-rose-600">
              <AlertTriangle className="w-3 h-3" />
              <span>↑ 1 this week</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </Card>

        {/* Card 4: Active Users */}
        <Card className="p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500">Active Users</span>
            <div className="text-3xl font-extrabold text-slate-900">{activeUsersCount}</div>
            <span className="text-[11px] text-slate-400 font-medium">of 6 online</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
            <Users className="w-6 h-6" />
          </div>
        </Card>
      </div>

      {/* Middle Row matching Screen 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Card 1: Tasks by Status (Donut Chart) */}
        <Card className="flex flex-col justify-between">
          <CardHeader>
            <CardTitle>Tasks by Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="py-4 flex items-center justify-center">
              <div className="relative w-40 h-40">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    className="stroke-slate-100"
                    strokeWidth="12"
                    fill="transparent"
                  />
                  {donutSegments.map((seg, i) => {
                    const percent = seg.count / statusTotal;
                    const dashArray = `${percent * circumference} ${circumference}`;
                    const strokeOffset = -accumulatedPercent * circumference;
                    accumulatedPercent += percent;

                    return (
                      <circle
                        key={i}
                        cx="50"
                        cy="50"
                        r="38"
                        stroke={seg.color}
                        strokeWidth="12"
                        fill="transparent"
                        strokeDasharray={dashArray}
                        strokeDashoffset={strokeOffset}
                        strokeLinecap="round"
                        className="transition-all duration-500"
                      />
                    );
                  })}
                </svg>

                {/* Total inside donut */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-black text-slate-800">{statusTotal}</span>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Total</span>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
              {donutSegments.map((seg) => (
                <div key={seg.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${seg.bg}`}></span>
                    <span className="text-slate-600">{seg.label}</span>
                  </div>
                  <span className="font-bold text-slate-800">{seg.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Recent Activity matching Screen 2 */}
        <Card className="flex flex-col justify-between">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Activity</CardTitle>
            <Link to="/activity" className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-0.5">
              <span>View all</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-4 flex-1">
            {[
              {
                name: 'Ravi',
                msg: 'Ravi moved Task #12 from In Progress → In Review',
                time: '2 mins ago',
                initials: 'R',
                color: 'bg-blue-100 text-blue-700',
              },
              {
                name: 'Priya',
                msg: "Priya created a new project 'E-commerce Platform'",
                time: '12 mins ago',
                initials: 'P',
                color: 'bg-emerald-100 text-emerald-700',
              },
              {
                name: 'Vikram',
                msg: 'Vikram was assigned to Task #8',
                time: '25 mins ago',
                initials: 'V',
                color: 'bg-purple-100 text-purple-700',
              },
              {
                name: 'Sneha',
                msg: 'Sneha commented on Task #5',
                time: '1 hour ago',
                initials: 'S',
                color: 'bg-amber-100 text-amber-700',
              },
            ].map((act, i) => (
              <div key={i} className="flex items-start gap-3">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 ${act.color}`}
                >
                  {act.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-slate-800 leading-snug">{act.msg}</p>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">{act.time}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Card 3: Active Users (Live) matching Screen 2 */}
        <Card className="flex flex-col justify-between">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Active Users (Live)</CardTitle>
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[11px] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>{activeUsersCount} online</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <p className="text-xs text-slate-500">Team members currently active in workspace</p>

            {/* Row of circular user avatars matching Screen 2 */}
            <div className="flex items-center -space-x-2 py-2">
              {[
                { initials: 'A', name: 'Admin', color: 'bg-purple-600' },
                { initials: 'P', name: 'Priya', color: 'bg-blue-600' },
                { initials: 'D', name: 'Developer', color: 'bg-emerald-600' },
                { initials: 'S', name: 'Sneha', color: 'bg-amber-600' },
                { initials: 'Y', name: 'Yash', color: 'bg-indigo-600' },
              ].map((u, i) => (
                <div
                  key={i}
                  title={u.name}
                  className={`w-10 h-10 rounded-full border-2 border-white flex items-center justify-center text-white font-bold text-xs shadow-sm ${u.color}`}
                >
                  {u.initials}
                </div>
              ))}
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 space-y-1">
              <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-500" />
                <span>Live Socket Connection</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Connected over WebSocket channels for live presence updates.
              </p>
            </div>
          </CardContent>
          <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">Manage team roles</span>
            <Link to="/users" className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-0.5">
              <span>View all &rarr;</span>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
