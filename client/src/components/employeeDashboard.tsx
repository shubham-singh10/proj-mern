import { useState, useEffect } from 'react';
import API from '../services/api';

interface Task {
    _id: string;
    title: string;
    description: string;
    project: {
        _id: string;
        title: string;
    };
    status: string;
    deadline?: string;
    assignedTo: {
        id: string;
        name: string;
    };
}

export default function EmployeeDashboard() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [deadline, setDeadline] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMyTasks();
    }, []);

    const fetchMyTasks = async () => {
        try {
            setLoading(true);
            const res = await API.get('/tasks/gettaskEmployee');
            // Filter tasks assigned to current employee
            //console.log("Fetched Employee Tasks: ", res.data.tasks);
            setTasks(res.data.tasks || []);
        } catch (err) {
           import.meta.env.VITE_API_BASE_STATUS === "development" && console.error('Error fetching tasks:', err);
            alert('Error loading tasks');
        } finally {
            setLoading(false);
        }
    };

    const openUpdateModal = (task: Task) => {
        setSelectedTask(task);
        setDeadline(task.deadline ? task.deadline.split('T')[0] : '');
        setShowUpdateModal(true);
    };

    const updateTask = async () => {
        if (!selectedTask) return;

        if (!deadline) {
            alert('Please select a deadline');
            return;
        }
        try {
            await API.put(`/tasks/${selectedTask._id}`, {
                deadline
            });

            alert('Task updated successfully');
            setShowUpdateModal(false);
            fetchMyTasks();
        } catch (err: any) {
            alert('Error updating task: ' + (err.response?.data?.message || err.message));
        }
    };

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'in progress':
                return 'bg-blue-100 text-blue-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getDeadlineStatus = (deadline?: string) => {
        if (!deadline) return null;

        const now = new Date();
        const deadlineDate = new Date(deadline);
        const diffTime = deadlineDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
            return { text: 'Overdue', color: 'text-red-600' };
        } else if (diffDays === 0) {
            return { text: 'Due Today', color: 'text-orange-600' };
        } else if (diffDays <= 3) {
            return { text: `${diffDays} days left`, color: 'text-orange-500' };
        } else {
            return { text: `${diffDays} days left`, color: 'text-gray-600' };
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading your tasks...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">My Tasks</h1>
                    <p className="text-gray-600 mt-2">View and manage your assigned tasks</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="text-sm font-medium text-gray-500">Total Tasks</div>
                        <div className="text-3xl font-bold text-gray-900 mt-2">{tasks.length}</div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="text-sm font-medium text-gray-500">Pending</div>
                        <div className="text-3xl font-bold text-yellow-600 mt-2">
                            {tasks.filter(t => t.status?.toLowerCase() === 'pending').length}
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="text-sm font-medium text-gray-500">In Progress</div>
                        <div className="text-3xl font-bold text-blue-600 mt-2">
                            {tasks.filter(t => t.status?.toLowerCase() === 'in progress').length}
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="text-sm font-medium text-gray-500">Completed</div>
                        <div className="text-3xl font-bold text-green-600 mt-2">
                            {tasks.filter(t => t.status?.toLowerCase() === 'completed').length}
                        </div>
                    </div>
                </div>

                {/* Tasks Table */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-900">Assigned Tasks</h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Project
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Task Title
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Description
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Deadline
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {tasks.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center">
                                            <div className="text-gray-400">
                                                <svg className="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                </svg>
                                                <p className="text-lg font-medium">No tasks assigned yet</p>
                                                <p className="text-sm mt-1">Tasks assigned to you will appear here</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    tasks.map(task => {
                                        const deadlineStatus = getDeadlineStatus(task.deadline);
                                        return (
                                            <tr key={task._id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {task.project.title}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-semibold text-gray-900">{task.title}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-600 max-w-xs truncate">
                                                        {task.description}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(task.status)}`}>
                                                        {task.status || 'Pending'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {task.deadline ? (
                                                        <div>
                                                            <div className="text-sm text-gray-900">
                                                                {new Date(task.deadline).toLocaleDateString()}
                                                            </div>
                                                            {deadlineStatus && (
                                                                <div className={`text-xs font-medium ${deadlineStatus.color}`}>
                                                                    {deadlineStatus.text}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-sm text-gray-400">Not set</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <button
                                                        onClick={() => openUpdateModal(task)}
                                                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                                    >
                                                        Update
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Update Task Modal */}
            {showUpdateModal && selectedTask && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
                        <div className="p-6">
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">
                                Update Task
                            </h3>

                            <div className="space-y-4 mb-6">
                                {/* Task Info */}
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="font-semibold text-gray-900 mb-1">{selectedTask.title}</h4>
                                    <p className="text-sm text-gray-600">{selectedTask.description}</p>
                                </div>

                                {/* Deadline */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Deadline
                                    </label>
                                    <input
                                        type="date"
                                        value={deadline}
                                        onChange={e => setDeadline(e.target.value)}
                                        min={new Date().toISOString().split('T')[0]}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={updateTask}
                                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                >
                                    Update Task
                                </button>
                                <button
                                    onClick={() => setShowUpdateModal(false)}
                                    className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}