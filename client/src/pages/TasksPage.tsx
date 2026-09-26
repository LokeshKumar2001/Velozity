import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../redux/store.ts';
import { fetchTasks } from '../redux/tasksSlice.ts';
import { fetchProjects } from '../redux/projectsSlice.ts';
import { usersApi } from '../api/client.ts';
import { KanbanBoard } from '../components/KanbanBoard.tsx';
import type { User } from '../types/index.ts';
import { Search } from 'lucide-react';

export const TasksPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const querySearch = searchParams.get('search') || '';

  const { items: tasks, isLoading } = useAppSelector((state) => state.tasks);
  const { items: projects } = useAppSelector((state) => state.projects);

  const [search, setSearch] = useState(querySearch);
  const [selectedProject, setSelectedProject] = useState<string>('ALL');
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');
  const [selectedAssignee, setSelectedAssignee] = useState<string>('ALL');
  const [assignees, setAssignees] = useState<User[]>([]);

  useEffect(() => {
    dispatch(fetchProjects());
    usersApi.getAll().then(setAssignees).catch(() => {});
  }, [dispatch]);

  useEffect(() => {
    dispatch(
      fetchTasks({
        search: search.trim() || undefined,
        projectId: selectedProject !== 'ALL' ? selectedProject : undefined,
        priority: selectedPriority !== 'ALL' ? selectedPriority : undefined,
        assignedTo: selectedAssignee !== 'ALL' ? selectedAssignee : undefined,
      })
    );
  }, [dispatch, search, selectedProject, selectedPriority, selectedAssignee]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Tasks - Kanban View</h1>
        <p className="text-xs text-slate-500 mt-1">
          Real-time Kanban workflow board with live synchronization and team assignment
        </p>
      </div>

      {/* Filter Toolbar matching Screen 4 */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          {/* Projects filter */}
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:bg-white focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          {/* Priority filter */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:bg-white focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Priority</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          {/* Assignees filter */}
          <select
            value={selectedAssignee}
            onChange={(e) => setSelectedAssignee(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:bg-white focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Assignees</option>
            {assignees.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Kanban Board */}
      {isLoading && tasks.length === 0 ? (
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="w-8 h-8 border-4 border-blue-500/20 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      ) : (
        <KanbanBoard tasks={tasks} showProject={true} />
      )}
    </div>
  );
};
