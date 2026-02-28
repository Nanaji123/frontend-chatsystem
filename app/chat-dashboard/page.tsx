'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import io from 'socket.io-client'
import {
    MessageSquare, Send, User, Settings, LogOut, ArrowLeft,
    Search, Plus, Hash, Bell, MoreVertical, Paperclip, Smile,
    Activity, Globe, Shield, Lock, ShieldCheck, Loader2, Trash2,
    Check
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getMe, logoutUser } from '@/backend/login'
import {
    searchUsers, getChats, createChat, deleteChat, getMessages
} from '@/backend/chat'

const SOCKET_URL = "http://localhost:3000"

export default function ChatDashboard() {
    const router = useRouter()
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [socket, setSocket] = useState<any>(null)
    const [chats, setChats] = useState<any[]>([])
    const [activeChat, setActiveChat] = useState<any>(null)
    const [messages, setMessages] = useState<any[]>([])
    const [input, setInput] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [searchResults, setSearchResults] = useState<any[]>([])
    const [isSearching, setIsSearching] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)
    const activeChatRef = useRef<any>(null)

    useEffect(() => {
        activeChatRef.current = activeChat
    }, [activeChat])

    useEffect(() => {
        fetchInitialData()
    }, [])

    const fetchInitialData = async () => {
        try {
            const userData = await getMe()
            if (userData.success) {
                setUser(userData.user)
                const chatData = await getChats()
                if (chatData.success) {
                    setChats(chatData.chats)
                }
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
        const token = localStorage.getItem('token')

        const newSocket = io(SOCKET_URL, {
            auth: { token },
            withCredentials: true,
        })

        newSocket.on('connect', () => {
            console.log('✅ Connected to socket:', newSocket.id)
            if (activeChatRef.current?._id) {
                console.log('📡 Joining chat room from connect listener:', activeChatRef.current._id)
                newSocket.emit('join_chat', activeChatRef.current._id)
            }
        })

        newSocket.on('connect_error', (err: any) => {
            console.error('❌ Socket Connection Error:', err.message)
        })

        newSocket.on('receive_message', (fullMessage: any) => {
            // Check if message belongs to active chat
            setMessages((prev) => {
                // Avoid duplication if the message is already there (e.g. from local update)
                if (prev.find(m => m._id === fullMessage._id)) return prev;
                return [...prev, fullMessage]
            })

            // Also update the latest message in the chats list
            setChats(prevChats => prevChats.map(c => {
                if (c._id === fullMessage.chat) {
                    return { ...c, latestMessage: fullMessage }
                }
                return c
            }))
        })

        newSocket.on('typing', () => {
            setIsTyping(true)
            setTimeout(() => setIsTyping(false), 3000)
        })

        setSocket(newSocket)

        return () => newSocket.close()
    }

    useEffect(() => {
        if (activeChat) {
            fetchMessages(activeChat._id)
            if (socket && socket.connected) {
                console.log('📡 Emitting join_chat for:', activeChat._id)
                socket.emit('join_chat', activeChat._id)
            }
        }
    }, [activeChat, socket])

    const fetchMessages = async (chatId: string) => {
        try {
            const data = await getMessages(chatId)
            if (data.success) {
                // Messages come sorted -1 from backend, we want them chronological for display
                setMessages(data.messages.reverse())
            }
        } catch (err) {
            console.error("Error fetching messages:", err)
        }
    }

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchTerm) {
                handleSearch()
            } else {
                setSearchResults([])
            }
        }, 500)

        return () => clearTimeout(delayDebounceFn)
    }, [searchTerm])

    const handleSearch = async () => {
        setIsSearching(true)
        try {
            const data = await searchUsers(searchTerm)
            if (data.success) {
                setSearchResults(data.users)
            }
        } catch (err) {
            console.error("Search error:", err)
        } finally {
            setIsSearching(false)
        }
    }

    const startChat = async (userId: string) => {
        try {
            const data = await createChat(userId)
            if (data.success) {
                // Add to chats if not already there
                const exists = chats.find(c => c._id === data.chat._id)
                if (!exists) {
                    setChats([data.chat, ...chats])
                }
                setActiveChat(data.chat)
                setSearchTerm('')
                setSearchResults([])
            }
        } catch (err) {
            console.error("Error creating chat:", err)
        }
    }

    const handleDeleteChat = async (chatId: string) => {
        if (!confirm("Are you sure you want to delete this chat?")) return
        try {
            const data = await deleteChat(chatId)
            if (data.success) {
                setChats(chats.filter(c => c._id !== chatId))
                if (activeChat?._id === chatId) {
                    setActiveChat(null)
                    setMessages([])
                }
            }
        } catch (err) {
            console.error("Error deleting chat:", err)
        }
    }

    const sendMessage = (e: React.FormEvent) => {
        e.preventDefault()
        if (!input.trim() || !socket || !activeChat) return

        socket.emit('send_message', {
            chatId: activeChat._id,
            content: input
        })

        setInput('')
    }

    const handleTyping = () => {
        if (socket && activeChat) {
            socket.emit('typing', activeChat._id)
        }
    }

    const getChatName = (chat: any) => {
        if (chat.isGroupChat) return chat.shortName || chat.chatName
        if (chat.otherUser) return chat.otherUser.username
        const otherUser = chat.users?.find((u: any) => u._id.toString() !== user?._id?.toString())
        return otherUser?.username || chat.chatName || "Individual Chat"
    }

    const getChatAvatar = (chat: any) => {
        if (chat.isGroupChat) return null
        if (chat.otherUser) return chat.otherUser.profile_picture
        const otherUser = chat.users?.find((u: any) => u._id.toString() !== user?._id?.toString())
        return otherUser?.profile_picture
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0b] flex flex-col items-center justify-center text-white">
                <Loader2 className="w-12 h-12 animate-spin text-blue-500 mb-4" />
                <p className="text-gray-400 animate-pulse">Initializing your secure dashboard...</p>
            </div>
        )
    }

    return (
        <div className="flex h-screen bg-[#0a0a0b] text-white overflow-hidden font-sans">
            {/* Sidebar */}
            <aside className="w-80 border-r border-white/5 bg-black/40 backdrop-blur-2xl flex flex-col h-full relative z-20">
                <div className="p-6 border-b border-white/5">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <Globe className="w-6 h-6 text-white" />
                        </div>
                        <span className="font-bold text-xl tracking-tight">AETHER</span>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search users..."
                            className="w-full bg-white/5 border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                        />
                        {isSearching && (
                            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500 animate-spin" />
                        )}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto scrollbar-hide">
                    {/* Search Results */}
                    {searchResults.length > 0 && (
                        <div className="p-4 border-b border-white/5 bg-blue-500/5">
                            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest px-2 mb-3">People</p>
                            <div className="space-y-1">
                                {searchResults.map((u) => (
                                    <button
                                        key={u._id}
                                        onClick={() => startChat(u._id)}
                                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 transition-all text-left"
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                                            {u.profile_picture ? (
                                                <img src={u.profile_picture} className="w-full h-full object-cover" />
                                            ) : (
                                                <User className="w-4 h-4 text-gray-500" />
                                            )}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold">{u.username}</span>
                                            <span className="text-[10px] text-gray-500 truncate">{u.email}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Chat List */}
                    <div className="p-4 space-y-1">
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-2 mb-3">Recent Messages</p>
                        {chats.length === 0 ? (
                            <div className="text-center py-10 opacity-30">
                                <MessageSquare className="w-10 h-10 mx-auto mb-2" />
                                <p className="text-xs">No active chats</p>
                            </div>
                        ) : (
                            chats.map((chat) => (
                                <div key={chat._id} className="relative group">
                                    <button
                                        onClick={() => setActiveChat(chat)}
                                        className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all text-left ${activeChat?._id === chat._id
                                            ? 'bg-blue-600/10 border border-blue-500/20 text-blue-400'
                                            : 'hover:bg-white/5 text-gray-400 hover:text-white border border-transparent'
                                            }`}
                                    >
                                        <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                                            {getChatAvatar(chat) ? (
                                                <img src={getChatAvatar(chat)} className="w-full h-full object-cover" />
                                            ) : (
                                                <User className="w-6 h-6 text-gray-500" />
                                            )}
                                        </div>
                                        <div className="flex flex-col flex-1 truncate">
                                            <span className="text-sm font-bold">{getChatName(chat)}</span>
                                            <span className="text-[11px] opacity-60 truncate">
                                                {chat.latestMessage ? chat.latestMessage.content : "No messages yet"}
                                            </span>
                                        </div>
                                        {activeChat?._id === chat._id && (
                                            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                                        )}
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDeleteChat(chat._id); }}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-red-500/10 text-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all scale-75 group-hover:scale-100"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* User Profile Footer */}
                <div className="p-4 border-t border-white/5 bg-black/20">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center border border-white/10">
                                {user?.profile_picture ? (
                                    <img src={user.profile_picture} className="w-full h-full object-cover rounded-xl" />
                                ) : (
                                    <User className="w-5 h-5 text-white" />
                                )}
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
                {activeChat ? (
                    <>
                        {/* Header */}
                        <header className="h-20 border-b border-white/5 bg-black/20 backdrop-blur-xl px-8 flex items-center justify-between relative z-10">
                            <div className="flex items-center gap-4">
                                <div className="w-11 h-11 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center overflow-hidden">
                                    {getChatAvatar(activeChat) ? (
                                        <img src={getChatAvatar(activeChat)} className="w-full h-full object-cover" />
                                    ) : (
                                        <Hash className="w-5 h-5 text-blue-400" />
                                    )}
                                </div>
                                <div>
                                    <h2 className="font-bold text-lg">{getChatName(activeChat)}</h2>
                                    <p className="text-xs text-green-500 font-medium tracking-wide uppercase">Active Now</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
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
                                    <MessageSquare className="w-24 h-24 mb-6" />
                                    <h3 className="text-2xl font-bold">Start your conversation</h3>
                                    <p className="text-sm">Say something nice to {getChatName(activeChat)}</p>
                                </div>
                            ) : (
                                messages.map((msg, i) => (
                                    <div key={msg._id || i} className={`flex gap-4 group ${msg.sender?._id === user?._id ? 'flex-row-reverse' : ''} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
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
                                <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full w-fit animate-in fade-in slide-in-from-left-2 shadow-sm">
                                    <span className="flex gap-1">
                                        <span className="w-1 h-1 bg-blue-500 rounded-full animate-bounce"></span>
                                        <span className="w-1 h-1 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                                        <span className="w-1 h-1 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                                    </span>
                                    <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">Typing...</span>
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
                                    placeholder={`Message ${getChatName(activeChat)}...`}
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
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-20 text-center relative overflow-hidden">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[100px] pointer-events-none"></div>
                        <div className="w-24 h-24 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-[32px] flex items-center justify-center shadow-2xl shadow-blue-500/20 mb-8 relative z-10">
                            <Hash className="w-12 h-12 text-white" />
                        </div>
                        <h2 className="text-4xl font-extrabold mb-4 tracking-tight relative z-10">Select a conversation</h2>
                        <p className="text-gray-400 max-w-sm leading-relaxed relative z-10">
                            Choose a contact from the sidebar or search for someone new to start chatting in real-time.
                        </p>
                    </div>
                )}
            </main>
        </div>
    )
}
