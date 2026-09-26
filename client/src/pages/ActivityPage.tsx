import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/store.ts';
import { fetchActivityFeed } from '../redux/activitySlice.ts';
import { fetchProjects } from '../redux/projectsSlice.ts';
import { Card } from '../components/ui/card.tsx';
import { Avatar } from '../components/ui/avatar.tsx';
import { Badge } from '../components/ui/badge.tsx';

export const ActivityPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items: activities, isLoading } = useAppSelector((state) => state.activity);
  const { items: projects } = useAppSelector((state) => state.projects);

  const [activeTab, setActiveTab] = useState<'project' | 'global'>('project');
  const [selectedProject, setSelectedProject] = useState<string>('ALL');

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  useEffect(() => {
    dispatch(
      fetchActivityFeed({
        projectId: selectedProject !== 'ALL' ? selectedProject : undefined,
        limit: 50,
      })
    );
  }, [dispatch, selectedProject]);

  const MOCK_ACTIVITIES = [
    { id: '1', userName: 'Ravi Teja', message: 'moved Task #12 from In Progress → In Review', time: '2 mins ago', project: 'E-commerce Platform', initials: 'RT', color: 'bg-purple-600' },
    { id: '2', userName: 'Priya Sharma', message: "created a new project 'E-commerce Platform'", time: '12 mins ago', project: 'E-commerce Platform', initials: 'PS', color: 'bg-teal-600' },
    { id: '3', userName: 'Rahul Kumar', message: 'was assigned to Task #8', time: '25 mins ago', project: 'Mobile App Redesign', initials: 'RK', color: 'bg-emerald-600' },
    { id: '4', userName: 'Sneha Reddy', message: 'commented on Task #5', time: '1 hour ago', project: 'E-commerce Platform', initials: 'SR', color: 'bg-blue-600' },
    { id: '5', userName: 'Aarav Mehta', message: 'updated Task #3 status to Done', time: '2 hours ago', project: 'Website Maintenance', initials: 'AM', color: 'bg-indigo-600' },
    { id: '6', userName: 'Aarav Mehta', message: "created a new client 'NextGen Ltd'", time: '3 hours ago', project: 'Global', initials: 'AM', color: 'bg-[#0b132b]' },
  ];

  const getInitials = (name?: string) => {
    if (!name) return 'AM';
    const parts = name.split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const getAvatarColor = (index: number) => {
    const colors = [
      'bg-purple-600 text-white',
      'bg-teal-600 text-white',
      'bg-emerald-600 text-white',
      'bg-blue-600 text-white',
      'bg-indigo-600 text-white',
      'bg-[#0b132b] text-white',
    ];
    return colors[index % colors.length];
  };

  const rawList = activities.length > 0 ? activities : MOCK_ACTIVITIES;

  const filteredActivities = rawList.filter((act: any) => {
    const isReal = Boolean(act.createdAt);
    const projId = isReal ? act.projectId : act.project;

    if (activeTab === 'global' && projId && projId !== 'Global') {
      // In global feed tab, show global system events or all events
    }

    if (selectedProject !== 'ALL') {
      if (isReal && act.projectId !== selectedProject && act.project?.id !== selectedProject) return false;
      if (!isReal && act.project !== selectedProject && act.project !== 'Global') return false;
    }

    return true;
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200">
      {/* Header matching Screen 6 */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Live Activity Feed</h1>
        <p className="text-xs text-slate-500 mt-1">
          Chronological audit trail and live events broadcasted across all active team rooms
        </p>
      </div>

      {/* Tabs, Filter & Live Badge */}
      <Card className="p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Feed Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start">
          <button
            onClick={() => setActiveTab('project')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'project'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Project Feed
          </button>
          <button
            onClick={() => setActiveTab('global')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'global'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Global Feed
          </button>
        </div>

        {/* Project Selector & Live Indicator */}
        <div className="flex items-center gap-3">
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-700 focus:bg-white focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="ALL">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <Badge variant="success" className="gap-1.5 px-3 py-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Live</span>
          </Badge>
        </div>
      </Card>

      {/* Feed List */}
      <div className="space-y-3">
        {isLoading && activities.length === 0 ? (
          <div className="flex items-center justify-center min-h-[30vh]">
            <div className="w-8 h-8 border-4 border-blue-500/20 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        ) : filteredActivities.length === 0 ? (
          <Card className="p-8 text-center text-slate-400 text-xs font-medium">
            No activity records matching selected project filter.
          </Card>
        ) : (
          filteredActivities.map((act: any, i: number) => {
            const isReal = Boolean(act.createdAt);
            const userName = isReal ? act.user?.name || act.userName || 'Aarav Mehta' : act.userName;
            const message = isReal ? act.metadata?.message || act.formattedMessage || act.action : act.message;
            const timeAgo = isReal
              ? new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : act.time;
            const projectName = isReal ? act.project?.name || 'E-commerce Platform' : act.project;

            return (
              <Card
                key={act.id || i}
                className="p-4 hover:border-slate-300 transition-colors flex items-center gap-3.5"
              >
                <Avatar
                  fallback={getInitials(userName)}
                  colorBg={getAvatarColor(i)}
                  size="md"
                />

                <div className="flex-1 min-w-0">
                  <div className="text-xs text-slate-800">
                    <span className="font-bold text-slate-900">{userName} </span>
                    <span className="text-slate-600">{message}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                    <span>{timeAgo}</span>
                    {projectName && (
                      <>
                        <span>•</span>
                        <span className="text-blue-600 font-medium">{projectName}</span>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};
