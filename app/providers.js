'use client'
import { NeonAuthUIProvider } from '@neondatabase/auth/react'
import { authClient } from '@/lib/auth-client'

export function Providers({ children }) {
  return (
    <NeonAuthUIProvider authClient={authClient} redirectTo="/profile">
      {children}
    </NeonAuthUIProvider>
  )
}
