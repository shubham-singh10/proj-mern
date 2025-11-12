import { useEffect, useState } from 'react';
import API from '../services/api';
import { createSocket } from '../services/socket';

interface Notification {
    _id: string;
    message: string;
    type: string;
    isRead: boolean;
    createdAt: string;
    data?: any;
}

export default function AllNotification() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);

    // Fetch notifications from database on mount
    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const res = await API.get('/notifications');
            setNotifications(res.data.notifications || []);
            setUnreadCount(res.data.notifications.filter((n: Notification) => !n.isRead).length);
        } catch (err) {
            console.error('Error fetching notifications:', err);
        } finally {
            setLoading(false);
        }
    };

    // Socket for real-time notifications
    useEffect(() => {
        const socket = createSocket();
        socket.emit("joinProject", { projectId: "69142ab5e344e4fa783638d8" });

        socket.on("taskUpdated", (data) => {
            const date = new Date(data.task.deadline);
            const formatted = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            const newNotification: Notification = {
                _id: Date.now().toString(),
                message: `Task "${data.task.title}" status updated and deadline changed to ${formatted}`,
                type: 'taskUpdated',
                isRead: false,
                createdAt: new Date().toISOString(),
                data
            };

            setNotifications(prev => [newNotification, ...prev]);
            setUnreadCount(prev => prev + 1);

            // Show browser notification if permission granted
            if (Notification.permission === 'granted') {
                new Notification('Task Updated', {
                    body: newNotification.message,
                    icon: '/notification-icon.png'
                });
            }
        });

        return () => {
            socket.emit('leaveProject', { projectId: "69142ab5e344e4fa783638d8" });
            socket.disconnect();
        };
    }, []);

    // Request notification permission
    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);

    const markAsRead = async (notificationId: string) => {
        try {
            await API.put(`/notifications/${notificationId}/read`, {});
            setNotifications(prev =>
                prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error('Error marking notification as read:', err);
        }
    };

    const markAllAsRead = async () => {
        try {
            await API.put('/notifications/mark-all-read', {});
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error('Error marking all as read:', err);
        }
    };

    const deleteNotification = async (notificationId: string) => {
        try {
            await API.delete(`/notifications/${notificationId}`);
            setNotifications(prev => prev.filter(n => n._id !== notificationId));
            const notif = notifications.find(n => n._id === notificationId);
            if (notif && !notif.isRead) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (err) {
            console.error('Error deleting notification:', err);
        }
    };

    const formatTime = (date: string) => {
        const now = new Date();
        const notifDate = new Date(date);
        const diffMs = now.getTime() - notifDate.getTime();
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
        return `${Math.floor(diffMins / 1440)}d ago`;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading notifications...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                            Notifications
                            {unreadCount > 0 && (
                                <span className="bg-red-600 text-white text-sm font-semibold px-3 py-1 rounded-full">
                                    {unreadCount}
                                </span>
                            )}
                        </h1>
                        {unreadCount > 0 && (
                            <p className="text-sm text-gray-600 mt-1">
                                You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                            </p>
                        )}
                    </div>
                    {unreadCount > 0 && (
                        <button
                            onClick={markAllAsRead}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                        >
                            Mark all as read
                        </button>
                    )}
                </div>

                {/* Notifications List */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    {notifications.length === 0 ? (
                        <div className="p-12 text-center">
                            <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            <p className="text-lg font-medium text-gray-900 mb-1">No notifications yet</p>
                            <p className="text-sm text-gray-500">You'll see notifications here when tasks are updated</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {notifications.map(notif => (
                                <div
                                    key={notif._id}
                                    className={`p-4 transition-all duration-200 ${!notif.isRead
                                        ? 'bg-blue-50 hover:bg-blue-100 border-l-4 border-blue-600'
                                        : 'bg-white hover:bg-gray-50'
                                        }`}
                                >
                                    <div className="flex items-start gap-4">
                                        {/* Icon */}
                                        <div className={`mt-1 shrink-0 ${!notif.isRead ? 'text-blue-600' : 'text-gray-400'}`}>
                                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                            </svg>
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <p className={`text-sm ${!notif.isRead ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                                                    {notif.message}
                                                </p>
                                                {!notif.isRead && (
                                                    <span className="shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-1.5"></span>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-4 mt-2">
                                                <span className="text-xs text-gray-500">
                                                    {formatTime(notif.createdAt)}
                                                </span>

                                                {notif.data?.updatedBy && (
                                                    <span className="text-xs text-gray-500">
                                                        by {notif.data.updatedBy}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2 shrink-0">
                                            {!notif.isRead && (
                                                <button
                                                    onClick={() => markAsRead(notif._id)}
                                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium px-3 py-1 rounded hover:bg-blue-100 transition-colors"
                                                    title="Mark as read"
                                                >
                                                    Mark read
                                                </button>
                                            )}

                                            <button
                                                onClick={() => deleteNotification(notif._id)}
                                                className="text-gray-400 hover:text-red-600 p-1 rounded hover:bg-gray-100 transition-colors"
                                                title="Delete notification"
                                            >
                                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer Info */}
                {notifications.length > 0 && (
                    <div className="mt-4 text-center text-sm text-gray-500">
                        Showing {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
                    </div>
                )}
            </div>
        </div>
    );
}