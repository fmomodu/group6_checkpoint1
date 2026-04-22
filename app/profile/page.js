'use client'
import { useState, useEffect } from 'react'
import { useSession, signOut } from '@/lib/auth-client'
import { Star, LogOut, Heart, User, BadgeCheck, Phone, MapPin, Briefcase, Globe, Instagram } from 'lucide-react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const [saved, setSaved] = useState([])
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'authenticated') {
      Promise.all([
        fetch('/api/favorites').then(r => r.json()).catch(() => []),
        fetch('/api/account/profile').then(r => r.json()).catch(() => null),
      ])
        .then(([favoritesData, profileData]) => {
          setSaved(Array.isArray(favoritesData) ? favoritesData : [])
          setProfile(profileData?.error ? null : profileData)
          setLoading(false)
        })
        .catch(() => setLoading(false))
      return
    }

    if (status === 'unauthenticated') {
      const raw = localStorage.getItem('guestFavorites')
      const ids = raw ? JSON.parse(raw) : []

      if (!Array.isArray(ids) || ids.length === 0) {
        setSaved([])
        setLoading(false)
        return
      }

      Promise.all(
        ids.map((id) =>
          fetch(`/api/professionals/${id}`)
            .then(r => (r.ok ? r.json() : null))
            .catch(() => null)
        )
      ).then((pros) => {
        setSaved(pros.filter(Boolean))
        setLoading(false)
      })
    }
  }, [status])

  const isProfessional = profile?.role === 'PROFESSIONAL'
  const professionalProfile = profile?.professionalProfile

  async function removeFavorite(professionalId) {
    if (status === 'unauthenticated') {
      const raw = localStorage.getItem('guestFavorites')
      const ids = raw ? JSON.parse(raw) : []
      const next = Array.isArray(ids) ? ids.filter(id => id !== professionalId) : []
      localStorage.setItem('guestFavorites', JSON.stringify(next))
      setSaved(prev => prev.filter(p => p.id !== professionalId))
      return
    }

    await fetch('/api/favorites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ professionalId }),
    })
    setSaved(prev => prev.filter(p => p.id !== professionalId))
  }

  if (status === 'loading' || (status === 'authenticated' && loading)) {
    return (
      <div className="min-h-screen bg-[#f7f7f7] flex items-center justify-center">
        <div className="text-[#1f1f1f]">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f7f7f7]">
      <Navbar active="profile" />
      {/* Header */}
      <div className="bg-white border-b border-[#ececec] px-5 pt-8 pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-[#f1f1f1] flex items-center justify-center text-xl font-display text-[#1f1f1f] font-semibold">
              {session?.user?.name?.charAt(0) || <User size={20} />}
            </div>
            <div>
              <h1 className="font-display text-lg font-semibold text-[#2C1A23]">
                {profile?.name || session?.user?.name || 'Guest User'}
              </h1>
              <p className="text-xs text-[#7a5a67]">{profile?.email || session?.user?.email || 'No account connected'}</p>
              {status === 'authenticated' && profile?.role && (
                <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-[#fdf6f9] px-2.5 py-1 text-[11px] font-semibold text-[#D4537E] border border-[#F4C0D1]">
                  <BadgeCheck size={12} />
                  {profile.role === 'PROFESSIONAL' ? 'Professional Account' : 'Customer Account'}
                </div>
              )}
            </div>
          </div>
          {status === 'authenticated' ? (
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="flex items-center gap-1.5 text-xs text-[#666] border border-[#ececec] px-3 py-2 rounded-xl hover:border-[#1f1f1f] transition-colors"
            >
              <LogOut size={13} />
              Sign out
            </button>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 text-xs text-[#666] border border-[#ececec] px-3 py-2 rounded-xl hover:border-[#1f1f1f] transition-colors"
            >
              <User size={13} />
              Sign in
            </Link>
          )}
        </div>

        {/* Stats */}
        <div className="flex gap-4 mt-5">
          <div className="flex-1 bg-[#f7f7f7] rounded-xl px-4 py-3 text-center">
            <div className="text-xl font-semibold text-[#1f1f1f]">{saved.length}</div>
            <div className="text-xs text-[#7a5a67] mt-0.5">Saved</div>
          </div>
          <div className="flex-1 bg-[#f7f7f7] rounded-xl px-4 py-3 text-center">
            <div className="text-xl font-semibold text-[#1f1f1f]">{profile?._count?.reviews || 0}</div>
            <div className="text-xs text-[#7a5a67] mt-0.5">Reviews</div>
          </div>
          <div className="flex-1 bg-[#f7f7f7] rounded-xl px-4 py-3 text-center">
            <div className="text-xl font-semibold text-[#1f1f1f]">
              {isProfessional && professionalProfile ? 1 : 0}
            </div>
            <div className="text-xs text-[#7a5a67] mt-0.5">
              {isProfessional ? 'Listings' : 'Bookings'}
            </div>
          </div>
        </div>

        {status === 'authenticated' && (
          <div className="mt-4 grid sm:grid-cols-2 gap-3">
            <div className="bg-[#f7f7f7] rounded-xl border border-[#ececec] p-4">
              <div className="text-xs uppercase tracking-wider text-[#7a5a67] font-medium">Contact</div>
              <div className="mt-2 space-y-1.5 text-sm text-[#2C1A23]">
                <div className="inline-flex items-center gap-2"><Phone size={14} /> {profile?.phone || 'Not added yet'}</div>
                <div className="inline-flex items-center gap-2"><MapPin size={14} /> {profile?.city && profile?.state ? `${profile.city}, ${profile.state}` : 'Location not added yet'}</div>
              </div>
            </div>

            <div className="bg-[#f7f7f7] rounded-xl border border-[#ececec] p-4">
              <div className="text-xs uppercase tracking-wider text-[#7a5a67] font-medium">Account Summary</div>
              <div className="mt-2 space-y-1.5 text-sm text-[#2C1A23]">
                <div className="inline-flex items-center gap-2"><Briefcase size={14} /> {isProfessional ? 'Professional listing owner' : 'Beauty customer'}</div>
                <div className="text-[#7a5a67]">
                  {isProfessional
                    ? 'Your business listing is shown below.'
                    : 'Save professionals and leave reviews from your account.'}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="px-4 py-5">
        {isProfessional && professionalProfile && (
          <section className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Briefcase size={16} className="text-[#1f1f1f]" />
              <h2 className="font-display text-base font-semibold text-[#2C1A23]">Your Business Listing</h2>
            </div>

            <div className="bg-white rounded-2xl border border-[#ececec] p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-display text-xl text-[#2C1A23]">{professionalProfile.name}</h3>
                  <p className="text-sm text-[#7a5a67] mt-1">{professionalProfile.city}, {professionalProfile.state}</p>
                </div>
                <Link
                  href={`/professionals/${professionalProfile.id}`}
                  className="text-sm font-medium text-[#D4537E] hover:underline"
                >
                  View Public Profile
                </Link>
              </div>

              {professionalProfile.bio && (
                <p className="mt-4 text-sm text-[#555] leading-relaxed">{professionalProfile.bio}</p>
              )}

              <div className="mt-4 flex flex-wrap gap-1.5">
                {professionalProfile.services?.map(service => (
                  <span key={service} className="text-[10px] bg-[#f3f3f3] text-[#555] px-2 py-1 rounded-md">
                    {service}
                  </span>
                ))}
              </div>

              <div className="mt-4 grid sm:grid-cols-2 gap-3">
                <div className="rounded-xl bg-[#f7f7f7] border border-[#ececec] p-4">
                  <div className="text-xs uppercase tracking-wider text-[#7a5a67] font-medium">Pricing</div>
                  <div className="mt-2 text-sm text-[#2C1A23]">${professionalProfile.priceMin} - ${professionalProfile.priceMax}</div>
                </div>
                <div className="rounded-xl bg-[#f7f7f7] border border-[#ececec] p-4">
                  <div className="text-xs uppercase tracking-wider text-[#7a5a67] font-medium">Rating</div>
                  <div className="mt-2 inline-flex items-center gap-1 text-sm text-[#2C1A23]">
                    <Star size={13} className="fill-[#1f1f1f] text-[#1f1f1f]" />
                    {professionalProfile.avgRating || 'No rating yet'} {professionalProfile.reviewCount ? `(${professionalProfile.reviewCount})` : ''}
                  </div>
                </div>
              </div>

              {(professionalProfile.instagram || professionalProfile.website) && (
                <div className="mt-4 flex flex-wrap gap-4 text-sm">
                  {professionalProfile.instagram && (
                    <a
                      href={`https://instagram.com/${professionalProfile.instagram}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 text-[#D4537E] hover:underline"
                    >
                      <Instagram size={14} /> @{professionalProfile.instagram}
                    </a>
                  )}
                  {professionalProfile.website && (
                    <a
                      href={professionalProfile.website}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 text-[#D4537E] hover:underline"
                    >
                      <Globe size={14} /> Website
                    </a>
                  )}
                </div>
              )}
            </div>
          </section>
        )}

        <div className="flex items-center gap-2 mb-4">
          <Heart size={16} className="text-[#1f1f1f]" />
          <h2 className="font-display text-base font-semibold text-[#2C1A23]">Pinned Techs</h2>
        </div>

        {saved.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-[#ececec]">
            <p className="font-medium text-[#2C1A23] text-sm">No saved professionals yet</p>
            <p className="text-xs text-[#7a5a67] mt-1 mb-4">Tap the heart on any profile to save them here</p>
            <Link
              href="/search"
              className="inline-block bg-[#1f1f1f] text-white px-5 py-2.5 rounded-xl text-sm font-medium"
            >
              Discover Professionals
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {saved.map(pro => (
              <div key={pro.id} className="bg-white rounded-2xl border border-[#ececec] overflow-hidden relative">
                <button
                  onClick={() => removeFavorite(pro.id)}
                  className="absolute top-2 right-2 z-10 w-7 h-7 bg-white/80 rounded-full flex items-center justify-center"
                >
                  <Heart size={13} className="fill-[#1f1f1f] text-[#1f1f1f]" />
                </button>
                <Link href={`/professionals/${pro.id}`}>
                  <div className="h-24 bg-gradient-to-br from-[#f0f0f0] to-[#e7e7e7] flex items-center justify-center text-2xl">
                    {pro.name?.charAt(0)}
                  </div>
                  <div className="p-3">
                    <div className="text-sm font-medium text-[#2C1A23] truncate">{pro.name}</div>
                    <div className="text-xs text-[#7a5a67] truncate mt-0.5">{pro.city}</div>
                    {pro.avgRating && (
                      <div className="flex items-center gap-0.5 mt-1">
                        <Star size={10} className="fill-[#1f1f1f] text-[#1f1f1f]" />
                        <span className="text-xs text-[#2C1A23]">{pro.avgRating}</span>
                      </div>
                    )}
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
