import { useState, useEffect } from 'react';
import API from '../services/api';
import { createSocket } from '../services/socket';

interface Project {
  _id: string;
  title: string;
  description: string;
  employees?: Employee[];
  tasks?: Task[];
}

interface Employee {
  _id: string;
  name: string;
  email: string;
}

interface Task {
  _id: string;
  title: string;
  project: string;
  description: string;
  assignedTo: Employee;
  deadline?: string;
  status: string;
  priority: string;
}

interface Notification {
  _id: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  data?: any;
}

export default function ManagerDashboard() {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [allTasks, setallTasks] = useState<Task[]>([]);
  const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showTaskViewModal, setShowTaskViewModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [selectedEmployeeForTask, setSelectedEmployeeForTask] = useState('');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [latestNotification, setLatestNotification] = useState<Notification | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterEmployee, setFilterEmployee] = useState('all');
  const [filterProject, setFilterProject] = useState('all');

  const [taskPriority, setTaskPriority] = useState('medium');

  useEffect(() => {
    const socket = createSocket();
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

      setNotifications(prev => [newNotification, ...prev].slice(0, 5));
      setUnreadCount(prev => prev + 1);
      setLatestNotification(newNotification);
      setShowToast(true);

      setTimeout(() => setShowToast(false), 5000);

      if (Notification.permission === 'granted') {
        new Notification('Task Updated', {
          body: newNotification.message
        });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    fetchNotifications()
    fetchProjects();
    fetchEmployees();
    fetchTask();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await API.get('/projects/manager');
      setProjects(res.data.projects || []);
    } catch (err) {
      console.error('Error fetching projects:', err);
    }
  };

  const fetchTask = async () => {
    try {
      const res = await API.get('/tasks');
      setallTasks(res.data.tasks || []);
    } catch (err) {
      console.error('Error fetching projects:', err);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await API.get('/auth/employees');
      setAllEmployees(res.data.employees || []);
    } catch (err) {
      console.error('Error fetching employees:', err);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await API.get('/notifications');
      const unreadNotifs = res.data.notifications.filter((n: Notification) => !n.isRead).slice(0, 5);
      setNotifications(unreadNotifs);
      setUnreadCount(unreadNotifs.length);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await API.put(`/notifications/${notificationId}/read`, {});
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      import.meta.env.VITE_API_BASE_STATUS === "development" && console.error('Error marking notification as read:', err);
    }
  };

  const createProject = async () => {
    if (!title.trim()) {
      alert('Please enter a project title');
      return;
    }

    try {
      const res = await API.post('/projects', {
        title,
        description: desc
      });

      alert('Created ' + res.data.project.title);
      setTitle('');
      setDesc('');
      fetchProjects();
    } catch (err: any) {
      //alert('Error creating project: ' + (err.response?.data?.message || err.message));
    } finally {
      fetchProjects();
    }
  };

  const getProjectTasks = (projectId: string) => {
    return allTasks.filter(task => task.project === projectId);
  };

  const openEmployeeModal = (project: Project) => {
    setSelectedProject(project);
    setSelectedEmployees([]);
    setShowEmployeeModal(true);
  };

  const openTaskModal = (project: Project) => {
    setSelectedProject(project);
    setTaskTitle('');
    setTaskDesc('');
    setSelectedEmployeeForTask('');
    setShowTaskModal(true);
  };

  const openTaskViewModal = (project: Project) => {
    setSelectedProject(project);
    setShowTaskViewModal(true);
  };

  const addEmployeesToProject = async () => {
    if (!selectedProject || selectedEmployees.length === 0) {
      alert('Please select at least one employee');
      return;
    }


    try {
      await API.put(`/projects/${selectedProject._id}/employee`, {
        employeeId: selectedEmployees
      });

      alert('Employees added successfully');
      setShowEmployeeModal(false);
      fetchProjects();
    } catch (err: any) {
      alert('Error adding employees: ' + (err.response?.data?.message || err.message));
    }
  };

  const createTask = async () => {
    if (!selectedProject || !taskTitle.trim() || !selectedEmployeeForTask) {
      alert('Please fill in all fields');
      return;
    }

    try {
      await API.post(`/tasks`, {
        projectId: selectedProject._id,
        title: taskTitle,
        description: taskDesc,
        assignedTo: selectedEmployeeForTask,
        priority: taskPriority
      });

      alert('Task created successfully');
      setShowTaskModal(false);
    } catch (err: any) {
      alert('Error creating task: ' + (err.response?.data?.message || err.message));
    } finally {
      fetchProjects();
      fetchTask();
    }
  };

  const toggleEmployee = (empId: string) => {
    setSelectedEmployees(prev =>
      prev.includes(empId) ? prev.filter(id => id !== empId) : [...prev, empId]
    );
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

  const getFilteredTasks = () => {
    let filtered = allTasks;

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(task => task.status === filterStatus);
    }

    // Priority filter
    if (filterPriority !== 'all') {
      filtered = filtered.filter(task => task.priority === filterPriority);
    }

    // Employee filter
    if (filterEmployee !== 'all') {
      filtered = filtered.filter(task => task.assignedTo?._id === filterEmployee);
    }

    // Project filter
    if (filterProject !== 'all') {
      filtered = filtered.filter(task => task.project === filterProject);
    }

    return filtered;
  };

  const resetFilters = () => {
    setSearchQuery('');
    setFilterStatus('all');
    setFilterPriority('all');
    setFilterEmployee('all');
    setFilterProject('all');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Manager Dashboard</h1>

          {/* Bell Icon with Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
              className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
            >
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotificationDropdown && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl z-50 border border-gray-200">
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </div>

                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      <svg className="mx-auto h-12 w-12 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                      <p className="text-sm">No new notifications</p>
                    </div>
                  ) : (
                    notifications.map(notif => (
                      <div
                        key={notif._id}
                        className="p-4 hover:bg-gray-50 border-b border-gray-100 cursor-pointer"
                        onClick={() => markAsRead(notif._id)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 shrink-0"></div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-900 font-medium">{notif.message}</p>
                            <p className="text-xs text-gray-500 mt-1">{formatTime(notif.createdAt)}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-3 border-t border-gray-200">
                  <a
                    href="/notifications"
                    className="block text-center text-sm text-blue-600 hover:text-blue-800 font-medium"
                    onClick={() => setShowNotificationDropdown(false)}
                  >
                    View all notifications
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Create Project Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Create New Project</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="Project Title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="text"
              placeholder="Project Description"
              value={desc}
              onChange={e => setDesc(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={createProject}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Create Project
          </button>
        </div>
        {/* Search & Filters Section - ADD THIS ENTIRE BLOCK */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Search & Filter Tasks</h2>

          {/* Search Bar */}
          <div className="mb-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search tasks by title or description..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Filter Dropdowns */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            {/* Project Filter */}
            <select
              value={filterProject}
              onChange={e => setFilterProject(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Projects</option>
              {projects.map(project => (
                <option key={project._id} value={project._id}>{project.title}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="inprogress">In Progress</option>
              <option value="completed">Completed</option>
            </select>

            {/* Priority Filter */}
            <select
              value={filterPriority}
              onChange={e => setFilterPriority(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>

            {/* Employee Filter */}
            <select
              value={filterEmployee}
              onChange={e => setFilterEmployee(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Employees</option>
              {allEmployees.map(emp => (
                <option key={emp._id} value={emp._id}>{emp.name}</option>
              ))}
            </select>
          </div>

          {/* Filter Actions */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {getFilteredTasks().length} of {allTasks.length} tasks
            </div>
            <button
              onClick={resetFilters}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Filtered Tasks Table - ADD THIS ENTIRE BLOCK */}
        {(searchQuery || filterStatus !== 'all' || filterPriority !== 'all' ||
          filterEmployee !== 'all' || filterProject !== 'all') && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Filtered Tasks</h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Task</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Project</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned To</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deadline</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {getFilteredTasks().length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                          No tasks match your filters
                        </td>
                      </tr>
                    ) : (
                      getFilteredTasks().map(task => {
                        const project = projects.find(p => p._id === task.project);
                        return (
                          <tr key={task._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div className="font-medium text-gray-900">{task.title}</div>
                              <div className="text-sm text-gray-500">{task.description}</div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {project?.title || 'N/A'}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {task.assignedTo?.name || 'Unassigned'}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${task.status === 'completed' ? 'bg-green-100 text-green-800' :
                                task.status === 'inprogress' ? 'bg-blue-100 text-blue-800' :
                                  'bg-yellow-100 text-yellow-800'
                                }`}>
                                {task.status || 'pending'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${task.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                                task.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                                  task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-gray-100 text-gray-800'
                                }`}>
                                {task.priority || 'medium'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'No deadline'}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        {/* Projects Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">All Projects</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employees
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {projects.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                      No projects yet. Create your first project above.
                    </td>
                  </tr>
                ) : (
                  projects.map(project => (
                    <tr key={project._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                        {project.title}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {project.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {project.employees?.length || 0} employee(s)
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => openEmployeeModal(project)}
                            className="bg-green-600 text-white px-4 py-1.5 rounded hover:bg-green-700 transition-colors text-sm"
                          >
                            Add Employee
                          </button>

                          {project.employees && project.employees.length > 0 && (
                            <button
                              onClick={() => openTaskModal(project)}
                              className="bg-purple-600 text-white px-4 py-1.5 rounded hover:bg-purple-700 transition-colors text-sm"
                            >
                              Add Task
                            </button>
                          )}

                          {getProjectTasks(project._id).length > 0 && (
                            <button
                              onClick={() => openTaskViewModal(project)}
                              className="bg-blue-600 text-white px-4 py-1.5 rounded hover:bg-blue-700 transition-colors text-sm"
                            >
                              View Tasks ({getProjectTasks(project._id).length})
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Employee Modal */}
      {showEmployeeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Add Employees to {selectedProject?.title}
              </h3>

              <div className="space-y-3 mb-6">
                {allEmployees.length === 0 ? (
                  <p className="text-gray-500">No employees available</p>
                ) : (
                  allEmployees.map(emp => (
                    <label key={emp._id} className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-gray-50 rounded">
                      <input
                        type="checkbox"
                        checked={selectedEmployees.includes(emp._id)}
                        onChange={() => toggleEmployee(emp._id)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <div>
                        <div className="font-medium text-gray-900">{emp.name}</div>
                        <div className="text-sm text-gray-500">{emp.email}</div>
                      </div>
                    </label>
                  ))
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={addEmployeesToProject}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Selected
                </button>
                <button
                  onClick={() => setShowEmployeeModal(false)}
                  className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Add Task to {selectedProject?.title}
              </h3>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Task Title
                  </label>
                  <input
                    type="text"
                    value={taskTitle}
                    onChange={e => setTaskTitle(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter task title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={taskDesc}
                    onChange={e => setTaskDesc(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter task description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Add Priorites
                  </label>
                  <select
                    value={taskPriority}
                    onChange={e => setTaskPriority(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assign to Employee
                  </label>
                  <select
                    value={selectedEmployeeForTask}
                    onChange={e => setSelectedEmployeeForTask(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select employee</option>
                    {selectedProject?.employees?.map(emp => (
                      <option key={emp._id} value={emp._id}>
                        {emp.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={createTask}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Task
                </button>
                <button
                  onClick={() => setShowTaskModal(false)}
                  className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Tasks Modal */}
      {showTaskViewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Tasks for {selectedProject?.title}
              </h3>

              <div className="space-y-4 mb-6">
                {selectedProject && getProjectTasks(selectedProject._id).length > 0 ? (
                  getProjectTasks(selectedProject._id).map(task => (
                    <div key={task._id} className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">{task.title}</h4>
                      <p className="text-gray-600 text-sm mb-3">{task.description}</p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">
                          Assigned to: <span className="font-medium text-gray-900">{task.assignedTo?.name}</span>
                        </span>
                        {task.deadline && (
                          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs">
                            Due: {new Date(task.deadline).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">No tasks yet</p>
                )}
              </div>

              <button
                onClick={() => setShowTaskViewModal(false)}
                className="w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showToast && latestNotification && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div className="bg-white rounded-lg shadow-2xl border-l-4 border-blue-600 p-4 max-w-sm">
            <div className="flex items-start gap-3">
              <div className="shrink-0">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900 mb-1">New Notification</p>
                <p className="text-sm text-gray-600">{latestNotification.message}</p>
              </div>
              <button
                onClick={() => setShowToast(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}