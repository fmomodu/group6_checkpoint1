'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { authClient } from '@/lib/auth-client'

const ACCOUNT_TYPES = [
  { value: 'CUSTOMER', label: 'Customer', description: 'Find, save, and review beauty professionals.' },
  { value: 'PROFESSIONAL', label: 'Professional', description: 'Create a beauty business profile and receive customers.' },
]

export default function RegisterPage() {
  const router = useRouter()
  const [role, setRole] = useState('CUSTOMER')
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    city: '',
    state: '',
    businessName: '',
    bio: '',
    services: '',
    priceMin: '',
    priceMax: '',
    instagram: '',
    website: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function updateField(key, value) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  async function waitForSession(maxAttempts = 10) {
    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      const sessionResult = await authClient.getSession({
        query: { disableCookieCache: true, disableRefresh: true },
      })

      if (sessionResult.data?.user?.id) return true

      await new Promise(resolve => setTimeout(resolve, 250))
    }

    return false
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!form.name || !form.email || !form.password || !form.phone || !form.city || !form.state) {
      setError('Please complete all required fields.')
      return
    }

    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    if (role === 'PROFESSIONAL' && (!form.businessName || !form.bio || !form.services || !form.priceMin || !form.priceMax)) {
      setError('Please complete the professional profile fields.')
      return
    }

    setLoading(true)

    try {
      const signUpResult = await authClient.signUp.email({
        name: form.name,
        email: form.email,
        password: form.password,
      })

      if (signUpResult.error) {
        setError(signUpResult.error.message || 'Unable to create your account.')
        setLoading(false)
        return
      }

      const signInResult = await authClient.signIn.email({
        email: form.email,
        password: form.password,
      })

      if (signInResult.error) {
        setError(signInResult.error.message || 'Your account was created, but sign-in did not complete.')
        setLoading(false)
        return
      }

      const hasSession = await waitForSession()
      if (!hasSession) {
        setError('Your account was created, but the session was not ready yet. Please try signing in once.')
        setLoading(false)
        return
      }

      const profileRes = await fetch('/api/account/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role,
          phone: form.phone,
          city: form.city,
          state: form.state,
          businessName: form.businessName,
          bio: form.bio,
          services: form.services,
          priceMin: form.priceMin,
          priceMax: form.priceMax,
          instagram: form.instagram,
          website: form.website,
        }),
      })

      const profileData = await profileRes.json()

      if (!profileRes.ok) {
        setError(profileData.error || 'Your account was created, but profile setup failed.')
        setLoading(false)
        return
      }

      router.push(role === 'PROFESSIONAL' ? '/profile' : '/search')
      router.refresh()
    } catch {
      setError('Something went wrong while creating your account.')
      setLoading(false)
      return
    }

    setLoading(false)
  }

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
        <h1 className="font-display text-2xl font-semibold text-[#2C1A23]">Create Account</h1>
        <p className="text-[#7a5a67] text-sm mt-1">Create an account with Neon Auth</p>
      </div>

      <div className="w-full max-w-xl bg-white rounded-3xl border border-[#F4C0D1] p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <p className="text-xs font-medium text-[#7a5a67] uppercase tracking-wider mb-2">Account Type</p>
            <div className="grid sm:grid-cols-2 gap-2">
              {ACCOUNT_TYPES.map(option => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setRole(option.value)}
                  className={`rounded-2xl border p-4 text-left transition-colors ${
                    role === option.value
                      ? 'border-[#D4537E] bg-[#fdf6f9] text-[#2C1A23]'
                      : 'border-[#F4C0D1] bg-white text-[#2C1A23]'
                  }`}
                >
                  <div className="font-semibold text-[#2C1A23]">{option.label}</div>
                  <div className="text-xs text-[#7a5a67] mt-1">{option.description}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-xs font-medium text-[#7a5a67] uppercase tracking-wider">Full Name</span>
              <input
                value={form.name}
                onChange={e => updateField('name', e.target.value)}
                className="w-full mt-1.5 px-4 py-3 bg-[#fdf6f9] border border-[#F4C0D1] rounded-xl text-sm text-[#2C1A23] placeholder:text-[#9b7c89] outline-none focus:border-[#D4537E] transition-colors"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-[#7a5a67] uppercase tracking-wider">Email</span>
              <input
                type="email"
                value={form.email}
                onChange={e => updateField('email', e.target.value)}
                className="w-full mt-1.5 px-4 py-3 bg-[#fdf6f9] border border-[#F4C0D1] rounded-xl text-sm text-[#2C1A23] placeholder:text-[#9b7c89] outline-none focus:border-[#D4537E] transition-colors"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-[#7a5a67] uppercase tracking-wider">Password</span>
              <input
                type="password"
                value={form.password}
                onChange={e => updateField('password', e.target.value)}
                className="w-full mt-1.5 px-4 py-3 bg-[#fdf6f9] border border-[#F4C0D1] rounded-xl text-sm text-[#2C1A23] placeholder:text-[#9b7c89] outline-none focus:border-[#D4537E] transition-colors"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-[#7a5a67] uppercase tracking-wider">Phone</span>
              <input
                value={form.phone}
                onChange={e => updateField('phone', e.target.value)}
                className="w-full mt-1.5 px-4 py-3 bg-[#fdf6f9] border border-[#F4C0D1] rounded-xl text-sm text-[#2C1A23] placeholder:text-[#9b7c89] outline-none focus:border-[#D4537E] transition-colors"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-[#7a5a67] uppercase tracking-wider">City</span>
              <input
                value={form.city}
                onChange={e => updateField('city', e.target.value)}
                className="w-full mt-1.5 px-4 py-3 bg-[#fdf6f9] border border-[#F4C0D1] rounded-xl text-sm text-[#2C1A23] placeholder:text-[#9b7c89] outline-none focus:border-[#D4537E] transition-colors"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-[#7a5a67] uppercase tracking-wider">State</span>
              <input
                value={form.state}
                onChange={e => updateField('state', e.target.value)}
                placeholder="IN"
                className="w-full mt-1.5 px-4 py-3 bg-[#fdf6f9] border border-[#F4C0D1] rounded-xl text-sm text-[#2C1A23] placeholder:text-[#9b7c89] outline-none focus:border-[#D4537E] transition-colors"
              />
            </label>
          </div>

          {role === 'PROFESSIONAL' && (
            <div className="space-y-4 rounded-2xl border border-[#F4C0D1] bg-[#fff9fb] p-4">
              <div>
                <h2 className="font-semibold text-[#2C1A23]">Professional Profile</h2>
                <p className="text-xs text-[#7a5a67] mt-1">This information will be saved to your business listing in the database.</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <label className="block sm:col-span-2">
                  <span className="text-xs font-medium text-[#7a5a67] uppercase tracking-wider">Business Name</span>
                  <input
                    value={form.businessName}
                    onChange={e => updateField('businessName', e.target.value)}
                    className="w-full mt-1.5 px-4 py-3 bg-white border border-[#F4C0D1] rounded-xl text-sm text-[#2C1A23] placeholder:text-[#9b7c89] outline-none focus:border-[#D4537E] transition-colors"
                  />
                </label>
                <label className="block sm:col-span-2">
                  <span className="text-xs font-medium text-[#7a5a67] uppercase tracking-wider">Bio</span>
                  <textarea
                    rows={4}
                    value={form.bio}
                    onChange={e => updateField('bio', e.target.value)}
                    className="w-full mt-1.5 px-4 py-3 bg-white border border-[#F4C0D1] rounded-xl text-sm text-[#2C1A23] placeholder:text-[#9b7c89] outline-none focus:border-[#D4537E] transition-colors resize-none"
                  />
                </label>
                <label className="block sm:col-span-2">
                  <span className="text-xs font-medium text-[#7a5a67] uppercase tracking-wider">Services</span>
                  <input
                    value={form.services}
                    onChange={e => updateField('services', e.target.value)}
                    placeholder="Nails, Hair, Brows"
                    className="w-full mt-1.5 px-4 py-3 bg-white border border-[#F4C0D1] rounded-xl text-sm text-[#2C1A23] placeholder:text-[#9b7c89] outline-none focus:border-[#D4537E] transition-colors"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-medium text-[#7a5a67] uppercase tracking-wider">Min Price</span>
                  <input
                    type="number"
                    min="0"
                    value={form.priceMin}
                    onChange={e => updateField('priceMin', e.target.value)}
                    className="w-full mt-1.5 px-4 py-3 bg-white border border-[#F4C0D1] rounded-xl text-sm text-[#2C1A23] placeholder:text-[#9b7c89] outline-none focus:border-[#D4537E] transition-colors"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-medium text-[#7a5a67] uppercase tracking-wider">Max Price</span>
                  <input
                    type="number"
                    min="0"
                    value={form.priceMax}
                    onChange={e => updateField('priceMax', e.target.value)}
                    className="w-full mt-1.5 px-4 py-3 bg-white border border-[#F4C0D1] rounded-xl text-sm text-[#2C1A23] placeholder:text-[#9b7c89] outline-none focus:border-[#D4537E] transition-colors"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-medium text-[#7a5a67] uppercase tracking-wider">Instagram</span>
                  <input
                    value={form.instagram}
                    onChange={e => updateField('instagram', e.target.value)}
                    placeholder="beautybyyou"
                    className="w-full mt-1.5 px-4 py-3 bg-white border border-[#F4C0D1] rounded-xl text-sm text-[#2C1A23] placeholder:text-[#9b7c89] outline-none focus:border-[#D4537E] transition-colors"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-medium text-[#7a5a67] uppercase tracking-wider">Website</span>
                  <input
                    value={form.website}
                    onChange={e => updateField('website', e.target.value)}
                    placeholder="https://"
                    className="w-full mt-1.5 px-4 py-3 bg-white border border-[#F4C0D1] rounded-xl text-sm text-[#2C1A23] placeholder:text-[#9b7c89] outline-none focus:border-[#D4537E] transition-colors"
                  />
                </label>
              </div>
            </div>
          )}

          {error && (
            <div className="text-sm text-[#b60000] bg-[#fff1f1] border border-[#ffd2d2] rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#D4537E] text-white py-3.5 rounded-xl font-medium hover:bg-[#993556] disabled:opacity-60 transition-colors"
          >
            {loading ? 'Creating account...' : `Create ${role === 'PROFESSIONAL' ? 'Professional' : 'Customer'} Account`}
          </button>
        </form>

        <div className="mt-5 text-center text-sm text-[#7a5a67]">
          Already have an account?{' '}
          <Link href="/login" className="text-[#D4537E] font-medium hover:underline">
            Sign In
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
