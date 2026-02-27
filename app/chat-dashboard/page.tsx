'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import io from 'socket.io-client'
import {
    MessageSquare, Send, User, Settings, LogOut, ArrowLeft,
    Search, Plus, Hash, Bell, MoreVertical, Paperclip, Smile,
    Activity, Globe, Shield, Lock, ShieldCheck, Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getMe, logoutUser } from '@/backend/login'

const SOCKET_URL = "http://localhost:3000"

export default function ChatDashboard() {
    const router = useRouter()
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [socket, setSocket] = useState<any>(null)
    const [activeChat, setActiveChat] = useState<any>({ _id: 'general', name: 'General Community' })
    const [messages, setMessages] = useState<any[]>([])
    const [input, setInput] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        fetchUser()
    }, [])

    const fetchUser = async () => {
        try {
            const data = await getMe()
            if (data.success) {
                setUser(data.user)
                initSocket()
            } else {
                router.push('/')
            }
        } catch (err) {
            router.push('/')
        } finally {
            setLoading(false)
        }
    }

    const initSocket = () => {
        const token = localStorage.getItem('token') // Or get from cookie if needed, but since server expects token in auth

        const newSocket = io(SOCKET_URL, {
            auth: { token }
        })

        newSocket.on('connect', () => {
            console.log('Connected to socket')
            newSocket.emit('join_chat', activeChat._id)
        })

        newSocket.on('receive_message', (message: any) => {
            setMessages((prev) => [...prev, message])
        })

        newSocket.on('typing', () => {
            setIsTyping(true)
            setTimeout(() => setIsTyping(false), 3000)
        })

        setSocket(newSocket)

        return () => newSocket.close()
    }

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    const sendMessage = (e: React.FormEvent) => {
        e.preventDefault()
        if (!input.trim() || !socket) return

        socket.emit('send_message', {
            chatId: activeChat._id,
            content: input
        })

        setInput('')
    }

    const handleTyping = () => {
        if (socket) {
            socket.emit('typing', activeChat._id)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0b] flex flex-col items-center justify-center text-white">
                <Loader2 className="w-12 h-12 animate-spin text-blue-500 mb-4" />
                <p className="text-gray-400 animate-pulse">Initializing your dashboard...</p>
            </div>
        )
    }

    return (
        <div className="flex h-screen bg-[#0a0a0b] text-white overflow-hidden font-sans">
            {/* Sidebar */}
            <aside className="w-80 border-r border-white/5 bg-black/40 backdrop-blur-2xl flex flex-col h-full relative z-20">
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <Globe className="w-6 h-6 text-white" />
                        </div>
                        <span className="font-bold text-xl tracking-tight">AETHER</span>
                    </div>
                </div>

                <div className="p-4 space-y-4 flex-1 overflow-y-auto scrollbar-hide">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                            placeholder="Explore rooms..."
                            className="w-full bg-white/5 border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                        />
                    </div>

                    <div className="space-y-1">
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-2 mb-2">Public Channels</p>
                        <button className="w-full flex items-center justify-between p-3 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400">
                            <div className="flex items-center gap-3 font-medium text-sm">
                                <Hash className="w-4 h-4" />
                                General Community
                            </div>
                            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        </button>
                        <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-all text-sm font-medium">
                            <Hash className="w-4 h-4" />
                            Announcements
                        </button>
                        <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-all text-sm font-medium">
                            <Hash className="w-4 h-4" />
                            Feedback
                        </button>
                    </div>

                    <div className="space-y-1 pt-4">
                        <div className="flex items-center justify-between px-2 mb-2">
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Private Rooms</p>
                            <Plus className="w-3 h-3 text-gray-500 hover:text-white cursor-pointer" />
                        </div>
                        <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-all text-sm font-medium">
                            <User className="w-4 h-4" />
                            Internal Team
                        </button>
                        <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-all text-sm font-medium">
                            <Lock className="w-4 h-4" />
                            Dev Core
                        </button>
                    </div>
                </div>

                {/* User Profile Footer */}
                <div className="p-4 border-t border-white/5 bg-black/20">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center border border-white/10">
                                <User className="w-5 h-5" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-bold truncate max-w-[100px]">{user?.username}</span>
                                <span className="text-[10px] text-green-500 font-medium">Online</span>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button className="p-2 rounded-lg hover:bg-white/5 text-gray-500 hover:text-white" onClick={() => router.push('/home')}>
                                <ArrowLeft className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Chat Area */}
            <main className="flex-1 flex flex-col h-full bg-[#0c0c0e] relative">
                {/* Header */}
                <header className="h-20 border-b border-white/5 bg-black/20 backdrop-blur-xl px-8 flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center">
                            <Hash className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <h2 className="font-bold text-lg">{activeChat.name}</h2>
                            <p className="text-xs text-gray-500 font-medium">245 members active</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center -space-x-3">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="w-8 h-8 rounded-full border-2 border-[#0c0c0e] bg-gradient-to-tr from-gray-700 to-gray-500 overflow-hidden ring-1 ring-white/5">
                                    <User className="w-full h-full p-2 text-white/50" />
                                </div>
                            ))}
                            <div className="w-8 h-8 rounded-full border-2 border-[#0c0c0e] bg-blue-600 flex items-center justify-center text-[10px] font-bold ring-1 ring-white/5">
                                +42
                            </div>
                        </div>
                        <div className="h-6 w-px bg-white/5"></div>
                        <div className="flex items-center gap-2">
                            <button className="p-2.5 rounded-xl hover:bg-white/5 text-gray-500 hover:text-white">
                                <Bell className="w-5 h-5" />
                            </button>
                            <button className="p-2.5 rounded-xl hover:bg-white/5 text-gray-500 hover:text-white">
                                <Settings className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </header>

                {/* Messages Panel */}
                <div
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-thin scrollbar-thumb-white/5"
                >
                    {messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center opacity-20 text-center">
                            <Hash className="w-24 h-24 mb-6" />
                            <h3 className="text-2xl font-bold">Welcome to {activeChat.name}</h3>
                            <p className="text-sm">This is the start of a legendary conversation.</p>
                        </div>
                    ) : (
                        messages.map((msg, i) => (
                            <div key={i} className={`flex gap-4 group ${msg.sender?._id === user?._id ? 'flex-row-reverse' : ''}`}>
                                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex-shrink-0 flex items-center justify-center mt-1">
                                    {msg.sender?.profile_picture ? (
                                        <img src={msg.sender.profile_picture} className="w-full h-full object-cover rounded-xl" />
                                    ) : (
                                        <User className="w-5 h-5 text-gray-500" />
                                    )}
                                </div>
                                <div className={`flex flex-col max-w-2xl ${msg.sender?._id === user?._id ? 'items-end' : ''}`}>
                                    <div className="flex items-center gap-3 mb-1.5 px-1">
                                        <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400">{msg.sender?.username || 'System'}</span>
                                        <span className="text-[10px] text-gray-600 font-medium">
                                            {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <div className={`p-4 rounded-[22px] text-sm leading-relaxed ${msg.sender?._id === user?._id
                                            ? 'bg-blue-600 text-white rounded-tr-none shadow-lg shadow-blue-500/10'
                                            : 'bg-white/5 border border-white/5 text-gray-300 rounded-tl-none'
                                        }`}>
                                        {msg.content}
                                    </div>
                                </div>
                                <div className={`self-center p-2 opacity-0 group-hover:opacity-100 transition-opacity ${msg.sender?._id === user?._id ? 'mr-auto' : 'ml-auto'}`}>
                                    <MoreVertical className="w-4 h-4 text-gray-600 cursor-pointer hover:text-white" />
                                </div>
                            </div>
                        ))
                    )}
                    {isTyping && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full w-fit animate-in fade-in slide-in-from-left-2">
                            <span className="flex gap-1">
                                <span className="w-1 h-1 bg-blue-500 rounded-full animate-bounce"></span>
                                <span className="w-1 h-1 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                                <span className="w-1 h-1 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                            </span>
                            <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">Someone is typing...</span>
                        </div>
                    )}
                </div>

                {/* Message Input Area */}
                <div className="p-8 pt-0">
                    <form
                        onSubmit={sendMessage}
                        className="bg-black/40 backdrop-blur-2xl border border-white/5 rounded-[28px] p-2 flex items-center gap-2 relative shadow-2xl"
                    >
                        <button type="button" className="p-3.5 rounded-2xl hover:bg-white/5 text-gray-500 hover:text-white transition-all">
                            <Plus className="w-5 h-5" />
                        </button>
                        <div className="h-6 w-px bg-white/5"></div>
                        <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleTyping}
                            placeholder={`Message #${activeChat.name}...`}
                            className="flex-1 bg-transparent border-none focus:outline-none px-4 text-sm placeholder:text-gray-600"
                        />
                        <div className="flex items-center gap-1">
                            <button type="button" className="p-3.5 rounded-2xl hover:bg-white/5 text-gray-500 hover:text-white transition-all">
                                <Smile className="w-5 h-5" />
                            </button>
                            <button type="button" className="p-3.5 rounded-2xl hover:bg-white/5 text-gray-500 hover:text-white transition-all">
                                <Paperclip className="w-5 h-5" />
                            </button>
                            <Button
                                type="submit"
                                disabled={!input.trim()}
                                className="bg-blue-600 hover:bg-blue-700 h-12 w-12 rounded-2xl p-0 shadow-lg shadow-blue-500/20 disabled:opacity-50 transition-all"
                            >
                                <Send className="w-5 h-5 text-white" />
                            </Button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    )
}
