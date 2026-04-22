'use client'
import { useEffect, useState } from 'react'
import { useSession } from '@/lib/auth-client'
import Link from 'next/link'
import { Heart, Star, User } from 'lucide-react'
import Navbar from '@/components/Navbar'

export default function SavedPage() {
  const { data: session, status } = useSession()
  const [saved, setSaved] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/favorites')
        .then(r => r.json())
        .then(data => {
          setSaved(Array.isArray(data) ? data : [])
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
      <Navbar active="saved" />
      <div className="bg-white border-b border-[#ececec] px-5 pt-8 pb-6">
        <h1 className="font-display text-xl font-semibold text-[#2C1A23]">Saved Providers</h1>
        <p className="text-sm text-[#7a5a67] mt-1">
          {status === 'unauthenticated'
            ? 'Guest mode: your saved providers are stored on this device.'
            : 'Compare your favorites and book when ready.'}
        </p>

        <div className="mt-4 bg-[#f7f7f7] rounded-xl p-4 border border-[#ececec] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-[#efefef] text-[#1f1f1f] flex items-center justify-center font-semibold">
              {session?.user?.name?.charAt(0) || <User size={16} />}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium text-[#2C1A23] truncate">{session?.user?.name || 'Guest User'}</div>
              <div className="text-xs text-[#7a5a67] truncate">{session?.user?.email || 'No account connected'}</div>
            </div>
          </div>
          <Link href="/profile" className="text-xs text-[#1f1f1f] font-medium">Manage</Link>
        </div>
      </div>

      <div className="px-4 py-5">
        {saved.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-[#ececec]">
            <p className="font-medium text-[#2C1A23] text-sm">No saved professionals yet</p>
            <p className="text-xs text-[#7a5a67] mt-1 mb-4">Save providers from their profile page to compare them here.</p>
            <Link href="/search" className="inline-block bg-[#1f1f1f] text-white px-5 py-2.5 rounded-xl text-sm font-medium">
              Explore Professionals
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {saved.map(pro => (
              <div key={pro.id} className="bg-white rounded-2xl border border-[#ececec] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link href={`/professionals/${pro.id}`} className="text-sm font-medium text-[#2C1A23] hover:underline truncate block">
                      {pro.name}
                    </Link>
                    <div className="text-xs text-[#7a5a67] mt-0.5">{pro.city}, {pro.state}</div>
                  </div>
                  <button
                    onClick={() => removeFavorite(pro.id)}
                    className="w-8 h-8 rounded-full bg-[#efefef] flex items-center justify-center"
                    aria-label={`Remove ${pro.name} from saved`}
                  >
                    <Heart size={14} className="fill-[#1f1f1f] text-[#1f1f1f]" />
                  </button>
                </div>

                <div className="flex items-center justify-between mt-3">
                  {pro.avgRating ? (
                    <div className="flex items-center gap-1">
                      <Star size={12} className="fill-[#1f1f1f] text-[#1f1f1f]" />
                      <span className="text-xs text-[#2C1A23]">{pro.avgRating} ({pro.reviewCount})</span>
                    </div>
                  ) : (
                    <div className="text-xs text-[#bba0ab]">No ratings yet</div>
                  )}
                  <div className="text-xs text-[#7a5a67]">${pro.priceMin}–${pro.priceMax}</div>
                </div>

                <div className="flex gap-1 mt-2 flex-wrap">
                  {pro.services?.slice(0, 3).map(s => (
                    <span key={s} className="text-[10px] bg-[#f3f3f3] text-[#555] px-2 py-0.5 rounded-md">{s}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
