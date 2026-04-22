import { createNeonAuth } from '@neondatabase/auth/next/server'

const fallbackSecret = '0123456789abcdef0123456789abcdef'

export const auth = createNeonAuth({
  baseUrl: process.env.NEON_AUTH_BASE_URL || 'https://example.invalid',
  cookies: {
    secret: process.env.NEON_AUTH_COOKIE_SECRET || fallbackSecret,
  },
})
