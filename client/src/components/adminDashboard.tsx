import { useState, useEffect } from 'react';
import API from '../services/api';
import { Briefcase, Calendar, Search } from 'lucide-react';

interface Project {
    _id: string;
    title: string;
    description: string;
    manager: {
        _id: string;
        name: string;
        email: string;
    };
    employees: Array<{
        _id: string;
        name: string;
        email: string;
    }>;
    tasks: Task[];
    createdAt: string;
}

interface Task {
    _id: string;
    title: string;
    description: string;
    status: string;
    deadline?: string;
    assignedTo: {
        _id: string;
        name: string;
        email: string;
    };
    project: string;
}

export default function AdminDashboard() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [showProjectModal, setShowProjectModal] = useState(false);

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        try {
            setLoading(true);
            const projectsRes = await API.get('/projects');
            setProjects(projectsRes.data.projects || []);
            //   setStats(statsRes.data.stats || stats);
        } catch (err) {
            console.error('Error fetching admin data:', err);
        } finally {
            setLoading(false);
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

    const isDeadlineNear = (deadline?: string) => {
        if (!deadline) return false;
        const deadlineDate = new Date(deadline);
        const today = new Date();
        const diffTime = deadlineDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 3 && diffDays >= 0;
    };

    const isOverdue = (deadline?: string) => {
        if (!deadline) return false;
        return new Date(deadline) < new Date();
    };
    const filteredProjects = projects.filter(project => {
        const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            project.manager.name.toLowerCase().includes(searchTerm.toLowerCase());

        return matchesSearch;
    });

    const openProjectDetails = (project: Project) => {
        setSelectedProject(project);
        setShowProjectModal(true);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
                    <p className="text-gray-600">Overview of all projects, tasks, and team members</p>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search projects or managers..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                </div>

                {/* Projects List */}
                <div className="space-y-6">
                    {filteredProjects.length === 0 ? (
                        <div className="bg-white rounded-lg shadow-md p-12 text-center">
                            <Briefcase className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No projects found</h3>
                            <p className="text-gray-600">No projects match your search criteria.</p>
                        </div>
                    ) : (
                        filteredProjects.map((project) => (
                            <div key={project._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                                {/* Project Header */}
                                <div className="bg-linear-to-r from-indigo-600 to-purple-600 px-6 py-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-xl font-bold text-white">{project.title}</h3>
                                            <p className="text-indigo-100 text-sm mt-1">{project.description}</p>
                                        </div>
                                        <button
                                            onClick={() => openProjectDetails(project)}
                                            className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                                        >
                                            View Details
                                        </button>
                                    </div>
                                </div>

                                {/* Project Info */}
                                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                                    <div className="flex flex-wrap gap-6 text-sm">
                                        <div>
                                            <span className="text-gray-600">Manager:</span>
                                            <span className="ml-2 font-semibold text-gray-900">{project.manager.name}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Employees:</span>
                                            <span className="ml-2 font-semibold text-gray-900">{project.employees.length}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Tasks:</span>
                                            <span className="ml-2 font-semibold text-gray-900">{project.tasks.length}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Created:</span>
                                            <span className="ml-2 font-semibold text-gray-900">
                                                {new Date(project.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Tasks Table */}
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Task
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Assigned To
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Status
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Deadline
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {project.tasks.length === 0 ? (
                                                <tr>
                                                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                                        No tasks in this project yet
                                                    </td>
                                                </tr>
                                            ) : (
                                                project.tasks.map((task) => (
                                                    <tr key={task._id} className="hover:bg-gray-50">
                                                        <td className="px-6 py-4">
                                                            <div>
                                                                <div className="font-medium text-gray-900">{task.title}</div>
                                                                <div className="text-sm text-gray-500">{task.description}</div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm text-gray-900">{task.assignedTo.name}</div>
                                                            <div className="text-sm text-gray-500">{task.assignedTo.email}</div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(task.status)}`}>
                                                                {task.status || 'Pending'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            {task.deadline ? (
                                                                <div className="flex items-center gap-2">
                                                                    <Calendar className="h-4 w-4 text-gray-400" />
                                                                    <span className={`text-sm ${isOverdue(task.deadline)
                                                                        ? 'text-red-600 font-semibold'
                                                                        : isDeadlineNear(task.deadline)
                                                                            ? 'text-orange-600 font-semibold'
                                                                            : 'text-gray-900'
                                                                        }`}>
                                                                        {new Date(task.deadline).toLocaleDateString()}
                                                                    </span>
                                                                    {isOverdue(task.deadline) && (
                                                                        <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                                                                            Overdue
                                                                        </span>
                                                                    )}
                                                                    {isDeadlineNear(task.deadline) && !isOverdue(task.deadline) && (
                                                                        <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                                                                            Due Soon
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <span className="text-sm text-gray-400">No deadline</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Project Details Modal */}
            {showProjectModal && selectedProject && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-2xl font-bold text-gray-900">{selectedProject.title}</h3>
                                <button
                                    onClick={() => setShowProjectModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="space-y-6">
                                {/* Project Info */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h4 className="font-semibold text-gray-900 mb-3">Project Information</h4>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-gray-600">Description:</span>
                                            <p className="font-medium text-gray-900 mt-1">{selectedProject.description}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Manager:</span>
                                            <p className="font-medium text-gray-900 mt-1">{selectedProject.manager.name}</p>
                                            <p className="text-gray-500 text-xs">{selectedProject.manager.email}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Created:</span>
                                            <p className="font-medium text-gray-900 mt-1">
                                                {new Date(selectedProject.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Total Tasks:</span>
                                            <p className="font-medium text-gray-900 mt-1">{selectedProject.tasks.length}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Employees */}
                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-3">Team Members ({selectedProject.employees.length})</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {selectedProject.employees.map((emp) => (
                                            <div key={emp._id} className="bg-gray-50 rounded-lg p-3">
                                                <p className="font-medium text-gray-900">{emp.name}</p>
                                                <p className="text-sm text-gray-600">{emp.email}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Tasks */}
                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-3">All Tasks ({selectedProject.tasks.length})</h4>
                                    <div className="space-y-3">
                                        {selectedProject.tasks.map((task) => (
                                            <div key={task._id} className="border border-gray-200 rounded-lg p-4">
                                                <div className="flex items-start justify-between mb-2">
                                                    <h5 className="font-semibold text-gray-900">{task.title}</h5>
                                                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(task.status)}`}>
                                                        {task.status || 'Pending'}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                                                <div className="flex items-center justify-between text-sm">
                                                    <div>
                                                        <span className="text-gray-600">Assigned to:</span>
                                                        <span className="ml-2 font-medium text-gray-900">{task.assignedTo.name}</span>
                                                    </div>
                                                    {task.deadline && (
                                                        <div className="flex items-center gap-2">
                                                            <Calendar className="h-4 w-4 text-gray-400" />
                                                            <span className={`${isOverdue(task.deadline)
                                                                ? 'text-red-600 font-semibold'
                                                                : isDeadlineNear(task.deadline)
                                                                    ? 'text-orange-600 font-semibold'
                                                                    : 'text-gray-900'
                                                                }`}>
                                                                {new Date(task.deadline).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => setShowProjectModal(false)}
                                className="w-full mt-6 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}