'use client'

import React, { useEffect, useState, useRef } from "react"
import io from "socket.io-client"
import { Send, X, MessageSquare, User, Smile } from "lucide-react"
import { Button } from "./ui/button"

const socket = io("http://localhost:3000", {
    autoConnect: false // Connect only when needed
})

interface Message {
    id: string
    text: string
    sender: 'me' | 'other'
    timestamp: Date
}

export default function Chat({ onClose }: { onClose: () => void }) {
    const [message, setMessage] = useState("")
    const [chat, setChat] = useState<Message[]>([])
    const scrollRef = useRef<HTMLDivElement>(null)
    const lastSentMessageRef = useRef<string | null>(null)

    useEffect(() => {
        socket.connect()

        socket.on("receive_message", (data: string) => {
            // Check if this is the message we just sent
            const isMe = data === lastSentMessageRef.current

            const newMessage: Message = {
                id: Math.random().toString(36).substr(2, 9),
                text: data,
                sender: isMe ? 'me' : 'other',
                timestamp: new Date()
            }

            setChat((prev) => [...prev, newMessage])

            // Clear the ref if we matched it
            if (isMe) {
                lastSentMessageRef.current = null
            }
        })

        return () => {
            socket.off("receive_message")
            socket.disconnect()
        }
    }, [])

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [chat])

    const sendMessage = (e?: React.FormEvent) => {
        if (e) e.preventDefault()
        if (message.trim() === "") return

        // Store the message being sent to identify it in the broadcast
        lastSentMessageRef.current = message

        socket.emit("send_message", message)
        setMessage("")
    }

    return (
        <div
            className="flex flex-col h-[500px] w-[380px] bg-[#121214] border border-white/10 rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
        >
            {/* Header */}
            <div className="p-6 bg-white/5 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-400">
                        <MessageSquare className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm">Community Chat</h3>
                        <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                            <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Live Support</span>
                        </div>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 rounded-full hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Messages Area */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-white/10"
            >
                {chat.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                        <div className="w-12 h-12 border-2 border-dashed border-white/20 rounded-2xl flex items-center justify-center mb-3">
                            <MessageSquare className="w-6 h-6" />
                        </div>
                        <p className="text-xs">No messages yet.<br />Start the conversation!</p>
                    </div>
                ) : (
                    chat.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex flex-col ${msg.sender === 'me' ? 'items-end' : 'items-start'}`}
                        >
                            <div className={`max-w-[80%] p-4 rounded-2xl text-sm ${msg.sender === 'me'
                                ? 'bg-blue-600 text-white rounded-tr-none'
                                : 'bg-white/5 border border-white/10 text-gray-300 rounded-tl-none'
                                }`}>
                                {msg.text}
                            </div>
                            <span className="text-[10px] text-gray-600 mt-1 px-1">
                                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    ))
                )}
            </div>

            {/* Input Area */}
            <form
                onSubmit={sendMessage}
                className="p-4 bg-white/5 border-t border-white/10"
            >
                <div className="relative group">
                    <input
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type something..."
                        className="w-full bg-black/20 border border-white/10 rounded-2xl py-3.5 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm placeholder:text-gray-600"
                    />
                    <button
                        type="submit"
                        disabled={!message.trim()}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center hover:bg-blue-700 transition-all disabled:opacity-50 disabled:grayscale"
                    >
                        <Send className="w-4 h-4 text-white" />
                    </button>
                </div>
                <div className="flex items-center justify-between mt-3 px-1">
                    <div className="flex gap-2">
                        <button type="button" className="text-gray-500 hover:text-white transition-colors">
                            <Smile className="w-4 h-4" />
                        </button>
                        <button type="button" className="text-gray-500 hover:text-white transition-colors">
                            <User className="w-4 h-4" />
                        </button>
                    </div>
                    <span className="text-[10px] text-gray-600">Press Enter to send</span>
                </div>
            </form>
        </div>
    )
}
