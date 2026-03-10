'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import io from 'socket.io-client'
import {
    MessageSquare, Send, User, Users, Settings, LogOut, ArrowLeft,
    Search, Plus, Hash, Bell, MoreVertical, Paperclip, Smile,
    Activity, Globe, Shield, Lock, ShieldCheck, Loader2, Trash2,
    Check, X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getMe, logoutUser } from '@/backend/login'
import {
    searchUsers, getChats, createChat, deleteChat, getMessages, createGroupChat, getChatDetails
} from '@/backend/chat'

const SOCKET_URL = "http://localhost:3001"

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
    const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({})
    // Group chat modal state
    const [showGroupModal, setShowGroupModal] = useState(false)
    const [groupName, setGroupName] = useState('')
    const [groupUserSearch, setGroupUserSearch] = useState('')
    const [groupUserResults, setGroupUserResults] = useState<any[]>([])
    const [selectedGroupUsers, setSelectedGroupUsers] = useState<any[]>([])
    const [groupProfilePic, setGroupProfilePic] = useState('')
    const [groupFile, setGroupFile] = useState<File | null>(null)
    const [creatingGroup, setCreatingGroup] = useState(false)
    // Chat Details Modal state
    const [showDetailsModal, setShowDetailsModal] = useState(false)
    const [chatDetails, setChatDetails] = useState<any>(null)
    const [detailsLoading, setDetailsLoading] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)
    const activeChatRef = useRef<any>(null)
    const userRef = useRef<any>(null)

    useEffect(() => {
        activeChatRef.current = activeChat
    }, [activeChat])

    useEffect(() => {
        userRef.current = user
    }, [user])

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
            // Normalize raw Mongoose doc
            const chatId = fullMessage._doc?.chat || fullMessage.chat
            const msg = fullMessage._doc
                ? { ...fullMessage._doc, isMine: fullMessage.isMine }
                : { ...fullMessage, isMine: fullMessage.isMine ?? (fullMessage.sender?._id?.toString() === userRef.current?._id?.toString()) }

            setMessages((prev) => {
                if (prev.find(m => m._id === msg._id)) return prev;
                return [...prev, msg]
            })

            // Update latest message preview in sidebar
            setChats(prevChats => prevChats.map(c => {
                if (c._id === chatId) {
                    return { ...c, latestMessage: msg }
                }
                return c
            }))

            // Increment unread badge if this chat is not currently open
            if (activeChatRef.current?._id !== chatId) {
                setUnreadCounts(prev => ({ ...prev, [chatId]: (prev[chatId] || 0) + 1 }))
            }
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

    const startChat = async (userId: string, otherUserObj?: any) => {
        try {
            const data = await createChat(userId)
            if (data.success) {
                // Inject otherUser so getChatName/getChatAvatar work immediately
                const chatWithUser = otherUserObj
                    ? { ...data.chat, otherUser: otherUserObj }
                    : data.chat
                const exists = chats.find(c => c._id === data.chat._id)
                if (!exists) {
                    setChats([chatWithUser, ...chats])
                }
                setActiveChat(chatWithUser)
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

    const searchGroupUsers = async (term: string) => {
        if (!term.trim()) { setGroupUserResults([]); return }
        try {
            const data = await searchUsers(term)
            if (data.success) setGroupUserResults(data.users)
        } catch { }
    }

    const toggleGroupUser = (u: any) => {
        setSelectedGroupUsers(prev =>
            prev.find(x => x._id === u._id)
                ? prev.filter(x => x._id !== u._id)
                : [...prev, u]
        )
    }

    const handleCreateGroup = async () => {
        if (!groupName.trim() || selectedGroupUsers.length < 2) return
        setCreatingGroup(true)
        try {
            const formData = new FormData()
            formData.append('groupName', groupName.trim())
            console.log("group name", groupName);
            formData.append('users', JSON.stringify(selectedGroupUsers.map(u => u._id)))
            console.log("selected users", selectedGroupUsers);
            if (groupFile) {
                formData.append('image', groupFile)
            } else if (groupProfilePic.trim()) {
                formData.append('chat_profile_picture', groupProfilePic.trim())
            }
            console.log("FormData Contents:", [...formData.entries()]);
            const data = await createGroupChat(formData)
            if (data.success) {
                setChats(prev => [data.chat, ...prev])
                setActiveChat(data.chat)
                setShowGroupModal(false)
                setGroupName('')
                setGroupProfilePic('')
                setGroupFile(null)
                setSelectedGroupUsers([])
                setGroupUserSearch('')
                setGroupUserResults([])
            }
        } catch (err) {
            console.error('Error creating group:', err)
        } finally {
            setCreatingGroup(false)
        }
    }

    const fetchChatDetails = async () => {
        if (!activeChat) return
        setDetailsLoading(true)
        setShowDetailsModal(true)
        try {
            const data = await getChatDetails(activeChat._id)
            if (data.success) {
                setChatDetails(data.chat)
            }
        } catch (err) {
            console.error("Error fetching chat details:", err)
        } finally {
            setDetailsLoading(false)
        }
    }

    const getChatName = (chat: any) => {
        if (chat.isGroupChat) return chat.groupName || chat.chatName || 'Group Chat'
        if (chat.otherUser) return chat.otherUser.username
        const otherUser = chat.users?.find((u: any) => u._id.toString() !== user?._id?.toString())
        return otherUser?.username || chat.chatName || "Individual Chat"
    }

    const getChatAvatar = (chat: any) => {
        if (chat.isGroupChat) return chat.chat_profile_picture || null
        if (chat.otherUser) return chat.otherUser.profile_picture
        const otherUser = chat.users?.find((u: any) => u._id.toString() !== user?._id?.toString())
        return otherUser?.profile_picture
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0a0b' }}>
                <Loader2 className="w-10 h-10 animate-spin" style={{ color: '#3b82f6' }} />
            </div>
        )
    }

    return (
        <>
            <div className="flex h-screen overflow-hidden" style={{ background: '#0a0a0b', fontFamily: "'Segoe UI', sans-serif" }}>

                {/* ─── LEFT SIDEBAR ─── */}
                <aside style={{ width: 360, minWidth: 360, background: 'rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', borderRight: '1px solid rgba(255,255,255,0.05)' }}>

                    <div style={{ padding: '10px 16px', background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 40, height: 40, borderRadius: '50%', overflow: 'hidden', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                {user?.profile_picture
                                    ? <img src={user.profile_picture} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    : <User size={20} color="#6b7280" />}
                            </div>
                            <span style={{ color: '#fff', fontWeight: 600, fontSize: 15 }}>{user?.username}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <button onClick={() => setShowGroupModal(true)}
                                title="Create new group"
                                style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', color: '#60a5fa', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600 }}
                                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(59,130,246,0.28)')}
                                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(59,130,246,0.15)')}>
                                <Users size={14} /> New Group
                            </button>
                            <button onClick={() => router.push('/home')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, borderRadius: 8, color: '#6b7280' }} title="Back to home">
                                <ArrowLeft size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Search bar */}
                    <div style={{ padding: '8px 12px', background: 'rgba(0,0,0,0.2)' }}>
                        <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', padding: '8px 12px', gap: 8 }}>
                            <Search size={16} color="#6b7280" />
                            <input
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search or start new chat"
                                style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: '#fff', fontSize: 14 }}
                            />
                            {isSearching && <Loader2 size={14} color="#3b82f6" className="animate-spin" />}
                        </div>
                    </div>

                    {/* Search results dropdown */}
                    {searchResults.length > 0 && (
                        <div style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <p style={{ padding: '8px 16px', fontSize: 11, color: '#60a5fa', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Start a chat</p>
                            {searchResults.map((u) => (
                                <button key={u._id} onClick={() => startChat(u._id, u)}
                                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                                    onMouseLeave={e => (e.currentTarget.style.background = 'none')}>
                                    <div style={{ width: 40, height: 40, borderRadius: '50%', overflow: 'hidden', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {u.profile_picture ? <img src={u.profile_picture} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={18} color="#6b7280" />}
                                    </div>
                                    <div>
                                        <p style={{ color: '#fff', fontSize: 15, fontWeight: 500 }}>{u.username}</p>
                                        <p style={{ color: '#6b7280', fontSize: 13 }}>{u.email}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Chat list */}
                    <div style={{ flex: 1, overflowY: 'auto' }}>
                        {chats.filter(c => !c.isGroupChat).length === 0 && chats.filter(c => c.isGroupChat).length === 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#6b7280', gap: 8 }}>
                                <MessageSquare size={40} />
                                <p style={{ fontSize: 14 }}>No chats yet. Search for someone!</p>
                            </div>
                        ) : (
                            [...chats.filter(c => !c.isGroupChat), ...chats.filter(c => c.isGroupChat)].map((chat, idx, arr) => {
                                const isActive = activeChat?._id === chat._id
                                const isFirstGroup = chat.isGroupChat && (idx === 0 || !arr[idx - 1]?.isGroupChat)
                                const isFirstIndividual = !chat.isGroupChat && idx === 0
                                return (
                                    <div key={chat._id}>
                                        {isFirstIndividual && chats.filter(c => !c.isGroupChat).length > 0 && (
                                            <p style={{ padding: '10px 16px 4px', fontSize: 11, fontWeight: 700, color: '#60a5fa', textTransform: 'uppercase', letterSpacing: '0.10em' }}>Chats</p>
                                        )}
                                        {isFirstGroup && (
                                            <p style={{ padding: '12px 16px 4px', fontSize: 11, fontWeight: 700, color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '0.10em' }}>Group Chats</p>
                                        )}
                                        <div style={{ position: 'relative' }}
                                            onMouseEnter={e => { if (!isActive) (e.currentTarget.querySelector('.chat-row') as HTMLElement)!.style.background = 'rgba(255,255,255,0.05)' }}
                                            onMouseLeave={e => { if (!isActive) (e.currentTarget.querySelector('.chat-row') as HTMLElement)!.style.background = 'transparent' }}>
                                            <button className="chat-row" onClick={() => {
                                                setActiveChat(chat)
                                                setUnreadCounts(prev => ({ ...prev, [chat._id]: 0 }))
                                            }}
                                                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: isActive ? (chat.isGroupChat ? 'rgba(167,139,250,0.08)' : 'rgba(59,130,246,0.08)') : 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer', textAlign: 'left' }}>
                                                <div style={{ width: 46, height: 46, borderRadius: '50%', overflow: 'hidden', background: chat.isGroupChat ? 'rgba(167,139,250,0.15)' : 'rgba(255,255,255,0.05)', border: `1px solid ${chat.isGroupChat ? 'rgba(167,139,250,0.3)' : 'rgba(255,255,255,0.08)'}`, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    {getChatAvatar(chat)
                                                        ? <img src={getChatAvatar(chat)!} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                        : (chat.isGroupChat ? <Users size={22} color="#a78bfa" /> : <User size={22} color="#6b7280" />)}
                                                </div>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <span style={{ color: isActive ? (chat.isGroupChat ? '#a78bfa' : '#60a5fa') : '#e9edef', fontSize: 15, fontWeight: unreadCounts[chat._id] ? 700 : 600 }}>{getChatName(chat)}</span>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                            {chat.latestMessage && (
                                                                <span style={{ color: unreadCounts[chat._id] ? '#22c55e' : '#6b7280', fontSize: 11 }}>
                                                                    {new Date(chat.latestMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                </span>
                                                            )}
                                                            {!!unreadCounts[chat._id] && (
                                                                <span style={{ background: '#22c55e', color: '#fff', borderRadius: '50%', minWidth: 18, height: 18, fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px' }}>
                                                                    {unreadCounts[chat._id]}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <p style={{ color: unreadCounts[chat._id] ? '#e9edef' : '#6b7280', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 2, fontWeight: unreadCounts[chat._id] ? 600 : 400 }}>
                                                        {chat.latestMessage ? (chat.latestMessage.content || chat.latestMessage._doc?.content || 'New message') : 'No messages yet'}
                                                    </p>
                                                </div>
                                            </button>
                                            <button onClick={(e) => { e.stopPropagation(); handleDeleteChat(chat._id) }}
                                                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'rgba(239,68,68,0.1)', border: 'none', borderRadius: 6, padding: '4px 6px', cursor: 'pointer', color: '#ef4444', opacity: 0, transition: 'opacity 0.2s' }}
                                                className="delete-chat-btn">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>

                    {/* ── Sidebar Footer: User profile + Logout ── */}
                    <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.07)', background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 38, height: 38, borderRadius: '50%', overflow: 'hidden', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {user?.profile_picture
                                    ? <img src={user.profile_picture} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    : <User size={18} color="#6b7280" />}
                            </div>
                            <div>
                                <p style={{ color: '#fff', fontWeight: 600, fontSize: 14, lineHeight: 1.2 }}>{user?.username}</p>
                                <p style={{ color: '#22c55e', fontSize: 11, fontWeight: 500 }}>● Online</p>
                            </div>
                        </div>
                        <button
                            onClick={async () => { await logoutUser(); router.push('/') }}
                            title="Logout"
                            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', color: '#f87171', fontSize: 13, fontWeight: 600 }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.25)' }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.12)' }}
                        >
                            <LogOut size={15} />
                            Logout
                        </button>
                    </div>
                </aside>

                {/* ─── MAIN CHAT AREA ─── */}
                <main style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#0c0c0e', position: 'relative', overflow: 'hidden' }}>

                    {activeChat ? (
                        <>
                            {/* Chat Header */}
                            <header style={{ height: 64, background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(20px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', flexShrink: 0, zIndex: 10 }}>
                                <div onClick={fetchChatDetails}
                                    style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                                    <div style={{ width: 42, height: 42, borderRadius: '50%', overflow: 'hidden', background: activeChat.isGroupChat ? 'rgba(167,139,250,0.1)' : 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {getChatAvatar(activeChat)
                                            ? <img src={getChatAvatar(activeChat)!} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            : (activeChat.isGroupChat ? <Users size={20} color="#a78bfa" /> : <User size={20} color="#6b7280" />)}
                                    </div>
                                    <div>
                                        <p style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>{getChatName(activeChat)}</p>
                                        <p style={{ color: activeChat.isGroupChat ? '#a78bfa' : '#22c55e', fontSize: 12, fontWeight: 500 }}>
                                            {activeChat.isGroupChat ? "Click for group info" : "Online"}
                                        </p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: 4 }}>
                                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, borderRadius: '50%', color: '#6b7280' }}><Search size={20} /></button>
                                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, borderRadius: '50%', color: '#6b7280' }}><MoreVertical size={20} /></button>
                                </div>
                            </header>

                            {/* Messages */}
                            <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '16px 8%', display: 'flex', flexDirection: 'column', gap: 2 }}>
                                {messages.length === 0 ? (
                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#8696a0', gap: 12, opacity: 0.6 }}>
                                        <MessageSquare size={48} />
                                        <p style={{ fontSize: 14 }}>No messages yet. Say hi! 👋</p>
                                    </div>
                                ) : (
                                    messages.map((msg, i) => {
                                        const isOwn = msg.isMine === true
                                        const prevMsg = messages[i - 1]
                                        const isSameSenderAsPrev = prevMsg && prevMsg.sender?._id === msg.sender?._id
                                        return (
                                            <div key={msg._id || i} style={{ display: 'flex', flexDirection: isOwn ? 'row-reverse' : 'row', alignItems: 'flex-end', gap: 8, width: '100%', marginTop: isSameSenderAsPrev ? 2 : 10 }}>
                                                {/* Avatar — shown for ALL messages */}
                                                <div style={{ width: 30, height: 30, borderRadius: '50%', overflow: 'hidden', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-end', marginBottom: 2 }}>
                                                    {msg.sender?.profile_picture ? <img src={msg.sender.profile_picture} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={14} color="#6b7280" />}
                                                </div>

                                                {/* Bubble */}
                                                <div style={{ maxWidth: '65%', display: 'flex', flexDirection: 'column', alignItems: isOwn ? 'flex-end' : 'flex-start' }}>
                                                    {/* Sender name for other users */}
                                                    {!isOwn && !isSameSenderAsPrev && (
                                                        <span style={{ fontSize: 12, fontWeight: 600, color: '#60a5fa', marginBottom: 2, paddingLeft: 12 }}>{msg.sender?.username}</span>
                                                    )}
                                                    <div style={{
                                                        padding: '8px 14px 6px',
                                                        borderRadius: isOwn ? '18px 4px 18px 18px' : '4px 18px 18px 18px',
                                                        background: isOwn ? '#2563eb' : 'rgba(255,255,255,0.06)',
                                                        border: isOwn ? 'none' : '1px solid rgba(255,255,255,0.08)',
                                                        color: '#e9edef',
                                                        fontSize: 14,
                                                        lineHeight: 1.5,
                                                        wordBreak: 'break-word',
                                                        position: 'relative',
                                                        boxShadow: '0 1px 2px rgba(0,0,0,0.3)',
                                                        minWidth: 60,
                                                    }}>
                                                        {msg.content}
                                                        {/* Time + tick */}
                                                        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 3, marginTop: 3 }}>
                                                            <span style={{ fontSize: 10, color: isOwn ? 'rgba(255,255,255,0.5)' : '#6b7280' }}>
                                                                {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                            {isOwn && <Check size={12} color="rgba(255,255,255,0.5)" />}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })
                                )}

                                {/* Typing indicator */}
                                {isTyping && (
                                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, marginTop: 10 }}>
                                        <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }} />
                                        <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px 18px 18px 18px', padding: '12px 16px', display: 'flex', gap: 4 }}>
                                            <span style={{ width: 6, height: 6, background: '#6b7280', borderRadius: '50%', animation: 'bounce 1.2s infinite' }} />
                                            <span style={{ width: 6, height: 6, background: '#6b7280', borderRadius: '50%', animation: 'bounce 1.2s 0.2s infinite' }} />
                                            <span style={{ width: 6, height: 6, background: '#6b7280', borderRadius: '50%', animation: 'bounce 1.2s 0.4s infinite' }} />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Input Bar */}
                            <div style={{ padding: '8px 16px', background: '#202c33', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, borderTop: '1px solid #2a3942' }}>
                                <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, color: '#8696a0', borderRadius: '50%', display: 'flex', alignItems: 'center' }}>
                                    <Smile size={24} />
                                </button>
                                <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, color: '#8696a0', borderRadius: '50%', display: 'flex', alignItems: 'center' }}>
                                    <Paperclip size={24} />
                                </button>
                                <form onSubmit={sendMessage} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <input
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={handleTyping}
                                        placeholder="Type a message"
                                        style={{ flex: 1, background: '#2a3942', border: 'none', outline: 'none', color: '#e9edef', fontSize: 15, padding: '10px 16px', borderRadius: 8 }}
                                    />
                                    <button type="submit" disabled={!input.trim()}
                                        style={{ width: 44, height: 44, borderRadius: '50%', background: input.trim() ? '#00a884' : '#2a3942', border: 'none', cursor: input.trim() ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background 0.2s' }}>
                                        <Send size={20} color={input.trim() ? '#fff' : '#8696a0'} />
                                    </button>
                                </form>
                            </div>
                        </>
                    ) : (
                        /* No chat selected — WhatsApp-style welcome */
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#8696a0', textAlign: 'center', gap: 16 }}>
                            <MessageSquare size={80} color="#2a3942" />
                            <div>
                                <h2 style={{ color: '#e9edef', fontSize: 28, fontWeight: 300, marginBottom: 8 }}>WhatsApp Web</h2>
                                <p style={{ fontSize: 14, color: '#8696a0', maxWidth: 340 }}>
                                    Send and receive messages without keeping your phone online.
                                </p>
                            </div>
                        </div>
                    )}

                    <style>{`
                    @keyframes bounce {
                        0%, 60%, 100% { transform: translateY(0); }
                        30% { transform: translateY(-4px); }
                    }
                    .delete-chat-btn { opacity: 0 !important; }
                    div:hover > .delete-chat-btn { opacity: 1 !important; }
                    ::-webkit-scrollbar { width: 6px; }
                    ::-webkit-scrollbar-track { background: transparent; }
                    ::-webkit-scrollbar-thumb { background: #2a3942; border-radius: 3px; }
                `}</style>
                </main>
            </div>

            {/* ── Create Group Modal ── */}
            {showGroupModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    onClick={() => setShowGroupModal(false)}>
                    <div style={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: 28, width: 420, maxHeight: '80vh', display: 'flex', flexDirection: 'column', gap: 16, boxShadow: '0 24px 60px rgba(0,0,0,0.6)' }}
                        onClick={e => e.stopPropagation()}>

                        {/* Modal header */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(167,139,250,0.15)', border: '1px solid rgba(167,139,250,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Users size={18} color="#a78bfa" />
                                </div>
                                <span style={{ color: '#fff', fontWeight: 700, fontSize: 17 }}>New Group Chat</span>
                            </div>
                            <button onClick={() => setShowGroupModal(false)}
                                style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: 8, padding: 6, cursor: 'pointer', color: '#6b7280' }}>
                                <X size={18} />
                            </button>
                        </div>

                        {/* Group name input */}
                        <div>
                            <label style={{ display: 'block', color: '#6b7280', fontSize: 12, fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Group Name</label>
                            <input
                                value={groupName}
                                onChange={e => setGroupName(e.target.value)}
                                placeholder="e.g. Project Team, Friends..."
                                style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 14px', color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                            />
                        </div>

                        {/* Group profile picture input */}
                        <div>
                            <label style={{ display: 'block', color: '#6b7280', fontSize: 12, fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Group Profile Picture</label>
                            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                <div style={{ width: 60, height: 60, borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
                                    {groupFile ? (
                                        <img src={URL.createObjectURL(groupFile)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : groupProfilePic ? (
                                        <img src={groupProfilePic} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <Users size={28} color="#6b7280" />
                                    )}
                                </div>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <label style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', color: '#60a5fa', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <Paperclip size={14} /> Upload Image
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={e => {
                                                    const file = e.target.files?.[0]
                                                    if (file) {
                                                        setGroupFile(file)
                                                        setGroupProfilePic('')
                                                    }
                                                }}
                                                style={{ display: 'none' }}
                                            />
                                        </label>
                                        {(groupFile || groupProfilePic) && (
                                            <button
                                                onClick={() => { setGroupFile(null); setGroupProfilePic('') }}
                                                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', color: '#ef4444' }}
                                            >
                                                <X size={14} />
                                            </button>
                                        )}
                                    </div>
                                    <input
                                        value={groupProfilePic}
                                        onChange={e => { setGroupProfilePic(e.target.value); setGroupFile(null) }}
                                        placeholder="Or paste image URL..."
                                        style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '8px 12px', color: '#fff', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Search users for group */}
                        <div>
                            <label style={{ display: 'block', color: '#6b7280', fontSize: 12, fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Add Members (min 2)</label>
                            <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, display: 'flex', alignItems: 'center', padding: '8px 12px', gap: 8 }}>
                                <Search size={14} color="#6b7280" />
                                <input
                                    value={groupUserSearch}
                                    onChange={e => { setGroupUserSearch(e.target.value); searchGroupUsers(e.target.value) }}
                                    placeholder="Search users..."
                                    style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: '#fff', fontSize: 14 }}
                                />
                            </div>

                            {/* Search results */}
                            {groupUserResults.length > 0 && (
                                <div style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, marginTop: 6, maxHeight: 160, overflowY: 'auto' }}>
                                    {groupUserResults.map(u => {
                                        const selected = !!selectedGroupUsers.find(x => x._id === u._id)
                                        return (
                                            <button key={u._id} onClick={() => toggleGroupUser(u)}
                                                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px', background: selected ? 'rgba(167,139,250,0.1)' : 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                                                <div style={{ width: 32, height: 32, borderRadius: '50%', overflow: 'hidden', background: 'rgba(255,255,255,0.07)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    {u.profile_picture ? <img src={u.profile_picture} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={14} color="#6b7280" />}
                                                </div>
                                                <span style={{ color: selected ? '#a78bfa' : '#e9edef', fontSize: 14, fontWeight: selected ? 600 : 400 }}>{u.username}</span>
                                                {selected && <span style={{ marginLeft: 'auto', color: '#a78bfa', fontSize: 12 }}>✓ Added</span>}
                                            </button>
                                        )
                                    })}
                                </div>
                            )}

                            {/* Selected chips */}
                            {selectedGroupUsers.length > 0 && (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                                    {selectedGroupUsers.map(u => (
                                        <span key={u._id} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(167,139,250,0.15)', border: '1px solid rgba(167,139,250,0.3)', borderRadius: 20, padding: '4px 10px 4px 8px', fontSize: 13, color: '#a78bfa' }}>
                                            {u.username}
                                            <button onClick={() => toggleGroupUser(u)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#a78bfa', display: 'flex' }}><X size={12} /></button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Create button */}
                        <button
                            onClick={handleCreateGroup}
                            disabled={!groupName.trim() || selectedGroupUsers.length < 2 || creatingGroup}
                            style={{ background: selectedGroupUsers.length >= 2 && groupName.trim() ? 'linear-gradient(135deg, #7c3aed, #a78bfa)' : 'rgba(255,255,255,0.05)', border: 'none', borderRadius: 10, padding: '12px', cursor: selectedGroupUsers.length >= 2 && groupName.trim() ? 'pointer' : 'default', color: selectedGroupUsers.length >= 2 && groupName.trim() ? '#fff' : '#6b7280', fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s' }}>
                            {creatingGroup ? <Loader2 size={18} className="animate-spin" /> : <><Users size={16} /> Create Group</>}
                        </button>
                    </div>
                </div>
            )}
            {/* ── Chat Details Modal (Premium Theme) ── */}
            {showDetailsModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,10,11,0.6)', backdropFilter: 'blur(12px)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    onClick={() => { setShowDetailsModal(false); setChatDetails(null) }}>
                    <div style={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, width: 450, maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 24px 80px rgba(0,0,0,0.6)' }}
                        onClick={e => e.stopPropagation()}>

                        {/* Modal Header */}
                        <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 15, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <button onClick={() => { setShowDetailsModal(false); setChatDetails(null) }}
                                style={{ background: 'none', border: 'none', color: '#8696a0', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                                <X size={22} />
                            </button>
                            <span style={{ color: '#e9edef', fontSize: 18, fontWeight: 600 }}>{activeChat?.isGroupChat ? 'Group info' : 'Contact info'}</span>
                        </div>

                        {/* Modal Content Scrollable */}
                        <div style={{ flex: 1, overflowY: 'auto', background: '#161625' }}>
                            {detailsLoading ? (
                                <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Loader2 size={32} className="animate-spin" color="#a78bfa" />
                                </div>
                            ) : chatDetails ? (
                                <>
                                    {/* Big Profile Pic Section */}
                                    <div style={{ background: '#1a1a2e', padding: '28px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
                                        <div style={{ width: 200, height: 200, borderRadius: '50%', overflow: 'hidden', background: activeChat?.isGroupChat ? 'rgba(167,139,250,0.1)' : 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 40px rgba(0,0,0,0.4)', border: '2px solid rgba(167,139,250,0.2)' }}>
                                            {getChatAvatar(activeChat) ? (
                                                <img src={getChatAvatar(activeChat)!} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                activeChat?.isGroupChat ? <Users size={100} color="#a78bfa" /> : <User size={100} color="#8696a0" />
                                            )}
                                        </div>
                                        <div style={{ textAlign: 'center' }}>
                                            <h2 style={{ color: '#fff', fontSize: 24, fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>{chatDetails.chatName || chatDetails.user?.username}</h2>
                                            {activeChat?.isGroupChat && (
                                                <p style={{ color: '#a78bfa', fontSize: 16, marginTop: 4, fontWeight: 500 }}>Group • {chatDetails.totalMembers} members</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Description / Status Section */}
                                    <div style={{ background: '#1a1a2e', marginTop: 10, padding: '20px' }}>
                                        <label style={{ display: 'block', color: '#a78bfa', fontSize: 13, fontWeight: 700, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{activeChat?.isGroupChat ? 'Description' : 'About'}</label>
                                        <p style={{ color: '#e9edef', fontSize: 16, margin: 0, lineHeight: 1.6 }}>
                                            {chatDetails.groupDescription || (activeChat?.isGroupChat ? "No description provided." : "Hey there! I am using this chatapp.")}
                                        </p>
                                        <p style={{ color: '#6b7280', fontSize: 13, marginTop: 12 }}>
                                            Created {new Date(chatDetails.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>

                                    {/* Members Section (Groups Only) */}
                                    {activeChat?.isGroupChat && (
                                        <div style={{ background: '#1a1a2e', marginTop: 10, paddingBottom: 20 }}>
                                            <div style={{ padding: '20px 20px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <label style={{ color: '#a78bfa', fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{chatDetails.totalMembers} participants</label>
                                                <Search size={18} color="#6b7280" />
                                            </div>
                                            <div>
                                                {chatDetails.members?.map((member: any) => (
                                                    <div key={member._id} style={{ display: 'flex', alignItems: 'center', gap: 15, padding: '12px 20px', cursor: 'pointer', transition: 'background 0.2s' }}
                                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                                        <div style={{ width: 44, height: 44, borderRadius: '50%', overflow: 'hidden', background: 'rgba(255,255,255,0.05)', flexShrink: 0, border: '1px solid rgba(255,255,255,0.1)' }}>
                                                            {member.profile_picture ? <img src={member.profile_picture} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={22} color="#6b7280" style={{ margin: 11 }} />}
                                                        </div>
                                                        <div style={{ flex: 1, borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <div>
                                                                <p style={{ color: '#fff', fontSize: 16, fontWeight: 600, margin: 0 }}>{member.username} {member._id === user?._id && "(You)"}</p>
                                                                <p style={{ color: member.isOnline ? '#22c55e' : '#6b7280', fontSize: 13, margin: 0, fontWeight: 500 }}>{member.isOnline ? "Online" : "Away"}</p>
                                                            </div>
                                                            {member._id === chatDetails.groupAdmin?._id && (
                                                                <span style={{ background: 'rgba(167,139,250,0.15)', color: '#a78bfa', borderRadius: 6, padding: '4px 8px', fontSize: 11, fontWeight: 700, border: '1px solid rgba(167,139,250,0.3)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Admin</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Footer Actions */}
                                    <div style={{ background: '#1a1a2e', marginTop: 10, padding: 10 }}>
                                        <button style={{ width: '100%', background: 'none', border: 'none', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 20, color: '#ef4444', cursor: 'pointer', fontSize: 16, fontWeight: 600, textAlign: 'left', transition: 'all 0.2s', borderRadius: 12 }}
                                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.05)'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                            <Trash2 size={20} />
                                            <span>{activeChat?.isGroupChat ? 'Exit group' : 'Block contact'}</span>
                                        </button>
                                    </div>
                                </>
                            ) : null}
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

