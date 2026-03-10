'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
    Plus, Search, Filter, Calendar, Clock,
    MoreVertical, Trash2, CheckCircle2, Circle,
    AlertCircle, ChevronLeft, Loader2, Layout,
    Tag, Flag, Edit3, X
} from 'lucide-react'
import { getMe } from '@/backend/login'
import { getAllTasks, addTask, updateTask, deleteTask, markAsCompleted } from '@/backend/tasks'

interface Task {
    _id: string;
    title: string;
    description: string;
    due_date: string;
    priority: 'low' | 'medium' | 'high';
    category: string;
    status: 'pending' | 'in_progress' | 'completed';
    createdAt: string;
}

const TaskCard = ({
    task,
    handleToggleStatus,
    openEditModal,
    handleDelete,
    handleMarkAsCompleted
}: {
    task: Task,
    handleToggleStatus: (task: Task) => Promise<void>,
    openEditModal: (task: Task) => void,
    handleDelete: (id: string) => Promise<void>,
    handleMarkAsCompleted: (id: string) => Promise<void>
}) => (
    <div
        className={`group p-6 rounded-3xl border transition-all duration-300 relative overflow-hidden flex flex-col h-full ${task.status === 'completed'
            ? 'bg-green-500/5 border-green-500/20 grayscale-[0.5]'
            : task.status === 'in_progress'
                ? 'bg-blue-500/5 border-blue-500/20'
                : 'bg-white/5 border-white/10 hover:border-blue-500/40 hover:bg-white/[0.07] shadow-lg hover:shadow-blue-500/5'
            }`}
    >
        {/* Priority Glow */}
        <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl opacity-10 rounded-full -mr-16 -mt-16 ${task.priority === 'high' ? 'bg-red-500' :
            task.priority === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
            }`}></div>

        <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-start justify-between mb-4">
                <button
                    onClick={() => handleToggleStatus(task)}
                    className={`p-2 rounded-lg transition-all transform active:scale-90 ${task.status === 'completed'
                        ? 'text-green-400 hover:bg-green-400/10'
                        : task.status === 'in_progress'
                            ? 'text-blue-400 hover:bg-blue-400/10'
                            : 'text-gray-500 hover:bg-white/10 group-hover:text-blue-400'
                        }`}
                >
                    {task.status === 'completed' ? <CheckCircle2 className="w-6 h-6" /> :
                        task.status === 'in_progress' ? <Clock className="w-6 h-6" /> :
                            <Circle className="w-6 h-6" />}
                </button>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => openEditModal(task)}
                        className="p-2.5 rounded-xl text-gray-400 hover:bg-blue-500/10 hover:text-blue-400 transition-all border border-white/5 hover:border-blue-500/20"
                        title="Edit Task"
                    >
                        <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => handleDelete(task._id)}
                        className="p-2.5 rounded-xl text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-all border border-white/5 hover:border-red-500/20"
                        title="Delete Task"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <h3 className={`text-xl font-bold mb-2 transition-all ${task.status === 'completed' ? 'line-through text-gray-500' : 'text-white group-hover:text-blue-400'}`}>
                {task.title}
            </h3>
            <p className={`text-sm mb-6 line-clamp-3 leading-relaxed flex-1 transition-colors ${task.status === 'completed' ? 'text-gray-600' : 'text-gray-400 group-hover:text-gray-300'}`}>
                {task.description}
            </p>

            <div className="mt-auto space-y-4 pt-6 border-t border-white/5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg bg-black/30 border border-white/5">
                        <Flag className={`w-3 h-3 ${task.priority === 'high' ? 'text-red-400' :
                            task.priority === 'medium' ? 'text-yellow-400' : 'text-blue-400'
                            }`} />
                        <span className={
                            task.priority === 'high' ? 'text-red-400' :
                                task.priority === 'medium' ? 'text-yellow-400' : 'text-blue-400'
                        }>{task.priority} Priority</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(task.due_date).toLocaleDateString()}
                    </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-medium text-gray-400 px-3 py-1.5 rounded-lg bg-white/5 w-fit">
                    <Tag className="w-3 h-3 text-purple-400" />
                    {task.category}
                </div>

                {task.status !== 'completed' && (
                    <button
                        onClick={() => handleMarkAsCompleted(task._id)}
                        className="w-full py-3 rounded-2xl bg-blue-600/10 hover:bg-blue-600 border border-blue-500/20 hover:border-blue-500 text-blue-400 hover:text-white text-sm font-bold transition-all flex items-center justify-center gap-2 group/btn shadow-lg shadow-blue-500/5 active:scale-[0.98]"
                    >
                        <CheckCircle2 className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                        Mark as Completed
                    </button>
                )}
            </div>
        </div>
    </div>
)

export default function TasksPage() {
    const router = useRouter()
    const [user, setUser] = useState<any>(null)
    const [tasks, setTasks] = useState<Task[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingTask, setEditingTask] = useState<Task | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [categoryFilter, setCategoryFilter] = useState<string>('all')

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        due_date: '',
        priority: 'medium',
        category: 'work',
        status: 'pending'
    })
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        fetchUser()
        fetchTasks()
    }, [])

    const fetchUser = async () => {
        const data = await getMe()
        if (data.success) {
            setUser(data.user)
        } else {
            router.push('/')
        }
    }

    const fetchTasks = async () => {
        try {
            setLoading(true)
            const data = await getAllTasks()
            if (data.success) {
                setTasks(data.tasks)
            }
        } catch (err) {
            console.error('Error fetching tasks:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)
        try {
            let res;
            if (editingTask) {
                res = await updateTask({ id: editingTask._id, ...formData })
            } else {
                res = await addTask(formData as any)
            }

            if (res.success) {
                setIsModalOpen(false)
                setEditingTask(null)
                setFormData({ title: '', description: '', due_date: '', priority: 'medium', category: 'work', status: 'pending' })
                fetchTasks()
            }
        } catch (err) {
            console.error('Error saving task:', err)
        } finally {
            setSubmitting(false)
        }
    }

    const handleToggleStatus = async (task: Task) => {
        try {
            // Cycle: pending -> in_progress -> completed -> pending
            let newStatus: Task['status'] = 'pending'
            if (task.status === 'pending') newStatus = 'in_progress'
            else if (task.status === 'in_progress') newStatus = 'completed'
            else if (task.status === 'completed') newStatus = 'pending'

            const res = await updateTask({ id: task._id, status: newStatus })
            if (res.success) {
                fetchTasks()
            }
        } catch (err) {
            console.error('Error toggling status:', err)
        }
    }

    const handleMarkAsCompleted = async (id: string) => {
        try {
            const res = await markAsCompleted(id)
            if (res.success) {
                fetchTasks()
            }
        } catch (err) {
            console.error('Error marking task as completed:', err)
        }
    }

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this task?')) return
        try {
            const res = await deleteTask(id)
            if (res.success) {
                fetchTasks()
            }
        } catch (err) {
            console.error('Error deleting task:', err)
        }
    }

    const openEditModal = (task: Task) => {
        setEditingTask(task)
        setFormData({
            title: task.title,
            description: task.description,
            due_date: new Date(task.due_date).toISOString().split('T')[0],
            priority: task.priority,
            category: task.category,
            status: task.status
        })
        setIsModalOpen(true)
    }

    const filteredTasks = tasks.filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            task.description.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesStatus = statusFilter === 'all' || task.status === statusFilter
        const matchesCategory = categoryFilter === 'all' || task.category === categoryFilter
        return matchesSearch && matchesStatus && matchesCategory
    })

    const activeTasks = filteredTasks.filter(task => task.status !== 'completed')
    const completedTasks = filteredTasks.filter(task => task.status === 'completed')

    return (
        <div className="min-h-screen bg-[#0a0a0b] text-white flex flex-col font-sans selection:bg-blue-500/30">
            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[120px]"></div>
            </div>

            {/* Navigation Header */}
            <nav className="relative z-20 border-b border-white/5 bg-black/20 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.push('/home')}
                            className="p-2 rounded-xl hover:bg-white/5 transition-colors text-gray-400 hover:text-white"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                        <div className="flex items-center gap-3 border-l border-white/10 pl-4">
                            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                                <Layout className="w-6 h-6 text-white" />
                            </div>
                            <span className="font-bold text-xl tracking-tight">Task Manager</span>
                        </div>
                    </div>

                    <button
                        onClick={() => {
                            setEditingTask(null)
                            setFormData({ title: '', description: '', due_date: '', priority: 'medium', category: 'work', status: 'pending' })
                            setIsModalOpen(true)
                        }}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 transition-all font-bold text-sm shadow-lg shadow-blue-500/20 active:scale-95"
                    >
                        <Plus className="w-4 h-4" />
                        New Task
                    </button>
                </div>
            </nav>

            <main className="relative z-10 max-w-7xl mx-auto w-full px-6 py-12 flex-1">
                {/* Dash Header */}
                <div className="mb-12">
                    <h1 className="text-4xl font-extrabold mb-2">Hello, {user?.username}</h1>
                    <p className="text-gray-400">You have <span className="text-blue-400 font-bold">{tasks.filter(t => t.status !== 'completed').length} pending</span> tasks remaining for today.</p>
                </div>

                {/* Filters Row */}
                <div className="flex flex-wrap items-center justify-between gap-6 mb-8">
                    <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-2 flex-1 max-w-md focus-within:border-blue-500/50 transition-all">
                        <Search className="w-4 h-4 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search tasks..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="bg-transparent border-none outline-none text-sm w-full py-1 placeholder:text-gray-600"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="p-1 rounded-md hover:bg-white/10 text-gray-500 hover:text-white transition-colors"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative group/select">
                            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within/select:text-blue-400 transition-colors pointer-events-none" />
                            <select
                                value={statusFilter}
                                onChange={e => setStatusFilter(e.target.value)}
                                className="bg-white/5 border border-white/10 rounded-xl pl-10 pr-8 py-2.5 text-sm text-gray-400 outline-none focus:border-blue-500/50 transition-all cursor-pointer appearance-none min-w-[140px] hover:bg-white/[0.07]"
                            >
                                <option value="all">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="in_progress">In Progress</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>
                        <div className="relative group/select">
                            <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within/select:text-purple-400 transition-colors pointer-events-none" />
                            <select
                                value={categoryFilter}
                                onChange={e => setCategoryFilter(e.target.value)}
                                className="bg-white/5 border border-white/10 rounded-xl pl-10 pr-8 py-2.5 text-sm text-gray-400 outline-none focus:border-blue-500/50 transition-all cursor-pointer appearance-none min-w-[160px] hover:bg-white/[0.07]"
                            >
                                <option value="all">All Categories</option>
                                <option value="work">Work</option>
                                <option value="personal">Personal</option>
                                <option value="urgent">Urgent</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                    </div>

                    {(searchQuery || statusFilter !== 'all' || categoryFilter !== 'all') && (
                        <button
                            onClick={() => {
                                setSearchQuery('')
                                setStatusFilter('all')
                                setCategoryFilter('all')
                            }}
                            className="flex items-center gap-2 text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors uppercase tracking-widest px-2"
                        >
                            Reset Filters
                        </button>
                    )}
                </div>

                {/* Tasks Grid */}
                {loading ? (
                    <div className="h-64 flex flex-col items-center justify-center gap-4">
                        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
                        <p className="text-gray-500 animate-pulse font-medium">Synchronizing your tasks...</p>
                    </div>
                ) : (activeTasks.length > 0 || completedTasks.length > 0) ? (
                    <div className="space-y-12 pb-20">
                        {/* Active Tasks Section */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-4 px-2">
                                <h2 className="text-sm font-bold text-gray-500 uppercase tracking-[0.2em] whitespace-nowrap">Active Tasks</h2>
                                <div className="h-px w-full bg-white/5"></div>
                                <div className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-bold text-blue-400">
                                    {activeTasks.length}
                                </div>
                            </div>

                            {activeTasks.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {activeTasks.map((task) => (
                                        <TaskCard
                                            key={task._id}
                                            task={task}
                                            handleToggleStatus={handleToggleStatus}
                                            openEditModal={openEditModal}
                                            handleDelete={handleDelete}
                                            handleMarkAsCompleted={handleMarkAsCompleted}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="p-12 bg-white/5 border border-dashed border-white/10 rounded-[32px] flex flex-col items-center justify-center text-center">
                                    <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-4 text-blue-500">
                                        <Plus className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-1">No active tasks</h3>
                                    <p className="text-gray-500 text-sm max-w-xs mb-6">Great job! You've cleared all your active tasks. Ready for something new?</p>
                                    <button
                                        onClick={() => {
                                            setEditingTask(null)
                                            setFormData({ title: '', description: '', due_date: '', priority: 'medium', category: 'work', status: 'pending' })
                                            setIsModalOpen(true)
                                        }}
                                        className="px-6 py-2.5 rounded-xl bg-blue-600/10 hover:bg-blue-600 border border-blue-500/20 hover:border-blue-500 text-blue-400 hover:text-white text-sm font-bold transition-all active:scale-95 shadow-lg shadow-blue-500/5"
                                    >
                                        Create New Task
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Completed Tasks Section */}
                        {completedTasks.length > 0 && (
                            <div className="space-y-6">
                                <div className="flex items-center gap-4 px-2">
                                    <h2 className="text-sm font-bold text-gray-500 uppercase tracking-[0.2em] whitespace-nowrap">Completed Tasks</h2>
                                    <div className="h-px w-full bg-white/5"></div>
                                    <div className="px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-[10px] font-bold text-green-400">
                                        {completedTasks.length}
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {completedTasks.map((task) => (
                                        <TaskCard
                                            key={task._id}
                                            task={task}
                                            handleToggleStatus={handleToggleStatus}
                                            openEditModal={openEditModal}
                                            handleDelete={handleDelete}
                                            handleMarkAsCompleted={handleMarkAsCompleted}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="h-96 flex flex-col items-center justify-center text-center p-12 bg-white/5 border border-dashed border-white/10 rounded-[48px]">
                        <div className="w-20 h-20 bg-blue-500/10 rounded-3xl flex items-center justify-center mb-6 text-blue-500 shadow-xl shadow-blue-500/5 hover:scale-110 transition-transform">
                            <Plus className="w-10 h-10" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">No tasks yet</h2>
                        <p className="text-gray-500 max-w-xs mb-8">Ready to get organized? Start by creating your very first task right now.</p>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="px-8 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 transition-all font-bold text-sm shadow-xl shadow-blue-500/20"
                        >
                            Create Your First Task
                        </button>
                    </div>
                )}
            </main>

            {/* Task Modal Overlay */}
            {isModalOpen && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md"
                    onClick={() => setIsModalOpen(false)}
                >
                    <div
                        className="w-full max-w-lg bg-[#111122] border border-white/10 rounded-[40px] shadow-2xl relative overflow-hidden"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-[100px] -mr-32 -mt-32"></div>

                        <div className="relative z-10 p-8">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-bold">{editingTask ? 'Update Task' : 'Create New Task'}</h2>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="p-2 rounded-xl hover:bg-white/5 transition-colors text-gray-500 hover:text-white"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Task Title</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 outline-none focus:border-blue-500/50 transition-all"
                                        placeholder="Enter task title..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Description</label>
                                    <textarea
                                        rows={3}
                                        required
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 outline-none focus:border-blue-500/50 transition-all resize-none"
                                        placeholder="Add more details about this task..."
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Due Date</label>
                                        <input
                                            type="date"
                                            required
                                            value={formData.due_date}
                                            onChange={e => setFormData({ ...formData, due_date: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 outline-none focus:border-blue-500/50 transition-all [color-scheme:dark]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Priority</label>
                                        <select
                                            value={formData.priority}
                                            onChange={e => setFormData({ ...formData, priority: e.target.value as any })}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 outline-none focus:border-blue-500/50 transition-all appearance-none cursor-pointer"
                                        >
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Category</label>
                                    <select
                                        value={formData.category}
                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 outline-none focus:border-blue-500/50 transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="work">Work</option>
                                        <option value="personal">Personal</option>
                                        <option value="urgent">Urgent</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 outline-none focus:border-blue-500/50 transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="completed">Completed</option>
                                    </select>
                                </div>

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm transition-all shadow-xl shadow-blue-500/10 active:scale-95 flex items-center justify-center gap-2"
                                >
                                    {submitting ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        editingTask ? 'Save Changes' : 'Create Task'
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
