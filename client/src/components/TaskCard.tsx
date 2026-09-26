import React from 'react';
import type { Task, TaskPriority } from '../types/index.ts';
import { Calendar, Paperclip, AlertCircle, MoreVertical } from 'lucide-react';
import { Badge } from './ui/badge.tsx';
import { Avatar } from './ui/avatar.tsx';

interface TaskCardProps {
  task: Task;
  showProject?: boolean;
  onClick?: () => void;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  isDragging?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  showProject = true,
  onClick,
  draggable,
  onDragStart,
  onDragEnd,
  isDragging,
}) => {
  const getPriorityVariant = (priority: TaskPriority) => {
    switch (priority) {
      case 'CRITICAL':
        return 'destructive';
      case 'HIGH':
        return 'warning';
      case 'MEDIUM':
        return 'warning';
      case 'LOW':
        return 'success';
      default:
        return 'secondary';
    }
  };

  const formattedDate = new Date(task.dueDate).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });

  const getAvatarFallback = (name?: string) => {
    if (!name) return 'UN';
    const parts = name.split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onClick}
      className={`bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs hover:shadow-md hover:border-blue-400 transition-all cursor-grab active:cursor-grabbing space-y-3 group ${
        isDragging ? 'opacity-40 scale-95 border-dashed border-blue-500 ring-2 ring-blue-500/30' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
            {task.title}
          </h4>
          {showProject && (
            <span className="text-[11px] text-slate-400 font-medium block mt-0.5 truncate">
              {task.project?.name || 'Mobile App Redesign'}
            </span>
          )}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClick?.();
          }}
          className="text-slate-400 hover:text-slate-600 p-0.5 rounded"
        >
          <MoreVertical className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Priority Pill matching Screen 4 */}
      <div className="flex items-center justify-between">
        <Badge variant={getPriorityVariant(task.priority)}>
          {task.priority.charAt(0) + task.priority.slice(1).toLowerCase()}
        </Badge>

        {task.isOverdue && (
          <span className="flex items-center gap-1 text-[10px] text-rose-600 font-semibold bg-rose-50 px-1.5 py-0.5 rounded-full border border-rose-200">
            <AlertCircle className="w-3 h-3" /> Overdue
          </span>
        )}
      </div>

      {/* Footer: Attachments, Due date, Assignee Avatar matching Screen 4 */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-slate-400">
            <Paperclip className="w-3 h-3" />
          </div>
          <div className="flex items-center gap-1 text-slate-500">
            <Calendar className="w-3 h-3 text-slate-400" />
            <span>{formattedDate}</span>
          </div>
        </div>

        <Avatar
          fallback={getAvatarFallback(task.developer?.name)}
          size="sm"
          colorBg="bg-blue-100 text-blue-700"
          title={task.developer?.name || 'Unassigned'}
        />
      </div>
    </div>
  );
};
