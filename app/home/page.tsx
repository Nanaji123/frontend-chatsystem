'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
    Loader2, User, LogOut, Settings, Mail, ShieldCheck,
    ArrowRight, Globe, Lock, Shield, Activity, MessageSquare
} from 'lucide-react'
import { getMe, logoutUser } from '@/backend/login'
import Chat from '@/components/Chat'

export default function HomePage() {
    const router = useRouter()
    const [user, setUser] = useState<{ username: string, email: string, profile_picture?: string } | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isChatOpen, setIsChatOpen] = useState(false)

    useEffect(() => {
        fetchUser()
    }, [router])

    const fetchUser = async () => {
        try {
            setLoading(true)
            const data = await getMe()
            if (data.success) {
                setUser(data.user)
            } else {
                localStorage.removeItem('token')
                router.push('/')
            }
        } catch (err) {
            console.error('Error fetching user:', err)
            router.push('/')
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = async () => {
        try {
            await logoutUser()
            localStorage.removeItem('token')
            setUser(null)
            router.push('/')
        } catch (err) {
            setError('Logout failed')
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0b] flex flex-col items-center justify-center text-white">
                <Loader2 className="w-12 h-12 animate-spin text-blue-500 mb-4" />
                <p className="text-gray-400 animate-pulse">Loading your experience...</p>
            </div>
        )
    }

    if (!user) return null

    return (
        <div className='min-h-screen bg-[#0a0a0b] text-white selection:bg-blue-500/30'>
            {/* Ambient Background */}
            <div className='fixed inset-0 pointer-events-none overflow-hidden'>
                <div className='absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px]'></div>
                <div className='absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[120px]'></div>
                <div className='absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-indigo-600/5 rounded-full blur-[100px]'></div>
            </div>

            {/* Navigation */}
            <nav className='relative z-20 border-b border-white/5 bg-black/20 backdrop-blur-xl'>
                <div className='max-w-7xl mx-auto px-6 h-20 flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                        <div className='w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20'>
                            <Globe className='w-6 h-6 text-white' />
                        </div>
                        <span className='font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400'>
                            AETHER
                        </span>
                    </div>

                    <div className='flex items-center gap-4'>
                        <button
                            onClick={() => router.push('/dashboard')}
                            className='hidden md:flex items-center gap-2 px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors'
                        >
                            <Settings className='w-4 h-4' />
                            Dashboard
                        </button>
                        <div className='h-6 w-px bg-white/10 hidden md:block'></div>
                        <button
                            onClick={handleLogout}
                            className='flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-sm text-red-400'
                        >
                            <LogOut className='w-4 h-4' />
                            <span className='hidden sm:inline'>Sign Out</span>
                        </button>
                    </div>
                </div>
            </nav>

            <main className='relative z-10 max-w-7xl mx-auto px-6 py-12'>
                {/* Hero Section */}
                <div className='mb-16'>
                    <div className='inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider mb-6'>
                        <Activity className='w-3 h-3' />
                        Active Session
                    </div>
                    <h1 className='text-5xl md:text-7xl font-extrabold mb-6 tracking-tight'>
                        Welcome back, <br />
                        <span className='bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400'>
                            {user.username}
                        </span>
                    </h1>
                    <p className='text-gray-400 text-lg md:text-xl max-w-2xl leading-relaxed'>
                        Your personal space is ready. Manage your profile, security settings, and explore your dashboard with ease.
                    </p>
                </div>

                {/* Info Grid */}
                <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
                    {/* User Card */}
                    <div className='lg:col-span-1'>
                        <div className='bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] p-8 relative overflow-hidden group'>
                            <div className='absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-blue-600/20 transition-all duration-500'></div>

                            <div className='relative z-10'>
                                <div className='w-24 h-24 rounded-3xl overflow-hidden mb-6 border-2 border-white/10 bg-white/5 shadow-2xl'>
                                    {user.profile_picture ? (
                                        <img src={user.profile_picture} alt="Profile" className='w-full h-full object-cover' />
                                    ) : (
                                        <div className='w-full h-full flex items-center justify-center bg-gradient-to-tr from-blue-600 to-indigo-600'>
                                            <User className='w-12 h-12 text-white' />
                                        </div>
                                    )}
                                </div>
                                <h2 className='text-2xl font-bold mb-1'>{user.username}</h2>
                                <p className='text-gray-400 text-sm mb-6 flex items-center gap-2'>
                                    <Mail className='w-4 h-4 text-blue-400' />
                                    {user.email}
                                </p>

                                <div className='space-y-3'>
                                    <div className='flex items-center justify-between p-4 rounded-2xl bg-black/20 border border-white/5'>
                                        <div className='flex items-center gap-3'>
                                            <ShieldCheck className='w-5 h-5 text-green-400' />
                                            <span className='text-sm font-medium'>Status</span>
                                        </div>
                                        <span className='text-xs font-bold text-green-400 uppercase tracking-widest'>Verified</span>
                                    </div>
                                    <div className='flex items-center justify-between p-4 rounded-2xl bg-black/20 border border-white/5'>
                                        <div className='flex items-center gap-3'>
                                            <Lock className='w-5 h-5 text-purple-400' />
                                            <span className='text-sm font-medium'>Security</span>
                                        </div>
                                        <span className='text-xs font-bold text-purple-400 uppercase tracking-widest'>Secure</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Chat Rooms Box */}
                        <div
                            onClick={() => router.push('/chat-dashboard')}
                            className='mt-8 bg-gradient-to-br from-blue-600/20 to-indigo-600/20 backdrop-blur-xl border border-blue-500/20 rounded-[32px] p-8 relative overflow-hidden group cursor-pointer hover:border-blue-500/40 transition-all duration-500 shadow-lg shadow-blue-500/10'
                        >
                            <div className='absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl -mr-8 -mt-8 group-hover:bg-blue-500/20 transition-all'></div>
                            <div className='relative z-10'>
                                <div className='w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-6 text-blue-400 group-hover:scale-110 transition-transform'>
                                    <MessageSquare className='w-6 h-6' />
                                </div>
                                <h3 className='text-xl font-bold mb-2'>Chat Rooms</h3>
                                <p className='text-gray-400 text-sm mb-6'>Join community discussions, special interest groups, and live events.</p>
                                <div className='flex items-center gap-2 text-blue-400 text-sm font-bold'>
                                    Open Dashboard
                                    <ArrowRight className='w-4 h-4 group-hover:translate-x-1 transition-transform' />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className='lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6'>
                        <button
                            onClick={() => router.push('/dashboard')}
                            className='group p-8 rounded-[32px] bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-left relative overflow-hidden'
                        >
                            <div className='absolute top-0 right-0 p-8 text-white/5 group-hover:text-blue-500/20 transition-colors'>
                                <Settings className='w-24 h-24 rotate-12 translate-x-12' />
                            </div>
                            <div className='w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-500/20 transition-colors'>
                                <Settings className='w-6 h-6 text-blue-400' />
                            </div>
                            <h3 className='text-xl font-bold mb-2'>Account Settings</h3>
                            <p className='text-gray-400 text-sm mb-6'>Manage your account details, change username, and update your profile.</p>
                            <div className='flex items-center gap-2 text-blue-400 text-sm font-bold'>
                                Configure
                                <ArrowRight className='w-4 h-4 group-hover:translate-x-1 transition-transform' />
                            </div>
                        </button>

                        <button
                            onClick={() => router.push('/dashboard')}
                            className='group p-8 rounded-[32px] bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-left relative overflow-hidden'
                        >
                            <div className='absolute top-0 right-0 p-8 text-white/5 group-hover:text-purple-500/20 transition-colors'>
                                <Shield className='w-24 h-24 -rotate-12 translate-x-12' />
                            </div>
                            <div className='w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-purple-500/20 transition-colors'>
                                <Shield className='w-6 h-6 text-purple-400' />
                            </div>
                            <h3 className='text-xl font-bold mb-2'>Privacy & Security</h3>
                            <p className='text-gray-400 text-sm mb-6'>Update your password and enable two-factor authentication for better safety.</p>
                            <div className='flex items-center gap-2 text-purple-400 text-sm font-bold'>
                                Secure Now
                                <ArrowRight className='w-4 h-4 group-hover:translate-x-1 transition-transform' />
                            </div>
                        </button>

                        <div className='md:col-span-2 p-8 rounded-[32px] bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6'>
                            <div>
                                <h3 className='text-xl font-bold mb-2'>Need any help?</h3>
                                <p className='text-gray-400 text-sm'>Our support team is always here to assist you with any questions or issues.</p>
                            </div>
                            <Button className='bg-white text-black hover:bg-gray-200 rounded-2xl px-8 py-6 h-auto font-bold'>
                                Contact Support
                            </Button>
                        </div>
                    </div>
                </div>
            </main>

            <footer className='relative z-10 border-t border-white/5 mt-24 py-12'>
                <div className='max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-gray-500 text-sm'>
                    <p>© 2026 AETHER PLATFORM. All rights reserved.</p>
                    <div className='flex gap-8'>
                        <a href="#" className='hover:text-white transition-colors'>Terms</a>
                        <a href="#" className='hover:text-white transition-colors'>Privacy</a>
                        <a href="#" className='hover:text-white transition-colors'>Cookies</a>
                    </div>
                </div>
            </footer>

            {/* Chat Toggle Button */}
            <button
                onClick={() => setIsChatOpen(true)}
                className="fixed bottom-8 right-8 w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center shadow-2xl shadow-blue-500/40 hover:bg-blue-700 hover:scale-110 transition-all z-[90] group"
            >
                <div className="absolute -top-2 -right-2 bg-green-500 w-4 h-4 rounded-full border-4 border-[#0a0a0b] animate-pulse"></div>
                <MessageSquare className="w-7 h-7 text-white group-hover:rotate-12 transition-transform" />
            </button>

            {/* Chat Popup */}
            {isChatOpen && (
                <div
                    className="fixed inset-0 z-[100] bg-black/20 backdrop-blur-[2px] pointer-events-auto"
                    onClick={() => setIsChatOpen(false)}
                >
                    <div className="fixed bottom-28 right-8">
                        <Chat onClose={() => setIsChatOpen(false)} />
                    </div>
                </div>
            )}
        </div>
    )
}
