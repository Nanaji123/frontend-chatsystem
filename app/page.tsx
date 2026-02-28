'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Loader2, Lock, Mail, CheckCircle2, AlertCircle } from 'lucide-react'
import { loginUser, getMe } from '@/backend/login'

export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    // Check if user is already logged in via getMe
    const checkLogin = async () => {
      try {
        const data = await getMe()
        if (data.success) {
          router.push('/home')
        }
      } catch (err) {
        // Not logged in, stay on login page
      }
    }
    checkLogin()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const data = await loginUser({ email: formData.email, password: formData.password })
      console.log("Full Login Response:", JSON.stringify(data, null, 2))

      if (data && data.success) {
        // We capture the token for the socket handshake (middleware expects it in auth.token)
        const token = data.token || data.accessToken || data.jwt || (data.data && (data.data.token || data.data.accessToken));
        if (token) {
          localStorage.setItem('token', token)
        }
        setSuccess('Login successful! Redirecting...')
        setTimeout(() => {
          router.push('/home')
        }, 1000)
      } else {
        setError(data?.message || 'Invalid email or password.')
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-[#0a0a0b] text-white p-4 relative overflow-hidden'>
      {/* Background Orbs */}
      <div className='absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px]'></div>
      <div className='absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px]'></div>

      <div className='w-full max-w-md z-10 animate-in fade-in slide-in-from-bottom-4 duration-1000'>
        <div className='bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl relative'>

          <div className='flex flex-col items-center mb-8'>
            <div className='w-16 h-16 bg-gradient-to-tr from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/20'>
              <Lock className='w-8 h-8 text-white' />
            </div>
            <h1 className='text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400'>
              Welcome Back
            </h1>
            <p className='text-gray-400 mt-2 text-sm text-center'>
              Enter your credentials to access your account
            </p>
          </div>

          <form onSubmit={handleSubmit} className='space-y-5'>
            <div className='space-y-2'>
              <label className='text-sm font-medium text-gray-300 ml-1'>Email Address</label>
              <div className='relative group'>
                <Mail className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-blue-400 transition-colors' />
                <input
                  type="email"
                  placeholder='hello@example.com'
                  required
                  className='w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-gray-600 text-sm'
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className='space-y-2'>
              <div className='flex justify-between items-center ml-1'>
                <label className='text-sm font-medium text-gray-300'>Password</label>
                <button
                  type="button"
                  onClick={() => router.push('/forgot-password')}
                  className='text-xs text-blue-400 hover:text-blue-300 transition-colors'
                >
                  Forgot Password?
                </button>
              </div>
              <div className='relative group'>
                <Lock className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-blue-400 transition-colors' />
                <input
                  type="password"
                  placeholder='••••••••'
                  required
                  className='w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-gray-600 text-sm'
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>

            {error && (
              <div className='flex items-center gap-2 text-red-400 bg-red-400/10 p-3 rounded-xl border border-red-400/20 text-sm animate-in fade-in zoom-in-95'>
                <AlertCircle className='w-4 h-4 shrink-0' />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className='flex items-center gap-2 text-green-400 bg-green-400/10 p-3 rounded-xl border border-green-400/20 text-sm animate-in fade-in zoom-in-95'>
                <CheckCircle2 className='w-4 h-4 shrink-0' />
                <span>{success}</span>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className='w-full py-6 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold text-lg shadow-xl shadow-blue-600/20 transform active:scale-[0.98] transition-all disabled:opacity-70'
            >
              {loading ? (
                <div className='flex items-center gap-2'>
                  <Loader2 className='w-5 h-5 animate-spin' />
                  <span>Signing in...</span>
                </div>
              ) : 'Sign In'}
            </Button>
          </form>

          <div className='mt-8 pt-6 border-t border-white/10 text-center'>
            <p className='text-gray-400 text-sm'>
              Don't have an account?
              <button
                onClick={() => router.push('/register')}
                className='ml-2 text-white font-semibold hover:underline decoration-blue-500 underline-offset-4 transition-all'
              >
                Join now
              </button>
            </p>
          </div>
        </div>

        <p className='text-center mt-8 text-gray-500 text-xs'>
          © 2026 Premium Web App. All rights reserved.
        </p>
      </div>
    </div>
  )
}
