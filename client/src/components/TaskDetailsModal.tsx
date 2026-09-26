import React, { useState } from 'react';
import type { Task, TaskStatus, TaskPriority } from '../types/index.ts';
import { useAppDispatch } from '../redux/store.ts';
import { updateTaskStatus } from '../redux/tasksSlice.ts';
import { 
  X, 
  ArrowLeft, 
  FolderKanban, 
  User as UserIcon, 
  Calendar, 
  FileText, 
  Download, 
  CheckCircle2
} from 'lucide-react';
import { Button } from './ui/button.tsx';
import { Badge } from './ui/badge.tsx';
import { Card } from './ui/card.tsx';

interface TaskDetailsModalProps {
  task: Task | null;
  onClose: () => void;
}

export const TaskDetailsModal: React.FC<TaskDetailsModalProps> = ({ task, onClose }) => {
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState<'description' | 'activity' | 'comments'>('description');
  const [currentStatus, setCurrentStatus] = useState<TaskStatus>(task?.status || 'IN_PROGRESS');
  const [currentPriority, setCurrentPriority] = useState<TaskPriority>(task?.priority || 'HIGH');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updatedSuccess, setUpdatedSuccess] = useState(false);

  if (!task) return null;

  const handleUpdateStatus = async () => {
    setIsUpdating(true);
    try {
      await dispatch(updateTaskStatus({ id: task.id, status: currentStatus })).unwrap();
      setUpdatedSuccess(true);
      setTimeout(() => setUpdatedSuccess(false), 2000);
    } catch (err) {
      console.error('Failed to update status', err);
    } finally {
      setIsUpdating(false);
    }
  };

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Header matching Screen 5 */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h2 className="text-sm font-bold text-slate-800">Task Details</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body matching Screen 5 */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
          {/* Main Content (2 Cols) */}
          <div className="lg:col-span-2 p-6 space-y-6 flex flex-col justify-between">
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-bold text-slate-900">{task.title || 'API integration'}</h1>
                  <Badge variant={getPriorityVariant(currentPriority)}>
                    {currentPriority.charAt(0) + currentPriority.slice(1).toLowerCase()}
                  </Badge>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-blue-600 font-medium mt-1.5">
                  <FolderKanban className="w-3.5 h-3.5" />
                  <span>{task.project?.name || 'E-commerce Platform'}</span>
                </div>
              </div>

              {/* Quick Metadata Row matching Screen 5 */}
              <div className="grid grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-50/80 border border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 block mb-1 flex items-center gap-1">
                    <UserIcon className="w-3 h-3 text-slate-400" /> Assigned to
                  </span>
                  <span className="font-semibold text-slate-800">
                    {task.developer?.name || 'Ravi Teja (Developer)'}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block mb-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" /> Due Date
                  </span>
                  <span className="font-semibold text-slate-800">
                    {new Date(task.dueDate || '2025-09-30').toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block mb-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-blue-500" /> Status
                  </span>
                  <span className="font-semibold text-blue-600">
                    {currentStatus.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Content Tabs matching Screen 5 */}
              <div>
                <div className="flex items-center gap-6 border-b border-slate-200">
                  <button
                    onClick={() => setActiveTab('description')}
                    className={`pb-2.5 text-xs font-semibold transition-colors border-b-2 ${
                      activeTab === 'description'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Description
                  </button>
                  <button
                    onClick={() => setActiveTab('activity')}
                    className={`pb-2.5 text-xs font-semibold transition-colors border-b-2 ${
                      activeTab === 'activity'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Activity Log
                  </button>
                  <button
                    onClick={() => setActiveTab('comments')}
                    className={`pb-2.5 text-xs font-semibold transition-colors border-b-2 ${
                      activeTab === 'comments'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Comments
                  </button>
                </div>

                <div className="pt-4">
                  {activeTab === 'description' && (
                    <div className="space-y-4">
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {task.description ||
                          'Integrate payment gateway with the existing system. Handle success and failure cases. Update the order status accordingly.'}
                      </p>

                      {/* Attachments Section matching Screen 5 */}
                      <div className="pt-2">
                        <span className="text-xs font-semibold text-slate-700 block mb-2">Attachments</span>
                        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/80 max-w-sm">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="text-xs font-semibold text-slate-800">design.pdf</div>
                              <div className="text-[10px] text-slate-400">2.4 MB</div>
                            </div>
                          </div>
                          <button className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-200/50 transition-colors">
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'activity' && (
                    <div className="space-y-2 text-xs text-slate-600">
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                        <span>Task created and assigned to {task.developer?.name || 'Ravi Teja'}</span>
                        <span className="text-[10px] text-slate-400">2 hours ago</span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                        <span>Status updated to In Progress</span>
                        <span className="text-[10px] text-slate-400">1 hour ago</span>
                      </div>
                    </div>
                  )}

                  {activeTab === 'comments' && (
                    <div className="space-y-3">
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-slate-800">Priya Sharma</span>
                          <span className="text-[10px] text-slate-400">1 hour ago</span>
                        </div>
                        <p className="text-slate-600">Please make sure webhook signature validation is included.</p>
                      </div>

                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Add a comment..."
                          className="flex-1 text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                        />
                        <Button className="px-3 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 h-auto">
                          Post
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Update Action matching Screen 5 */}
            <div className="pt-6">
              <Button
                onClick={handleUpdateStatus}
                disabled={isUpdating}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-500/20 py-2.5 px-6 h-auto"
              >
                {isUpdating ? 'Updating...' : updatedSuccess ? 'Updated ✓' : 'Update Status'}
              </Button>
            </div>
          </div>

          {/* Task Properties Sidebar Card matching Screen 5 */}
          <Card className="p-6 bg-slate-50/50 border-0 rounded-none space-y-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Task Properties</h3>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-500 font-medium mb-1.5">Priority</label>
                <select
                  value={currentPriority}
                  onChange={(e) => setCurrentPriority(e.target.value as TaskPriority)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-500 font-medium"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-500 font-medium mb-1.5">Status</label>
                <select
                  value={currentStatus}
                  onChange={(e) => setCurrentStatus(e.target.value as TaskStatus)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-500 font-medium"
                >
                  <option value="TODO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="IN_REVIEW">In Review</option>
                  <option value="DONE">Done</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-500 font-medium mb-1.5">Assignee</label>
                <div className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 font-medium">
                  {task.developer?.name || 'Ravi Teja'}
                </div>
              </div>

              <div>
                <label className="block text-slate-500 font-medium mb-1.5">Due Date</label>
                <div className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 font-medium">
                  {new Date(task.dueDate || '2025-09-30').toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </div>
              </div>

              <div>
                <label className="block text-slate-500 font-medium mb-1.5">Project</label>
                <div className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 font-medium">
                  {task.project?.name || 'E-commerce Platform'}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
