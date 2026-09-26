import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/store.ts';
import { markNotificationRead, markAllNotificationsRead } from '../redux/notificationsSlice.ts';
import { Bell, CheckCheck, CheckCircle2, Clock, AlertTriangle, Info, UserCheck, MessageSquare } from 'lucide-react';
import { Card } from '../components/ui/card.tsx';
import { Button } from '../components/ui/button.tsx';

export const NotificationsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items: notifications, unreadCount } = useAppSelector((state) => state.auth.user ? state.notifications : { items: [], unreadCount: 3 });
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const MOCK_NOTIFICATIONS = [
    {
      id: '1',
      type: 'ASSIGNED',
      title: 'Task assigned to you',
      message: 'You have been assigned to Task #6 in \'Mobile App Redesign\'',
      time: '2 mins ago',
      isRead: false,
      color: 'bg-rose-50 text-rose-600',
      icon: UserCheck,
    },
    {
      id: '2',
      type: 'STATUS_CHANGE',
      title: 'Task moved to In Review',
      message: 'Task #12 was moved to In Review by Ravi Teja',
      time: '10 mins ago',
      isRead: false,
      color: 'bg-amber-50 text-amber-600',
      icon: Clock,
    },
    {
      id: '3',
      type: 'MENTION',
      title: 'You were mentioned',
      message: 'Priya mentioned you in a comment on Task #5',
      time: '1 hour ago',
      isRead: false,
      color: 'bg-blue-50 text-blue-600',
      icon: MessageSquare,
    },
    {
      id: '4',
      type: 'PROJECT_UPDATE',
      title: 'Project update',
      message: 'Project \'E-commerce Platform\' has been updated',
      time: '2 hours ago',
      isRead: true,
      color: 'bg-emerald-50 text-emerald-600',
      icon: CheckCircle2,
    },
    {
      id: '5',
      type: 'DUE_SOON',
      title: 'Task due soon',
      message: 'Task #7 is due in 2 days (Sep 27, 2025)',
      time: '5 hours ago',
      isRead: true,
      color: 'bg-amber-50 text-amber-600',
      icon: AlertTriangle,
    },
  ];

  const listToRender = notifications.length > 0 ? notifications : MOCK_NOTIFICATIONS;

  const filteredNotifications = filter === 'unread'
    ? listToRender.filter((n) => !n.isRead)
    : listToRender;

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200">
      {/* Header matching Screen 7 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Notifications ({unreadCount} unread)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Task handoffs, priority alerts, and system triggers
          </p>
        </div>

        <Button
          onClick={() => dispatch(markAllNotificationsRead())}
          className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-xl py-2 px-3 h-auto gap-1.5 shadow-xs"
        >
          <CheckCheck className="w-3.5 h-3.5 text-blue-600" />
          <span>Mark all as read</span>
        </Button>
      </div>

      {/* Filter Tabs matching Screen 7 */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setFilter('all')}
          className={`pb-3 text-xs font-semibold border-b-2 transition-colors ${
            filter === 'all'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          All ({listToRender.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`pb-3 text-xs font-semibold border-b-2 transition-colors ${
            filter === 'unread'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* Notifications List matching Screen 7 */}
      <Card className="divide-y divide-slate-100 overflow-hidden">
        {filteredNotifications.length === 0 ? (
          <div className="p-12 text-center">
            <Bell className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-slate-700">No notifications to show</h3>
            <p className="text-xs text-slate-400 mt-1">You're all caught up with your team updates.</p>
          </div>
        ) : (
          filteredNotifications.map((notif: any, i: number) => {
            const isReal = Boolean(notif.createdAt);
            const message = notif.message;
            const title = isReal ? 'Notification' : notif.title;
            const timeStr = isReal
              ? new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : notif.time;
            const isRead = notif.isRead;
            const IconComp = notif.icon || Info;

            return (
              <div
                key={notif.id || i}
                onClick={() => isReal && !isRead && dispatch(markNotificationRead(notif.id))}
                className={`p-4 flex items-center justify-between gap-4 transition-colors cursor-pointer ${
                  isRead ? 'bg-white hover:bg-slate-50/60' : 'bg-blue-50/40 hover:bg-blue-50/70'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className={`mt-0.5 p-2 rounded-xl flex-shrink-0 ${notif.color || 'bg-blue-50 text-blue-600'}`}>
                    <IconComp className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{title}</h4>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                      {message}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-[11px] text-slate-400 font-medium">{timeStr}</span>
                  {!isRead && (
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 flex-shrink-0"></span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </Card>
    </div>
  );
};
