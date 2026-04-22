'use client'
import Link from 'next/link'
import { AuthView } from '@neondatabase/auth/react'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#fdf6f9] flex flex-col items-center justify-center px-6">
      <div className="mb-8 text-center">
        <div className="w-16 h-16 bg-[#FBEAF0] rounded-2xl flex items-center justify-center mx-auto mb-3">
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <path d="M18 4C12 4 7 8.5 7 14c0 3 1.5 5.5 4 7.5V28l7-3 7 3v-6.5c2.5-2 4-4.5 4-7.5C29 8.5 24 4 18 4z" fill="#D4537E" opacity="0.2"/>
            <path d="M18 6C12.5 6 9 10 9 14c0 2.5 1.2 5 3.5 6.8V27l5.5-2.5L23.5 27v-6.2C25.8 19 27 16.5 27 14c0-4-3.5-8-9-8z" stroke="#D4537E" strokeWidth="1.5" fill="none"/>
            <circle cx="15" cy="13" r="2" fill="#D4537E"/>
            <circle cx="21" cy="13" r="2" fill="#D4537E"/>
            <path d="M14 18c1 1.5 7 1.5 8 0" stroke="#D4537E" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
        <h1 className="font-display text-2xl font-semibold text-[#2C1A23]">Beauty Book</h1>
        <p className="text-[#7a5a67] text-sm mt-1">Sign in with your Neon Auth account</p>
      </div>

      <div className="w-full max-w-sm bg-white rounded-3xl border border-[#F4C0D1] p-6">
        <AuthView path="sign-in" />

        <div className="mt-5 text-center text-sm text-[#7a5a67]">
          Don't have an account?{' '}
          <Link href="/register" className="text-[#D4537E] font-medium hover:underline">
            Register
          </Link>
        </div>

        <div className="mt-4 pt-4 border-t border-[#F4C0D1] text-center">
          <Link href="/" className="text-sm text-[#D4537E] font-medium hover:underline">
            Continue as Guest
          </Link>
        </div>
      </div>
    </div>
  )
}
