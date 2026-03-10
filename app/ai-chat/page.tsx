'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
    Send, Bot, Sparkles, ArrowLeft, Loader2, User,
    Trash2, MessageSquare, Shield, Info, Copy, Check
} from 'lucide-react'
import { getMe } from '@/backend/login'
import { geminiChat } from '@/backend/ai'

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'ai';
    timestamp: Date;
}

export default function AIChatPage() {
    const router = useRouter()
    const [user, setUser] = useState<any>(null)
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: "Hello! I'm your Aether AI assistant. How can I help you today?",
            sender: 'ai',
            timestamp: new Date()
        }
    ])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isTyping, setIsTyping] = useState(false)
    const [copiedId, setCopiedId] = useState<string | null>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        fetchUser()
    }, [])

    useEffect(() => {
        scrollToBottom()
    }, [messages, isTyping])

    const fetchUser = async () => {
        const data = await getMe()
        if (data.success) {
            setUser(data.user)
        } else {
            router.push('/')
        }
    }

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault()
        if (!input.trim() || isLoading) return

        const userMessage: Message = {
            id: Date.now().toString(),
            text: input.trim(),
            sender: 'user',
            timestamp: new Date()
        }

        setMessages(prev => [...prev, userMessage])
        setInput('')
        setIsLoading(true)
        setIsTyping(true)

        try {
            const data = await geminiChat(userMessage.text)
            if (data.success) {
                const aiMessage: Message = {
                    id: (Date.now() + 1).toString(),
                    text: data.reply,
                    sender: 'ai',
                    timestamp: new Date()
                }
                setMessages(prev => [...prev, aiMessage])
            } else {
                throw new Error(data.message || 'AI failed to respond')
            }
        } catch (err) {
            console.error('AI Chat Error:', err)
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: "I'm sorry, I encountered an error. Please try again later.",
                sender: 'ai',
                timestamp: new Date()
            }
            setMessages(prev => [...prev, errorMessage])
        } finally {
            setIsLoading(false)
            setIsTyping(false)
        }
    }

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text)
        setCopiedId(id)
        setTimeout(() => setCopiedId(null), 2000)
    }

    const clearChat = () => {
        if (window.confirm('Are you sure you want to clear the conversation?')) {
            setMessages([{
                id: '1',
                text: "Hello! I'm your Aether AI assistant. How can I help you today?",
                sender: 'ai',
                timestamp: new Date()
            }])
        }
    }

    return (
        <div className="min-h-screen bg-[#0a0a0b] text-white flex flex-col font-sans selection:bg-purple-500/30">
            {/* Ambient Background Effects */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]"></div>
            </div>

            {/* Header */}
            <header className="relative z-10 h-20 border-b border-white/5 bg-black/20 backdrop-blur-xl flex items-center justify-between px-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.push('/home')}
                        className="p-2 rounded-xl hover:bg-white/5 transition-colors text-gray-400 hover:text-white"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-tr from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                            <Bot className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="font-bold text-lg leading-tight">Aether AI</h1>
                            <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                <span className="text-xs text-green-500 font-medium uppercase tracking-wider">Online</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={clearChat}
                        className="p-2 rounded-xl hover:bg-red-500/10 transition-colors text-gray-400 hover:text-red-400"
                        title="Clear Conversation"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                    <div className="w-px h-6 bg-white/10"></div>
                    <div className="flex items-center gap-3 pl-2">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-bold">{user?.username || 'User'}</p>
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Pro Member</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/10 bg-white/5">
                            {user?.profile_picture ? (
                                <img src={user.profile_picture} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-800">
                                    <User className="w-6 h-6 text-gray-400" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Chat Area */}
            <main className="relative z-10 flex-1 overflow-y-auto px-4 py-8 md:px-6 lg:px-8 space-y-6">
                <div className="max-w-4xl mx-auto space-y-8">
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} group`}
                        >
                            <div className={`flex gap-4 max-w-[85%] md:max-w-[75%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                <div className={`w-8 h-8 rounded-lg flex-shrink-0 overflow-hidden flex items-center justify-center shadow-lg ${msg.sender === 'ai'
                                    ? 'bg-gradient-to-tr from-purple-600 to-blue-600'
                                    : 'bg-white/10'
                                    }`}>
                                    {msg.sender === 'ai' ? (
                                        <Sparkles className="w-4 h-4 text-white" />
                                    ) : (
                                        user?.profile_picture ? (
                                            <img src={user.profile_picture} alt="User" className="w-full h-full object-cover" />
                                        ) : (
                                            <User className="w-4 h-4 text-gray-400" />
                                        )
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <div className={`relative px-5 py-4 rounded-2xl text-[15px] leading-relaxed shadow-xl ${msg.sender === 'user'
                                        ? 'bg-purple-600 text-white rounded-tr-none shadow-purple-900/20'
                                        : 'bg-white/5 border border-white/10 text-gray-200 rounded-tl-none backdrop-blur-sm'
                                        }`}>
                                        {msg.text}
                                        {msg.sender === 'ai' && (
                                            <button
                                                onClick={() => copyToClipboard(msg.text, msg.id)}
                                                className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/40 text-gray-400 opacity-0 group-hover:opacity-100 transition-all hover:text-white"
                                            >
                                                {copiedId === msg.id ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                                            </button>
                                        )}
                                    </div>
                                    <p className={`text-[10px] text-gray-500 font-bold uppercase tracking-widest ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}

                    {isTyping && (
                        <div className="flex justify-start">
                            <div className="flex gap-4 items-center">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-blue-600 flex items-center justify-center shadow-lg animate-pulse">
                                    <Sparkles className="w-4 h-4 text-white" />
                                </div>
                                <div className="bg-white/5 border border-white/10 px-4 py-3 rounded-2xl rounded-tl-none backdrop-blur-sm flex gap-1.5 items-center">
                                    <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </main>

            {/* Input Area */}
            <div className="relative z-20 border-t border-white/5 bg-black/40 backdrop-blur-2xl p-6">
                <div className="max-w-4xl mx-auto">
                    <form
                        onSubmit={handleSendMessage}
                        className="relative flex items-center gap-3 bg-white/5 border border-white/10 rounded-[24px] p-2 pr-3 focus-within:border-purple-500/50 transition-all shadow-2xl"
                    >
                        <div className="flex-1 flex items-center px-4">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Message Aether AI..."
                                className="w-full bg-transparent border-none outline-none py-3 text-sm placeholder:text-gray-500 text-gray-200"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={!input.trim() || isLoading}
                            className={`p-3 rounded-xl flex items-center justify-center transition-all ${input.trim() && !isLoading
                                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 hover:scale-110 active:scale-95'
                                : 'bg-white/5 text-gray-600 cursor-not-allowed'
                                }`}
                        >
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                        </button>
                    </form>
                    <p className="text-[10px] text-center text-gray-600 mt-4 uppercase tracking-[0.2em] font-bold">
                        Aether AI may provide inaccurate info. Verification recommended.
                    </p>
                </div>
            </div>
        </div>
    )
}
