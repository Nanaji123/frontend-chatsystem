'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { getMe, logoutUser as logoutApi } from '@/backend/login'

interface User {
    _id?: string;
    id?: string;
    uid?: string;
    username: string;
    email: string;
    profile_picture?: string;
    isOnline?: boolean;
    lastSeen?: string;
    createdAt?: string;
    updatedAt?: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (userData: User, token: string) => void;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()
    const pathname = usePathname()
    const isFirstMount = useRef(true)

    // Use a ref to store the latest pathname for redirect logic without triggering refreshUser recreation
    const pathnameRef = useRef(pathname)
    useEffect(() => {
        pathnameRef.current = pathname
    }, [pathname])

    const refreshUser = useCallback(async (isInitialLoad = false) => {
        try {
            if (isInitialLoad) setLoading(true)
            const data = await getMe()
            if (data.success) {
                setUser(data.user)
            } else {
                setUser(null)
                const publicPages = ['/', '/register', '/forgot-password']
                if (!publicPages.includes(pathnameRef.current)) {
                    router.push('/')
                }
            }
        } catch (error) {
            console.error('Auth check failed:', error)
            setUser(null)
        } finally {
            if (isInitialLoad) setLoading(false)
        }
    }, [router]) // pathname is now handled via ref

    useEffect(() => {
        if (isFirstMount.current) {
            refreshUser(true)
            isFirstMount.current = false
        }
    }, [refreshUser])

    const login = useCallback((userData: User, token: string) => {
        console.log("AuthContext: login called for", userData.username)
        localStorage.setItem('token', token)
        setUser(userData)
        router.push('/home')
    }, [router])

    const logout = useCallback(async () => {
        try {
            await logoutApi()
        } catch (err) {
            console.error('Logout API failure:', err)
        } finally {
            localStorage.removeItem('token')
            setUser(null)
            router.push('/')
        }
    }, [router])

    const contextValue = React.useMemo(() => ({
        user,
        loading,
        login,
        logout,
        refreshUser
    }), [user, loading, login, logout, refreshUser])

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
