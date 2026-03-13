'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
    Send, Bot, Sparkles, ArrowLeft, Loader2, User,
    Trash2, MessageSquare, Shield, Info, Copy, Check, Plus, History,
    Paperclip, FileText, X, Zap, GitBranch, Layers, Image as ImageIcon,
    Brush, Maximize2, Minimize2, ChevronLeft, ChevronRight
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { getMe } from '@/backend/login'
import { geminiChat, getAIChats, getAIChatDetails, createAIChat, uploadPDF, deleteAIChat } from '@/backend/ai'
import mermaid from 'mermaid'

// Mermaid renderer component with Zoom
const Mermaid = ({ chart }: { chart: string }) => {
    const ref = useRef<HTMLDivElement>(null)
    const [isZoomed, setIsZoomed] = useState(false)

    useEffect(() => {
        if (ref.current) {
            mermaid.initialize({
                startOnLoad: true,
                theme: 'dark',
                securityLevel: 'loose',
                themeVariables: {
                    primaryColor: '#8b5cf6',
                    primaryTextColor: '#fff',
                    lineColor: '#4b5563',
                    fontSize: '14px'
                }
            })
            mermaid.render('mermaid-' + Math.random().toString(36).substr(2, 9), chart)
                .then(({ svg }) => {
                    if (ref.current) ref.current.innerHTML = svg
                })
        }
    }, [chart])

    return (
        <div className="relative group/mermaid my-6 w-full">
            <div
                ref={ref}
                className={`bg-white/5 border border-white/10 rounded-2xl p-6 overflow-x-auto transition-all duration-300 [&>svg]:w-full [&>svg]:h-auto ${isZoomed ? 'fixed inset-4 z-[100] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-12' : 'w-full'}`}
            />
            <button
                onClick={() => setIsZoomed(!isZoomed)}
                className="absolute top-4 right-4 p-2 rounded-xl bg-black/60 text-white opacity-0 group-hover/mermaid:opacity-100 transition-all hover:bg-purple-600 z-[101]"
            >
                {isZoomed ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            {isZoomed && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99]" onClick={() => setIsZoomed(false)} />}
        </div>
    )
}

// Flashcard component refined - Expansive for Carousel
const Flashcard = ({ front, back }: { front: string, back: string }) => {
    const [isFlipped, setIsFlipped] = useState(false)
    return (
        <div
            className="group w-full [perspective:1000px] cursor-pointer"
            onClick={() => setIsFlipped(!isFlipped)}
        >
            <div className={`relative w-full rounded-[32px] transition-all duration-700 [transform-style:preserve-3d] shadow-2xl ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}>
                {/* Ghost Layer: Drives parent height dynamically */}
                <div className="invisible pointer-events-none p-8 md:p-10 flex flex-col items-center justify-center gap-4 min-h-[340px]">
                    <div className="px-4 py-1.5 rounded-full opacity-0">Spacer Label</div>
                    <div className="flex-1 flex items-center justify-center w-full">
                        <span className="text-[13px] leading-relaxed break-words py-10 opacity-0">
                            {/* Render the longer of the two to ensure both fit */}
                            {front.length > back.length ? front : back}
                        </span>
                    </div>
                </div>

                {/* Front */}
                <div className="absolute inset-0 h-full w-full rounded-[32px] bg-white/[0.03] border border-white/10 [backface-visibility:hidden] flex flex-col items-center justify-center p-8 md:p-10 text-center gap-4 backdrop-blur-xl">
                    <div className="px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-[9px] text-purple-400 uppercase tracking-[0.2em] font-black">Memory Unit</div>
                    <div className="flex-1 flex items-center justify-center w-full overflow-hidden">
                        <span className="text-[13px] font-bold text-white/90 leading-relaxed w-full break-words max-h-full overflow-y-auto hide-scrollbar selection:bg-purple-500/30">
                            {front}
                        </span>
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-[9px] text-purple-500/50 uppercase tracking-widest font-black group-hover:text-purple-400 transition-colors">
                        <Zap className="w-3 h-3" />
                        Interact
                    </div>
                </div>

                {/* Back */}
                <div className="absolute inset-0 h-full w-full rounded-[32px] bg-gradient-to-br from-purple-600/20 to-blue-600/20 border border-purple-500/30 [transform:rotateY(180deg)] [backface-visibility:hidden] flex flex-col items-center justify-center p-8 md:p-10 text-center gap-4 backdrop-blur-2xl">
                    <div className="px-4 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-[10px] text-green-400 uppercase tracking-[0.2em] font-black">Neural Result</div>
                    <div className="flex-1 flex items-center justify-center w-full overflow-hidden">
                        <span className="text-[13px] text-white/90 leading-relaxed font-semibold w-full break-words max-h-full overflow-y-auto hide-scrollbar selection:bg-purple-500/30">
                            {back}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}

// Carousel Component to handle switching
// Carousel Component to handle switching
const FlashcardCarousel = ({ cards }: { cards: any[] }) => {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isAnimating, setIsAnimating] = useState(false)

    const nextCard = () => {
        setIsAnimating(true)
        setTimeout(() => {
            setCurrentIndex((prev) => (prev + 1) % cards.length)
            setIsAnimating(false)
        }, 200)
    }

    const prevCard = () => {
        setIsAnimating(true)
        setTimeout(() => {
            setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length)
            setIsAnimating(false)
        }, 200)
    }

    return (
        <div className="my-8 w-full p-8 rounded-[40px] bg-[#0c0c12]/60 border border-white/5 backdrop-blur-3xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6)] relative overflow-hidden group/box">
            {/* Ambient Background Element */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="flex items-center justify-between mb-10 relative z-10">
                <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/50">Neural Link Active</h4>
                        </div>
                        <h3 className="text-sm font-black uppercase tracking-widest text-white">Memory Protocol</h3>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-4 py-1.5 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
                        <div className="flex gap-1" title={`${cards.length} cards total`}>
                            {[...Array(Math.min(cards.length, 5))].map((_, i) => (
                                <div key={i} className={`w-1 h-1 rounded-full transition-all duration-300 ${i === currentIndex % 5 ? 'bg-purple-500 scale-125' : 'bg-white/20'}`} />
                            ))}
                        </div>
                        <span className="text-[10px] font-black text-purple-400 border-l border-white/10 pl-3">
                            {currentIndex + 1} / {cards.length}
                        </span>
                    </div>
                </div>
            </div>

            <div className="relative z-10 flex justify-center">
                <div className={`w-full max-w-xl transition-all duration-300 transform ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
                    <Flashcard key={currentIndex} front={cards[currentIndex].front} back={cards[currentIndex].back} />
                </div>
            </div>

            <div className="mt-10 flex items-center justify-center gap-6 relative z-10">
                <button
                    onClick={prevCard}
                    className="p-4 rounded-[20px] bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-purple-600/20 hover:border-purple-500/30 transition-all hover:scale-105 active:scale-95 group/btn"
                >
                    <ChevronLeft className="w-6 h-6 group-hover/btn:-translate-x-1 transition-transform" />
                </button>

                <div className="text-[9px] font-black uppercase tracking-[0.3em] text-white/10">
                    Shift Data
                </div>

                <button
                    onClick={nextCard}
                    className="p-4 rounded-[20px] bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-purple-600/20 hover:border-purple-500/30 transition-all hover:scale-105 active:scale-95 group/btn"
                >
                    <ChevronRight className="w-6 h-6 group-hover/btn:translate-x-1 transition-transform" />
                </button>
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
        </div>
    )
}

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'ai';
    timestamp: Date;
}

interface ChatSession {
    id: string;
    title: string;
    updatedAt: string;
}

export default function AIChatPage() {
    const router = useRouter()
    const [user, setUser] = useState<any>(null)
    const [chats, setChats] = useState<ChatSession[]>([])
    const [currentChatId, setCurrentChatId] = useState<string | null>(null)
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isTyping, setIsTyping] = useState(false)
    const [isFetchingHistory, setIsFetchingHistory] = useState(false)
    const [copiedId, setCopiedId] = useState<string | null>(null)
    const [attachedFile, setAttachedFile] = useState<{ name: string, text: string } | null>(null)
    const [isUploading, setIsUploading] = useState(false)
    const [currentPersona, setCurrentPersona] = useState<string | null>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const quickActions = [
        {
            title: "Flash Cards",
            description: "Generate interactive study cards",
            icon: Zap,
            prompt: "Create 5 flashcards for learning ",
            color: "from-yellow-500/20 to-orange-500/20",
            borderColor: "border-yellow-500/30",
            iconColor: "text-yellow-400"
        },
        {
            title: "Flow Charts",
            description: "Visualize complex processes",
            icon: GitBranch,
            prompt: "Create a flowchart for ",
            color: "from-blue-500/20 to-cyan-500/20",
            borderColor: "border-blue-500/30",
            iconColor: "text-blue-400"
        },
        {
            title: "Image Generation",
            description: "Summon visuals with AI",
            icon: ImageIcon,
            prompt: "Generate an image of ",
            color: "from-purple-500/20 to-pink-500/20",
            borderColor: "border-purple-500/30",
            iconColor: "text-purple-400"
        },
        {
            title: "Concept Mapping",
            description: "Analyze and connect ideas",
            icon: Layers,
            prompt: "Help me map out the concepts of ",
            color: "from-green-500/20 to-emerald-500/20",
            borderColor: "border-green-500/30",
            iconColor: "text-green-400"
        }
    ]

    const celebrities = [
        {
            name: "Elon Musk",
            description: "Technoking of Tesla, SpaceX Founder",
            persona: "Elon Musk - visionary, intense, engineering-focused, slightly chaotic, obsessed with Mars and X (Twitter).",
            color: "from-blue-600/20 to-gray-600/20",
            borderColor: "border-blue-500/30",
            icon: Zap
        },
        {
            name: "Steve Jobs",
            description: "Co-founder of Apple, Design Visionary",
            persona: "Steve Jobs - extreme focus on design, minimalist, perfectionist, 'insanely great' philosophy, demanding and uncompromising.",
            color: "from-gray-500/20 to-black/20",
            borderColor: "border-white/20",
            icon: Layers
        },
        {
            name: "Albert Einstein",
            description: "Theoretical Physicist, Physics Icon",
            persona: "Albert Einstein - curious, philosophical, humble, explains complex physics with thought experiments and simplicity.",
            color: "from-yellow-600/20 to-brown-600/20",
            borderColor: "border-yellow-500/30",
            icon: Bot
        },
        {
            name: "Leonardo da Vinci",
            description: "Renaissance Polymath, Artist & Inventor",
            persona: "Leonardo da Vinci - infinitely curious, observational, multidisciplinary genius, deeply analytical, artistic visionary, constantly experimenting and sketching, seeking to understand the mechanics of the world through art and engineering.",
            color: "from-orange-600/20 to-red-600/20",
            borderColor: "border-orange-500/30",
            icon: Brush
        },
        {
            name: "Oprah Winfrey",
            description: "Media Mogul, Philanthropist, Talk Show Host",
            persona: "Oprah Winfrey - empathetic, empowering, astute interviewer, master communicator, deeply connected to human experience, focused on personal growth, societal impact, and inspiring others to live their best lives.",
            color: "from-purple-600/20 to-pink-600/20",
            borderColor: "border-purple-500/30",
            icon: Brush
        },
        {
            name: "Nikola Tesla",
            description: "Visionary Inventor, Electrical Engineer",
            persona: "Nikola Tesla - brilliant, reclusive, eccentric, visionary, obsessed with alternating current, wireless technology, and futuristic energy systems, driven by a desire to power the world efficiently and freely, often ahead of his time.",
            color: "from-teal-600/20 to-cyan-600/20",
            borderColor: "border-teal-500/30",
            icon: Brush
        },

    ]
    useEffect(() => {
        fetchUser()
        loadHistory()
    }, [])

    useEffect(() => {
        if (currentChatId) {
            loadChatDetails(currentChatId)
        }
    }, [currentChatId])

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

    const loadHistory = async () => {
        try {
            const data = await getAIChats()
            if (data.success) {
                setChats(data.chats)
                if (data.chats.length > 0 && !currentChatId) {
                    setCurrentChatId(data.chats[0].id)
                } else if (data.chats.length === 0) {
                    handleNewChat()
                }
            }
        } catch (err) {
            console.error("Error loading chat history:", err)
        }
    }

    const loadChatDetails = async (id: string) => {
        setIsFetchingHistory(true)
        try {
            const data = await getAIChatDetails(id)
            if (data.success) {
                const formattedMessages = data.chat.messages.map((m: any) => ({
                    ...m,
                    timestamp: new Date(m.timestamp)
                }))
                setMessages(formattedMessages)
                setCurrentPersona(data.chat.persona || null)
            }
        } catch (err) {
            console.error("Error loading chat details:", err)
        } finally {
            setIsFetchingHistory(false)
        }
    }

    const handleNewChat = async () => {
        setIsLoading(true)
        try {
            const data = await createAIChat()
            if (data.success) {
                const newSession: ChatSession = {
                    id: data.chatId,
                    title: "New AI Chat",
                    updatedAt: new Date().toISOString()
                }
                setChats(prev => [newSession, ...prev])
                setCurrentChatId(data.chatId)
                setMessages([])
                setCurrentPersona(null)
            }
        } catch (err) {
            console.error("Error creating new chat:", err)
        } finally {
            setIsLoading(false)
        }
    }

    const handleDeleteChat = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation()
        if (!confirm('Are you sure you want to delete this chat session?')) return

        try {
            await deleteAIChat(id)
            setChats(prev => prev.filter(c => c.id !== id))
            if (currentChatId === id) {
                const remainingChats = chats.filter(c => c.id !== id)
                if (remainingChats.length > 0) {
                    setCurrentChatId(remainingChats[0].id)
                } else {
                    handleNewChat()
                }
            }
        } catch (err) {
            console.error('Failed to delete chat:', err)
        }
    }

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file || !file.name.endsWith('.pdf')) return

        setIsUploading(true)
        try {
            const data = await uploadPDF(file)
            if (data.success) {
                setAttachedFile({ name: file.name, text: data.text })
            }
        } catch (err) {
            console.error("PDF Upload Error:", err)
        } finally {
            setIsUploading(false)
            if (fileInputRef.current) fileInputRef.current.value = ''
        }
    }

    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault()
        if (!input.trim() || isLoading || !currentChatId) return

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
            let finalPrompt = userMessage.text
            if (attachedFile) {
                finalPrompt = `Context from PDF (${attachedFile.name}):\n\n${attachedFile.text}\n\nUser Question: ${userMessage.text}`
                setAttachedFile(null)
            }

            const data = await geminiChat(finalPrompt, currentChatId, currentPersona || undefined)
            if (data.success) {
                const aiMessage: Message = {
                    id: (Date.now() + 1).toString(),
                    text: data.reply,
                    sender: 'ai',
                    timestamp: new Date()
                }
                setMessages(prev => [...prev, aiMessage])
                // Update history title if it was a new chat
                if (messages.length === 0) {
                    setChats(prev => prev.map(c =>
                        c.id === currentChatId
                            ? { ...c, title: userMessage.text.substring(0, 30) + (userMessage.text.length > 30 ? "..." : "") }
                            : c
                    ))
                }
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

    return (
        <div className="flex h-screen bg-[#0a0a0b] text-white font-sans selection:bg-purple-500/30 overflow-hidden">
            {/* Ambient Background Effects */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]"></div>
            </div>

            {/* Sidebar */}
            <aside className="relative z-20 w-80 flex flex-col border-r border-white/5 bg-black/40 backdrop-blur-3xl shrink-0">
                <div className="p-6">
                    <button
                        onClick={() => router.push('/home')}
                        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 group"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-sm font-semibold uppercase tracking-wider">Dashboard</span>
                    </button>

                    <button
                        onClick={handleNewChat}
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-3 bg-gradient-to-tr from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 py-3 rounded-xl font-bold transition-all shadow-lg shadow-purple-900/20 active:scale-95 disabled:opacity-50"
                    >
                        <Plus className="w-5 h-5" />
                        New Chat
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-2">
                    <div className="flex items-center gap-2 px-3 mb-4 text-gray-500">
                        <History className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-widest">Recent Chats</span>
                    </div>
                    {chats.map((session) => (
                        <button
                            key={session.id}
                            onClick={() => setCurrentChatId(session.id)}
                            className={`w-full text-left px-4 py-3 rounded-xl transition-all group relative overflow-hidden ${currentChatId === session.id
                                ? 'bg-white/10 border border-white/10 text-white'
                                : 'hover:bg-white/5 text-gray-400 border border-transparent'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <MessageSquare className={`w-4 h-4 ${currentChatId === session.id ? 'text-purple-400' : 'text-gray-600'}`} />
                                <span className="text-sm font-medium truncate flex-1">{session.title}</span>
                                <button
                                    onClick={(e) => handleDeleteChat(e, session.id)}
                                    className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-all active:scale-95"
                                    title="Delete chat"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                            {currentChatId === session.id && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-purple-500 rounded-r-full"></div>
                            )}
                        </button>
                    ))}
                </div>

                <div className="p-6 border-t border-white/5 mt-auto">
                    <div className="flex items-center gap-4 bg-white/5 p-3 rounded-2xl border border-white/5">
                        <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/10 bg-white/5 shrink-0">
                            {user?.profile_picture ? (
                                <img src={user.profile_picture} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-800">
                                    <User className="w-5 h-5 text-gray-400" />
                                </div>
                            )}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-bold truncate">{user?.username || 'User'}</p>
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black">Pro Access</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col relative z-10">
                {/* Header */}
                <header className="h-20 border-b border-white/5 bg-black/20 backdrop-blur-xl flex items-center justify-between px-8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-tr from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                            <Bot className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="font-bold text-lg leading-tight">
                                {currentPersona ? currentPersona.split(' - ')[0] : 'Aether AI'}
                            </h1>
                            <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                <span className="text-xs text-green-500 font-medium uppercase tracking-wider">
                                    {currentPersona ? 'Simulation Active' : 'Active'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex flex-col items-end mr-2">
                            <div className="flex items-center gap-2 text-xs font-bold text-gray-500 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                                <Sparkles className="w-3 h-3 text-purple-400" />
                                <span>Powered by Gemini 1.5 Pro</span>
                            </div>
                        </div>
                        <div className="w-px h-6 bg-white/10"></div>
                        <button className="p-2 rounded-xl hover:bg-white/5 transition-colors text-gray-400 hover:text-white">
                            <Info className="w-5 h-5" />
                        </button>
                    </div>
                </header>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto px-4 py-8 md:px-8 space-y-6">
                    <div className="max-w-4xl mx-auto space-y-8">
                        {isFetchingHistory ? (
                            <div className="flex flex-col items-center justify-center h-full py-20 gap-4">
                                <Loader2 className="w-12 h-12 text-purple-600 animate-spin" />
                                <p className="text-gray-500 animate-pulse uppercase tracking-[0.2em] text-xs font-bold">Resurrecting conversation...</p>
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center space-y-12">
                                <div className="space-y-4 max-w-2xl px-4">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-[10px] text-purple-400 uppercase tracking-[0.3em] font-bold animate-pulse">
                                        <Sparkles className="w-3 h-3" />
                                        Protocol Active
                                    </div>
                                    <h2 className="text-4xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/20 tracking-tight leading-tight">
                                        How can I assist <br /> your journey today?
                                    </h2>
                                    <p className="text-gray-500 text-sm md:text-base max-w-lg mx-auto leading-relaxed">
                                        Enter a prompt or choose a specialized protocol below to begin your interaction with the Aether Core.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-5xl px-4">
                                    {quickActions.map((action, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setInput(action.prompt)}
                                            className={`group relative flex flex-col items-start p-6 bg-gradient-to-br ${action.color} border ${action.borderColor} rounded-[28px] text-left transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/10 hover:border-white/20 overflow-hidden`}
                                        >
                                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                                <action.icon className="w-24 h-24" />
                                            </div>
                                            <div className={`p-3 rounded-2xl bg-black/40 mb-4 ${action.iconColor || 'text-purple-400'}`}>
                                                <action.icon className="w-6 h-6" />
                                            </div>
                                            <h3 className="text font-bold text-white mb-1">{action.title}</h3>
                                            <p className="text-xs text-gray-400 leading-relaxed font-medium">
                                                {action.description}
                                            </p>
                                        </button>
                                    ))}
                                </div>

                                <div className="space-y-6 w-full max-w-5xl px-4">
                                    <div className="flex items-center gap-3 px-2">
                                        <div className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-[9px] text-gray-400 uppercase tracking-[0.2em] font-black">
                                            Neural Signatures
                                        </div>
                                        <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent"></div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        {celebrities.map((celeb, i) => (
                                            <button
                                                key={i}
                                                onClick={() => {
                                                    setCurrentPersona(celeb.persona)
                                                    setInput(`Hello ${celeb.name}, I'd like to chat.`)
                                                }}
                                                className={`group relative flex items-center gap-4 p-4 bg-gradient-to-br ${celeb.color} border ${celeb.borderColor} rounded-2xl text-left transition-all duration-300 hover:scale-[1.02] active:scale-95 ${currentPersona === celeb.persona ? 'ring-2 ring-purple-500 border-purple-500/50' : ''}`}
                                            >
                                                <div className="w-12 h-12 rounded-xl bg-black/40 flex items-center justify-center border border-white/5 shrink-0">
                                                    <celeb.icon className="w-6 h-6 text-white/70" />
                                                </div>
                                                <div className="min-w-0">
                                                    <h3 className="text-sm font-bold text-white truncate">{celeb.name}</h3>
                                                    <p className="text-[10px] text-gray-500 font-medium truncate">{celeb.description}</p>
                                                </div>
                                                {currentPersona === celeb.persona && (
                                                    <div className="absolute top-2 right-2">
                                                        <Check className="w-3 h-3 text-purple-400" />
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} group animate-in fade-in slide-in-from-bottom-2 duration-500`}
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
                                            <div className={`relative px-4 py-3 rounded-2xl text-[14px] leading-relaxed shadow-lg ${msg.sender === 'ai' ? 'w-full' : ''} ${msg.sender === 'user'
                                                ? 'bg-purple-600 text-white rounded-tr-none shadow-purple-900/20'
                                                : 'bg-[#16161e] border border-white/5 text-gray-200 rounded-tl-none backdrop-blur-sm'
                                                }`}>
                                                {msg.sender === 'ai' ? (
                                                    <ReactMarkdown
                                                        remarkPlugins={[remarkGfm]}
                                                        components={{
                                                            p: ({ children, ...props }: any) => {
                                                                const childrenArray = React.Children.toArray(children)
                                                                const hasBlock = childrenArray.some((child: any) => {
                                                                    const isImage = child?.type === 'img' || (child?.props && child.props.src)
                                                                    const isCustomBlock = child?.type?.name === 'Mermaid' ||
                                                                        (child?.props && (child.props.chart || child.props.front))
                                                                    const isContainer = child?.props && child.props.className && child.props.className.includes('group/img')
                                                                    return isImage || isCustomBlock || isContainer
                                                                })

                                                                if (hasBlock) return <div className="space-y-4 mb-4">{children}</div>
                                                                return <p className="mb-2 last:mb-0" {...props}>{children}</p>
                                                            },
                                                            h1: ({ ...props }) => <h1 className="text-xl font-bold mb-4 text-purple-400" {...props} />,
                                                            h2: ({ ...props }) => <h2 className="text-lg font-bold mb-3 text-purple-300" {...props} />,
                                                            h3: ({ ...props }) => <h3 className="text-md font-bold mb-2 text-purple-200" {...props} />,
                                                            ul: ({ ...props }) => <ul className="list-disc pl-5 mb-3 space-y-1" {...props} />,
                                                            ol: ({ ...props }) => <ol className="list-decimal pl-5 mb-3 space-y-1" {...props} />,
                                                            li: ({ ...props }) => <li className="marker:text-purple-500" {...props} />,
                                                            table: ({ ...props }) => <div className="overflow-x-auto my-4"><table className="w-full border-collapse border border-white/10 text-sm" {...props} /></div>,
                                                            th: ({ ...props }) => <th className="border border-white/10 bg-white/5 px-3 py-2 text-left font-bold" {...props} />,
                                                            td: ({ ...props }) => <td className="border border-white/10 px-3 py-2" {...props} />,
                                                            code: ({ inline, className, children, ...props }: any) => {
                                                                const match = /language-(\w+)/.exec(className || '')
                                                                const codeStr = String(children).replace(/\n$/, '')

                                                                if (match?.[1] === 'mermaid') {
                                                                    return <Mermaid chart={codeStr} />
                                                                }

                                                                if (match?.[1] === 'flashcards') {
                                                                    try {
                                                                        const cards = JSON.parse(codeStr)
                                                                        return <FlashcardCarousel cards={cards} />
                                                                    } catch (e) {
                                                                        return <pre className="bg-red-500/10 p-4 rounded text-xs">Error parsing flashcards</pre>
                                                                    }
                                                                }

                                                                return (
                                                                    <code className="bg-white/10 px-1.5 py-0.5 rounded text-purple-300 font-mono text-xs" {...props}>
                                                                        {children}
                                                                    </code>
                                                                )
                                                            },
                                                            img: ({ node, ...props }: any) => (
                                                                <div className="my-6 group/img relative w-full max-w-[500px] mx-auto">
                                                                    <div className="absolute -inset-4 bg-purple-500/10 blur-3xl opacity-0 group-hover/img:opacity-100 transition-opacity duration-500" />
                                                                    <div className="relative overflow-hidden rounded-2xl border border-white/10 shadow-xl bg-[#0a0a0f]">
                                                                        <img
                                                                            {...props}
                                                                            className="w-full h-auto transition-transform duration-700 group-hover/img:scale-105"
                                                                            loading="lazy"
                                                                            onError={(e) => {
                                                                                const target = e.target as HTMLImageElement;
                                                                                if (!target.src.includes('placehold.co')) {
                                                                                    target.src = `https://placehold.co/1024x1024/1a1a2e/ffffff?text=Generation+In+Progress...`
                                                                                }
                                                                            }}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            ),
                                                            hr: () => <hr className="my-6 border-white/5" />
                                                        }}
                                                    >
                                                        {msg.text}
                                                    </ReactMarkdown>
                                                ) : (
                                                    msg.text
                                                )}
                                                {msg.sender === 'ai' && (
                                                    <button
                                                        onClick={() => copyToClipboard(msg.text, msg.id)}
                                                        className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/40 text-gray-400 opacity-0 group-hover:opacity-100 transition-all hover:text-white"
                                                    >
                                                        {copiedId === msg.id ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                                                    </button>
                                                )}
                                            </div>
                                            <p className={`text-[9px] text-gray-600 font-black uppercase tracking-widest ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                                                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}

                        {isTyping && (
                            <div className="flex justify-start animate-in fade-in slide-in-from-bottom-1">
                                <div className="flex gap-4 items-center">
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-blue-600 flex items-center justify-center shadow-lg animate-pulse">
                                        <Sparkles className="w-4 h-4 text-white" />
                                    </div>
                                    <div className="bg-white/5 border border-white/5 px-4 py-3 rounded-2xl rounded-tl-none backdrop-blur-sm flex gap-1.5 items-center">
                                        <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {/* Input Area */}
                <div className="relative z-20 border-t border-white/5 bg-black/40 backdrop-blur-3xl p-6">
                    <div className="max-w-4xl mx-auto">
                        <form
                            onSubmit={handleSendMessage}
                            className="relative flex flex-col gap-2 bg-white/5 border border-white/10 rounded-[24px] p-2 pr-4 focus-within:border-purple-500/50 transition-all shadow-2xl group"
                        >
                            {attachedFile && (
                                <div className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-xl mx-2 mt-2">
                                    <FileText className="w-4 h-4 text-purple-400" />
                                    <span className="text-xs text-purple-200 truncate flex-1">{attachedFile.name}</span>
                                    <button
                                        type="button"
                                        onClick={() => setAttachedFile(null)}
                                        className="p-1 hover:bg-white/10 rounded-full transition-colors"
                                    >
                                        <X className="w-3 h-3 text-purple-400" />
                                    </button>
                                </div>
                            )}
                            <div className="flex items-center gap-3">
                                <div className="flex-1 flex items-center px-4">
                                    <input
                                        type="text"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        placeholder="Summon Aether AI..."
                                        className="w-full bg-transparent border-none outline-none py-3 text-sm placeholder:text-gray-500 text-gray-200"
                                    />
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileUpload}
                                    accept=".pdf"
                                    className="hidden"
                                />
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isLoading || isUploading}
                                    className="p-2.5 rounded-xl hover:bg-white/10 text-gray-400 transition-all active:scale-95"
                                >
                                    {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Paperclip className="w-5 h-5" />}
                                </button>
                                <button
                                    type="submit"
                                    disabled={!input.trim() || isLoading || !currentChatId}
                                    className={`p-3 rounded-xl flex items-center justify-center transition-all ${input.trim() && !isLoading && currentChatId
                                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 hover:scale-110 active:scale-95'
                                        : 'bg-white/5 text-gray-600 cursor-not-allowed'
                                        }`}
                                >
                                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                                </button>
                            </div>
                        </form>
                        <p className="text-[9px] text-center text-gray-700 mt-4 uppercase tracking-[0.3em] font-black">
                            Aether Core • Protocol V1.5.0 • Powered by Google Gemini
                        </p>
                    </div>
                </div>
            </main>
        </div>
    )
}
