'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
    Loader2, Lock, User, CheckCircle2, AlertCircle, LogOut, Camera,
    ShieldCheck, Settings, UserCircle, Key, Save, Shield
} from 'lucide-react'
import {
    getMe, changePassword, changeUsername, updateProfilePicture, logoutUser
} from '@/backend/login'

type DashboardTab = 'overview' | 'edit-profile' | 'security'

export default function DashboardPage() {
    const router = useRouter()
    const [activeTab, setActiveTab] = useState<DashboardTab>('overview')
    const [user, setUser] = useState<{ username: string, email: string, profile_picture?: string } | null>(null)

    const fileInputRef = useRef<HTMLInputElement>(null)

    const [formData, setFormData] = useState({
        updateUsername: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        twoFactorEnabled: false
    })

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)

    useEffect(() => {
        fetchUser()
    }, [])

    const fetchUser = async () => {
        try {
            setLoading(true)
            const data = await getMe()
            if (data.success) {
                setUser(data.user)
                setFormData(prev => ({ ...prev, updateUsername: data.user.username }))
            } else {
                localStorage.removeItem('token')
                router.push('/')
            }
        } catch (err) {
            router.push('/')
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = async () => {
        try {
            await logoutUser()
            setUser(null)
            router.push('/')
        } catch (err) {
            setError('Logout failed')
        }
    }

    const handleUpdateUsername = async () => {
        setLoading(true)
        setError(null)
        setSuccess(null)
        try {
            const data = await changeUsername(formData.updateUsername)
            if (data.success) {
                setSuccess('Username updated successfully!')
                setUser(prev => prev ? { ...prev, username: formData.updateUsername } : null)
            } else {
                setError(data.message)
            }
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleChangePassword = async () => {
        if (formData.newPassword !== formData.confirmPassword) {
            setError('New passwords do not match')
            return
        }
        setLoading(true)
        setError(null)
        setSuccess(null)
        try {
            const data = await changePassword(formData.currentPassword, formData.newPassword)
            if (data.success) {
                setSuccess('Password updated successfully!')
                setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }))
            } else {
                setError(data.message)
            }
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleProfilePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setLoading(true)
        setError(null)
        setSuccess(null)
        try {
            const data = await updateProfilePicture(file)
            if (data.success) {
                setSuccess('Profile picture updated!')
                setUser(prev => prev ? { ...prev, profile_picture: data.profile_picture } : null)
            } else {
                setError(data.message)
            }
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    if (!user && !loading) return null

    return (
        <div className='min-h-screen flex items-center justify-center bg-[#0a0a0b] text-white p-4 relative overflow-hidden'>
            <div className='absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px]'></div>
            <div className='absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px]'></div>

            <div className='w-full max-w-2xl z-10 animate-in fade-in slide-in-from-bottom-4 duration-700'>
                <div className='bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden'>
                    <div className='flex flex-col md:flex-row h-full'>
                        {/* Sidebar */}
                        <div className='w-full md:w-64 bg-white/5 border-b md:border-b-0 md:border-r border-white/10 p-6 flex flex-col gap-2'>
                            <div className='flex items-center gap-3 mb-8 px-2'>
                                <div className='w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center'>
                                    <UserCircle className='w-6 h-6 text-white' />
                                </div>
                                <div className='overflow-hidden'>
                                    <h2 className='font-bold truncate'>{user?.username}</h2>
                                    <p className='text-xs text-gray-400 truncate'>{user?.email}</p>
                                </div>
                            </div>

                            <button
                                onClick={() => setActiveTab('overview')}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'overview' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                            >
                                <Settings className='w-5 h-5' />
                                <span className='text-sm font-medium'>Overview</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('edit-profile')}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'edit-profile' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                            >
                                <User className='w-5 h-5' />
                                <span className='text-sm font-medium'>Edit Profile</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('security')}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'security' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                            >
                                <ShieldCheck className='w-5 h-5' />
                                <span className='text-sm font-medium'>Security</span>
                            </button>

                            <div className='mt-auto pt-6 border-t border-white/10'>
                                <button
                                    onClick={handleLogout}
                                    className='flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-all w-full'
                                >
                                    <LogOut className='w-5 h-5' />
                                    <span className='text-sm font-medium'>Logout</span>
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className='flex-1 p-8 min-h-[500px]'>
                            <h1 className='text-2xl font-bold mb-6 flex items-center gap-2'>
                                {activeTab === 'overview' && <Settings className='w-6 h-6 text-blue-400' />}
                                {activeTab === 'edit-profile' && <User className='w-6 h-6 text-blue-400' />}
                                {activeTab === 'security' && <ShieldCheck className='w-6 h-6 text-blue-400' />}
                                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace('-', ' ')}
                            </h1>

                            {(error || success) && (
                                <div className={`mb-6 p-4 rounded-xl border flex items-center gap-3 text-sm animate-in fade-in slide-in-from-top-2 ${error ? 'bg-red-400/10 border-red-400/20 text-red-400' : 'bg-green-400/10 border-green-400/20 text-green-400'}`}>
                                    {error ? <AlertCircle className='w-5 h-5' /> : <CheckCircle2 className='w-5 h-5' />}
                                    <span>{error || success}</span>
                                </div>
                            )}

                            {activeTab === 'overview' && user && (
                                <div className='space-y-8 animate-in fade-in duration-500'>
                                    <div className='flex items-center gap-6'>
                                        <div className='relative group'>
                                            <div className='w-24 h-24 rounded-3xl overflow-hidden border-2 border-white/10 bg-white/5 shadow-2xl relative'>
                                                {user.profile_picture ? (
                                                    <img src={user.profile_picture} alt="Profile" className='w-full h-full object-cover' />
                                                ) : (
                                                    <div className='w-full h-full flex items-center justify-center bg-gradient-to-tr from-blue-500 to-purple-600'>
                                                        <User className='w-10 h-10 text-white' />
                                                    </div>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => fileInputRef.current?.click()}
                                                className='absolute -bottom-2 -right-2 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center border-4 border-[#0a0a0b] hover:bg-blue-700 transition-colors shadow-xl'
                                            >
                                                <Camera className='w-4 h-4 text-white' />
                                            </button>
                                            <input
                                                type="file"
                                                hidden
                                                ref={fileInputRef}
                                                accept="image/*"
                                                onChange={handleProfilePictureUpload}
                                            />
                                        </div>
                                        <div>
                                            <h3 className='text-xl font-bold'>{user.username}</h3>
                                            <p className='text-gray-400'>{user.email}</p>
                                            <div className='flex gap-2 mt-2'>
                                                <span className='px-3 py-1 bg-blue-500/10 text-blue-400 text-xs rounded-full border border-blue-500/20 uppercase tracking-wider font-bold'>Verified User</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                        <div className='p-4 rounded-2xl bg-white/5 border border-white/10'>
                                            <p className='text-xs text-gray-500 mb-1'>Username</p>
                                            <p className='font-medium'>{user.username}</p>
                                        </div>
                                        <div className='p-4 rounded-2xl bg-white/5 border border-white/10'>
                                            <p className='text-xs text-gray-500 mb-1'>Email Address</p>
                                            <p className='font-medium'>{user.email}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'edit-profile' && (
                                <div className='space-y-6 animate-in fade-in duration-500'>
                                    <div className='space-y-2'>
                                        <label className='text-sm font-medium text-gray-300'>Change Username</label>
                                        <div className='relative group'>
                                            <User className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-blue-400 transition-colors' />
                                            <input
                                                type="text"
                                                className='w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm'
                                                value={formData.updateUsername}
                                                onChange={(e) => setFormData({ ...formData, updateUsername: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <Button
                                        onClick={handleUpdateUsername}
                                        disabled={loading || formData.updateUsername === user?.username}
                                        className='bg-blue-600 hover:bg-blue-700 w-full rounded-xl py-6 shadow-lg shadow-blue-500/10'
                                    >
                                        {loading ? <Loader2 className='w-5 h-5 animate-spin' /> : <div className='flex items-center gap-2'><Save className='w-5 h-5' /> Update Username</div>}
                                    </Button>
                                </div>
                            )}

                            {activeTab === 'security' && (
                                <div className='space-y-8 animate-in fade-in duration-500'>
                                    <div className='space-y-4'>
                                        <div className='flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10'>
                                            <div className='flex items-center gap-3'>
                                                <div className='w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center'>
                                                    <Shield className='w-5 h-5 text-purple-400' />
                                                </div>
                                                <div>
                                                    <p className='font-medium'>Two-Factor Authentication</p>
                                                    <p className='text-xs text-gray-500'>Add an extra layer of security</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setFormData({ ...formData, twoFactorEnabled: !formData.twoFactorEnabled })}
                                                className={`w-12 h-6 rounded-full transition-all relative ${formData.twoFactorEnabled ? 'bg-blue-600' : 'bg-white/10'}`}
                                            >
                                                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${formData.twoFactorEnabled ? 'left-7' : 'left-1'}`}></div>
                                            </button>
                                        </div>
                                    </div>

                                    <div className='space-y-4 pt-4 border-t border-white/10'>
                                        <h3 className='text-lg font-bold flex items-center gap-2'><Key className='w-5 h-5 text-purple-400' /> Change Password</h3>
                                        <div className='space-y-4'>
                                            <div className='relative group'>
                                                <Lock className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-blue-400 transition-colors' />
                                                <input
                                                    type="password"
                                                    placeholder="Current Password"
                                                    className='w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm'
                                                    value={formData.currentPassword}
                                                    onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                                                />
                                            </div>
                                            <div className='relative group'>
                                                <Lock className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-blue-400 transition-colors' />
                                                <input
                                                    type="password"
                                                    placeholder="New Password"
                                                    className='w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm'
                                                    value={formData.newPassword}
                                                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                                />
                                            </div>
                                            <div className='relative group'>
                                                <Lock className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-blue-400 transition-colors' />
                                                <input
                                                    type="password"
                                                    placeholder="Confirm New Password"
                                                    className='w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm'
                                                    value={formData.confirmPassword}
                                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                                />
                                            </div>
                                            <Button
                                                onClick={handleChangePassword}
                                                disabled={loading || !formData.currentPassword || !formData.newPassword}
                                                className='w-full rounded-xl py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold'
                                            >
                                                {loading ? <Loader2 className='w-5 h-5 animate-spin' /> : 'Update Password'}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
