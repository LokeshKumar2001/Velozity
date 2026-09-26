import React, { useState } from 'react';
import type { Task, TaskStatus } from '../types/index.ts';
import { TaskCard } from './TaskCard.tsx';
import { TaskDetailsModal } from './TaskDetailsModal.tsx';
import { Plus } from 'lucide-react';

interface KanbanBoardProps {
  tasks: Task[];
  showProject?: boolean;
}

const COLUMNS: Array<{ 
  status: TaskStatus; 
  label: string; 
  badgeStyle: string; 
  accentColor: string;
}> = [
  { 
    status: 'TODO', 
    label: 'To Do', 
    badgeStyle: 'bg-slate-200 text-slate-700',
    accentColor: 'border-t-slate-400'
  },
  { 
    status: 'IN_PROGRESS', 
    label: 'In Progress', 
    badgeStyle: 'bg-blue-100 text-blue-700',
    accentColor: 'border-t-blue-500'
  },
  { 
    status: 'IN_REVIEW', 
    label: 'In Review', 
    badgeStyle: 'bg-amber-100 text-amber-700',
    accentColor: 'border-t-amber-500'
  },
  { 
    status: 'DONE', 
    label: 'Done', 
    badgeStyle: 'bg-emerald-100 text-emerald-700',
    accentColor: 'border-t-emerald-500'
  },
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ tasks, showProject = true }) => {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {COLUMNS.map(({ status, label, badgeStyle, accentColor }) => {
          const columnTasks = tasks.filter((t) => t.status === status);

          return (
            <div
              key={status}
              className={`flex flex-col rounded-3xl bg-slate-100/80 border border-slate-200/80 border-t-4 ${accentColor} p-3.5 min-h-[540px] shadow-2xs`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between px-2 py-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold text-slate-800 tracking-tight">
                    {label}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold ${badgeStyle}`}>
                    {columnTasks.length}
                  </span>
                </div>

                <button
                  title="Add Task"
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Task list inside column */}
              <div className="space-y-3.5 overflow-y-auto flex-1 pr-1">
                {columnTasks.length === 0 ? (
                  <div className="h-36 rounded-2xl border-2 border-dashed border-slate-200/80 flex flex-col items-center justify-center text-slate-400 text-xs p-4 text-center space-y-1">
                    <span className="font-semibold text-slate-500">No tasks in {label}</span>
                    <span className="text-[10px]">Drag or update task status to see them here</span>
                  </div>
                ) : (
                  columnTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      showProject={showProject}
                      onClick={() => setSelectedTask(task)}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Task Details Modal */}
      {selectedTask && (
        <TaskDetailsModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </>
  );
};
