'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { verifyEmail } from '@/backend/login'
import { Button } from '@/components/ui/button'

export default function VerifyPage() {
    const params = useParams()
    const router = useRouter()
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
    const [message, setMessage] = useState('Verifying your email...')

    useEffect(() => {
        const handleVerify = async () => {
            if (!params.userId || !params.token) {
                setStatus('error')
                setMessage('Invalid verification link.')
                return
            }

            try {
                const data = await verifyEmail(params.userId as string, params.token as string)
                if (data.success) {
                    setStatus('success')
                    setMessage(data.message || 'Email verified successfully!')
                } else {
                    setStatus('error')
                    setMessage(data.message || 'Verification failed.')
                }
            } catch (error) {
                setStatus('error')
                setMessage('An error occurred during verification.')
            }
        }

        handleVerify()
    }, [params])

    return (
        <div className='min-h-screen flex items-center justify-center bg-[#0a0a0b] text-white p-4 relative overflow-hidden'>
            <div className='absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]'></div>
            <div className='absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px]'></div>

            <div className='w-full max-w-md z-10 animate-in fade-in zoom-in duration-500'>
                <div className='bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl text-center'>
                    <div className='flex justify-center mb-6'>
                        {status === 'loading' && <Loader2 className='w-16 h-16 text-blue-500 animate-spin' />}
                        {status === 'success' && <CheckCircle2 className='w-16 h-16 text-green-500' />}
                        {status === 'error' && <XCircle className='w-16 h-16 text-red-500' />}
                    </div>

                    <h1 className='text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400'>
                        {status === 'loading' ? 'Verifying...' : status === 'success' ? 'Verified!' : 'Verification Failed'}
                    </h1>

                    <p className='text-gray-400 mb-8'>{message}</p>

                    {(status === 'success' || status === 'error') && (
                        <Button
                            onClick={() => router.push('/')}
                            className='w-full py-6 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold text-lg'
                        >
                            Go to Login
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )
}
