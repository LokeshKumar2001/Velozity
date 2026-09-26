import React, { useState } from 'react';
import type { Task, TaskStatus } from '../types/index.ts';
import { TaskCard } from './TaskCard.tsx';
import { TaskDetailsModal } from './TaskDetailsModal.tsx';
import { Plus, MoveRight } from 'lucide-react';
import { useAppDispatch } from '../redux/store.ts';
import { updateTaskStatus } from '../redux/tasksSlice.ts';

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
  const dispatch = useAppDispatch();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedTaskId(taskId);
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumn !== status) {
      setDragOverColumn(status);
    }
  };

  const handleDragLeave = (e: React.DragEvent, status: TaskStatus) => {
    if (e.currentTarget.contains(e.relatedTarget as Node)) {
      return;
    }
    if (dragOverColumn === status) {
      setDragOverColumn(null);
    }
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    setDragOverColumn(null);
    setDraggedTaskId(null);

    if (!taskId) return;
    const task = tasks.find((t) => t.id === taskId);
    if (task && task.status !== targetStatus) {
      try {
        await dispatch(updateTaskStatus({ id: task.id, status: targetStatus })).unwrap();
      } catch (error) {
        console.error('Failed to move task:', error);
      }
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {COLUMNS.map(({ status, label, badgeStyle, accentColor }) => {
          const columnTasks = tasks.filter((t) => t.status === status);
          const isOver = dragOverColumn === status;

          return (
            <div
              key={status}
              onDragOver={(e) => handleDragOver(e, status)}
              onDragLeave={(e) => handleDragLeave(e, status)}
              onDrop={(e) => handleDrop(e, status)}
              className={`flex flex-col rounded-3xl p-3.5 min-h-[540px] shadow-2xs transition-all duration-200 border border-t-4 ${accentColor} ${
                isOver
                  ? 'bg-blue-50/80 border-blue-400 ring-2 ring-blue-500/30 scale-[1.01]'
                  : 'bg-slate-100/80 border-slate-200/80'
              }`}
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

              {/* Drag over drop indicator */}
              {isOver && (
                <div className="mb-3 p-2.5 rounded-xl border border-dashed border-blue-400 bg-blue-100/60 text-blue-700 text-xs font-semibold flex items-center justify-center gap-1.5 animate-pulse">
                  <MoveRight className="w-3.5 h-3.5" /> Move to {label}
                </div>
              )}

              {/* Task list inside column */}
              <div className="space-y-3.5 overflow-y-auto flex-1 pr-1">
                {columnTasks.length === 0 ? (
                  <div
                    className={`h-36 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center text-xs p-4 text-center space-y-1 transition-colors ${
                      isOver
                        ? 'border-blue-400 bg-blue-50/50 text-blue-600 font-medium'
                        : 'border-slate-200/80 text-slate-400'
                    }`}
                  >
                    <span className="font-semibold text-slate-500">No tasks in {label}</span>
                    <span className="text-[10px]">Drag tasks here to update status</span>
                  </div>
                ) : (
                  columnTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      showProject={showProject}
                      draggable={true}
                      isDragging={draggedTaskId === task.id}
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      onDragEnd={handleDragEnd}
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
