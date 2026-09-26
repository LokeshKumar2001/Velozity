import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../redux/store.ts';
import { fetchProjectById } from '../redux/projectsSlice.ts';
import { fetchTasks } from '../redux/tasksSlice.ts';
import { useSocket } from '../hooks/useSocket.ts';
import { KanbanBoard } from '../components/KanbanBoard.tsx';
import { CreateTaskModal } from '../components/CreateTaskModal.tsx';
import { ArrowLeft, Plus, User as UserIcon, Building } from 'lucide-react';

export const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { currentProject, isLoading: projectLoading } = useAppSelector((state) => state.projects);
  const { items: tasks } = useAppSelector((state) => state.tasks);
  const { user } = useAppSelector((state) => state.auth);
  const { joinProject, leaveProject } = useSocket();

  const [showCreateTask, setShowCreateTask] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchProjectById(id));
      dispatch(fetchTasks({ projectId: id }));
      joinProject(id);

      return () => {
        leaveProject(id);
      };
    }
  }, [id, dispatch]);

  const canCreateTask = user?.role === 'ADMIN' || (user?.role === 'PROJECT_MANAGER' && currentProject?.managerId === user?.id);

  const projectTasks = tasks.filter((t) => t.projectId === id);

  if (projectLoading && !currentProject) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!currentProject) {
    return (
      <div className="text-center py-16">
        <h3 className="text-base font-semibold text-white">Project not found</h3>
        <Link to="/projects" className="text-xs text-cyan-400 hover:underline mt-2 inline-block">
          &larr; Back to projects
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Back button & Breadcrumb */}
      <div>
        <Link
          to="/projects"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors mb-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Projects</span>
        </Link>
      </div>

      {/* Project Header Card */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
              <Building className="w-3 h-3" />
              {currentProject.client?.name || 'Client Project'}
            </span>
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <UserIcon className="w-3 h-3 text-slate-400" />
              Manager: <strong className="text-slate-800 font-semibold">{currentProject.manager?.name}</strong>
            </span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{currentProject.name}</h1>
          {currentProject.description && (
            <p className="text-xs text-slate-500 mt-2 max-w-3xl leading-relaxed">
              {currentProject.description}
            </p>
          )}
        </div>

        {canCreateTask && (
          <button
            onClick={() => setShowCreateTask(true)}
            className="px-4 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all flex items-center gap-1.5 shadow-sm shadow-blue-500/20 whitespace-nowrap self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </button>
        )}
      </div>

      {/* Kanban Board */}
      <div className="pt-2">
        <KanbanBoard tasks={projectTasks} showProject={false} />
      </div>

      {/* Create Task Modal */}
      {id && (
        <CreateTaskModal
          projectId={id}
          isOpen={showCreateTask}
          onClose={() => setShowCreateTask(false)}
        />
      )}
    </div>
  );
};
