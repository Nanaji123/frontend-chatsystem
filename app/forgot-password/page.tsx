'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Loader2, Mail, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react'
import { forgetPassword } from '@/backend/login'

export default function ForgotPasswordPage() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setSuccess(null)

        try {
            const data = await forgetPassword(email)
            if (data.success) {
                setSuccess(data.message || 'Reset email sent!')
                // Instructions for the user: if the response has a userId, we might want to store it 
                // for the next step, but usually the user will follow a link in their email.
                // For the "code" based flow the user requested previously, they can go to /reset-password
            } else {
                setError(data.message || 'Action failed')
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className='min-h-screen flex items-center justify-center bg-[#0a0a0b] text-white p-4 relative overflow-hidden'>
            <div className='absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px]'></div>
            <div className='absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px]'></div>

            <div className='w-full max-w-md z-10 animate-in fade-in slide-in-from-bottom-4 duration-1000'>
                <div className='bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl relative'>

                    <div className='flex flex-col items-center mb-8'>
                        <div className='w-16 h-16 bg-gradient-to-tr from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/20'>
                            <Mail className='w-8 h-8 text-white' />
                        </div>
                        <h1 className='text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400'>
                            Forgot Password
                        </h1>
                        <p className='text-gray-400 mt-2 text-sm text-center'>
                            Enter your email to receive a reset link
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
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
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
                            {loading ? <Loader2 className='w-5 h-5 animate-spin' /> : 'Send Reset Link'}
                        </Button>
                    </form>

                    <button
                        onClick={() => router.push('/')}
                        className='mt-6 flex items-center justify-center gap-2 text-gray-400 hover:text-white transition-colors w-full text-sm'
                    >
                        <ArrowLeft className='w-4 h-4' />
                        Back to Login
                    </button>
                </div>
            </div>
        </div>
    )
}
