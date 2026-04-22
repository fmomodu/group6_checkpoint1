'use client'

import { createAuthClient } from '@neondatabase/auth/next'

export const authClient = createAuthClient()

export function useSession() {
  const session = authClient.useSession()

  return {
    data: session.data,
    status: session.isPending || session.isRefetching
      ? 'loading'
      : session.data
        ? 'authenticated'
        : 'unauthenticated',
    error: session.error,
    update: session.refetch,
  }
}

export async function signOut(options = {}) {
  const result = await authClient.signOut()

  if (typeof window !== 'undefined' && options.callbackUrl) {
    window.location.assign(options.callbackUrl)
  }

  return result
}
