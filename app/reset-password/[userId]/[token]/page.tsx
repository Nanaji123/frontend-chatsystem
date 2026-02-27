'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Loader2, Lock, CheckCircle2, AlertCircle } from 'lucide-react'
import { resetPassword } from '@/backend/login'

export default function ResetPasswordPage() {
    const params = useParams()
    const router = useRouter()
    const [formData, setFormData] = useState({
        newPassword: '',
        confirmPassword: ''
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (formData.newPassword !== formData.confirmPassword) {
            setError('Passwords do not match')
            return
        }

        setLoading(true)
        setError(null)
        setSuccess(false)

        try {
            const data = await resetPassword(
                params.userId as string,
                params.token as string,
                formData.newPassword
            )

            if (data.success) {
                setSuccess(true)
                setTimeout(() => router.push('/'), 3000)
            } else {
                setError(data.message || 'Reset failed')
            }
        } catch (err) {
            setError('An error occurred. Please try again.')
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
                        <h1 className='text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400'>Reset Password</h1>
                        <p className='text-gray-400 mt-2 text-sm text-center'>Enter your new password below</p>
                    </div>

                    <form onSubmit={handleSubmit} className='space-y-5'>
                        <div className='space-y-2'>
                            <label className='text-sm font-medium text-gray-300 ml-1'>New Password</label>
                            <div className='relative group'>
                                <Lock className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-blue-400 transition-colors' />
                                <input
                                    type="password"
                                    placeholder='••••••••'
                                    required
                                    className='w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-gray-600'
                                    value={formData.newPassword}
                                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className='space-y-2'>
                            <label className='text-sm font-medium text-gray-300 ml-1'>Confirm Password</label>
                            <div className='relative group'>
                                <Lock className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-blue-400 transition-colors' />
                                <input
                                    type="password"
                                    placeholder='••••••••'
                                    required
                                    className='w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-gray-600'
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                />
                            </div>
                        </div>

                        {error && (
                            <div className='flex items-center gap-2 text-red-400 bg-red-400/10 p-3 rounded-lg border border-red-400/20 text-sm animate-in fade-in zoom-in-95'>
                                <AlertCircle className='w-4 h-4 shrink-0' />
                                <span>{error}</span>
                            </div>
                        )}

                        {success && (
                            <div className='flex items-center gap-2 text-green-400 bg-green-400/10 p-3 rounded-lg border border-green-400/20 text-sm animate-in fade-in zoom-in-95'>
                                <CheckCircle2 className='w-4 h-4 shrink-0' />
                                <span>Password reset successful! Redirecting to login...</span>
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
                                    <span>Updating...</span>
                                </div>
                            ) : (
                                'Update Password'
                            )}
                        </Button>
                    </form>

                    <Button
                        variant="ghost"
                        onClick={() => router.push('/')}
                        className='w-full mt-4 text-gray-400 hover:text-white'
                    >
                        Back to Login
                    </Button>
                </div>
            </div>
        </div>
    )
}
