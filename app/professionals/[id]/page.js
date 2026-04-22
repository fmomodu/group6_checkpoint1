'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from '@/lib/auth-client'
import { Star, MapPin, Phone, Instagram, Globe, Heart, ArrowLeft, Clock } from 'lucide-react'
import Navbar from '@/components/Navbar'
import ReviewForm from '@/components/ReviewForm'

const DAY_ORDER = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']

export default function ProfessionalPage() {
  const { id } = useParams()
  const router = useRouter()
  const { data: session } = useSession()

  const [pro, setPro] = useState(null)
  const [loading, setLoading] = useState(true)
  const [favorited, setFavorited] = useState(false)
  const [favLoading, setFavLoading] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)

  useEffect(() => {
    fetch(`/api/professionals/${id}`)
      .then(r => r.json())
      .then(data => {
        setPro(data)
        if (session?.user) {
          setFavorited(data.isFavorited)
        } else {
          const raw = localStorage.getItem('guestFavorites')
          const ids = raw ? JSON.parse(raw) : []
          setFavorited(Array.isArray(ids) && ids.includes(id))
        }
        setLoading(false)
      })
  }, [id, session?.user])

  async function toggleFavorite() {
    if (!session) {
      const raw = localStorage.getItem('guestFavorites')
      const ids = raw ? JSON.parse(raw) : []
      const safeIds = Array.isArray(ids) ? ids : []
      const next = safeIds.includes(id)
        ? safeIds.filter(x => x !== id)
        : [...safeIds, id]
      localStorage.setItem('guestFavorites', JSON.stringify(next))
      setFavorited(next.includes(id))
      return
    }
    setFavLoading(true)
    const res = await fetch('/api/favorites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ professionalId: id }),
    })
    const data = await res.json()
    setFavorited(data.favorited)
    setFavLoading(false)
  }

  if (loading) return (
    <div className="min-h-screen bg-[#f7f7f7] flex items-center justify-center">
      <div className="text-[#1f1f1f]">Loading...</div>
    </div>
  )

  if (!pro || pro.error) return (
    <div className="min-h-screen bg-[#f7f7f7] flex flex-col items-center justify-center gap-4">
      <p className="text-[#555]">Professional not found</p>
      <button onClick={() => router.back()} className="text-[#1f1f1f] text-sm">← Go back</button>
    </div>
  )

  const sortedHours = (pro.hours || []).sort(
    (a, b) => DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day)
  )

  return (
    <div className="min-h-screen bg-[#f7f7f7]">
      <Navbar active="search" />

      <main className="page-shell space-y-4">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1 text-sm text-[#555] hover:text-[#1f1f1f]"
        >
          <ArrowLeft size={14} /> Back
        </button>

        <section className="bg-white border border-[#e8e8e8] rounded-3xl overflow-hidden">
          <div className="h-56 bg-[#efefef] flex items-center justify-center">
            {pro.image ? (
              <img src={pro.image} alt={pro.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-[#1f1f1f] text-white flex items-center justify-center text-3xl font-display">
                {pro.name.charAt(0)}
              </div>
            )}
          </div>

          <div className="p-5 sm:p-6 grid lg:grid-cols-[1fr_320px] gap-6">
            <div>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h1 className="font-display text-3xl leading-tight">{pro.name}</h1>
                  <p className="mt-1 text-sm text-[#666] inline-flex items-center gap-1"><MapPin size={13} /> {pro.city}, {pro.state}</p>
                </div>
                <button
                  onClick={toggleFavorite}
                  disabled={favLoading}
                  className="w-10 h-10 rounded-full border border-[#e8e8e8] flex items-center justify-center"
                >
                  <Heart size={16} className={favorited ? 'fill-[#1f1f1f] text-[#1f1f1f]' : 'text-[#666]'} />
                </button>
              </div>

              {pro.bio && <p className="text-sm text-[#666] mt-4 leading-relaxed">{pro.bio}</p>}

              <div className="flex flex-wrap gap-2 mt-4">
                {pro.services?.map(s => (
                  <span key={s} className="px-2.5 py-1 rounded-md text-xs bg-[#f3f3f3] text-[#555]">{s}</span>
                ))}
              </div>
            </div>

            <div className="bg-[#fafafa] rounded-2xl border border-[#ececec] p-4 h-fit">
              <div className="flex items-center justify-between">
                <p className="text-sm text-[#666]">Price Range</p>
                <p className="text-sm font-semibold">${pro.priceMin} – ${pro.priceMax}</p>
              </div>
              {pro.avgRating && (
                <div className="flex items-center gap-1 mt-2 text-sm">
                  <Star size={13} className="fill-[#1f1f1f] text-[#1f1f1f]" />
                  <span className="font-semibold">{pro.avgRating}</span>
                  <span className="text-[#8b8b8b]">({pro.reviewCount} reviews)</span>
                </div>
              )}
              <button className="w-full mt-4 bg-[#1f1f1f] text-white rounded-xl py-3 text-sm font-semibold">
                Request Booking
              </button>
            </div>
          </div>
        </section>

        <section className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            {pro.gallery?.length > 0 && (
              <div className="bg-white border border-[#e8e8e8] rounded-2xl p-4">
                <h2 className="font-semibold mb-3">Portfolio</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {pro.gallery.map((img, i) => (
                    <img key={i} src={img} alt="" className="aspect-square rounded-xl object-cover bg-[#efefef]" />
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white border border-[#e8e8e8] rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold">Reviews</h2>
                {session && (
                  <button
                    onClick={() => setShowReviewForm(!showReviewForm)}
                    className="text-xs font-semibold border border-[#ddd] px-3 py-1 rounded-lg"
                  >
                    Write review
                  </button>
                )}
              </div>

              {showReviewForm && (
                <ReviewForm
                  professionalId={id}
                  onSuccess={(review) => {
                    setPro(prev => ({ ...prev, reviews: [review, ...prev.reviews] }))
                    setShowReviewForm(false)
                  }}
                />
              )}

              {pro.reviews?.length === 0 ? (
                <p className="text-sm text-[#777]">No reviews yet.</p>
              ) : (
                <div className="space-y-3">
                  {pro.reviews?.map(r => (
                    <div key={r.id} className="rounded-xl border border-[#efefef] p-3">
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="w-8 h-8 rounded-full bg-[#efefef] flex items-center justify-center text-sm font-medium text-[#444]">
                          {r.user?.name?.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-medium">{r.user?.name}</div>
                          <div className="flex gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} size={10} className={i < r.rating ? 'fill-[#1f1f1f] text-[#1f1f1f]' : 'text-[#ddd]'} />
                            ))}
                          </div>
                        </div>
                      </div>
                      {r.comment && <p className="text-sm text-[#666]">{r.comment}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {(pro.phone || pro.instagram || pro.website) && (
              <div className="bg-white border border-[#e8e8e8] rounded-2xl p-4">
                <h2 className="font-semibold mb-2">Contact</h2>
                <div className="space-y-2 text-sm text-[#666]">
                  {pro.phone && <a href={`tel:${pro.phone}`} className="inline-flex items-center gap-2"><Phone size={14} /> {pro.phone}</a>}
                  {pro.instagram && <a href={`https://instagram.com/${pro.instagram}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2"><Instagram size={14} /> @{pro.instagram}</a>}
                  {pro.website && <a href={pro.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2"><Globe size={14} /> Website</a>}
                </div>
              </div>
            )}

            {sortedHours.length > 0 && (
              <div className="bg-white border border-[#e8e8e8] rounded-2xl p-4">
                <h2 className="font-semibold mb-2 inline-flex items-center gap-2"><Clock size={14} /> Working Hours</h2>
                <div className="space-y-1.5 text-sm">
                  {sortedHours.map(h => (
                    <div key={h.day} className="flex justify-between text-[#666]">
                      <span>{h.day}</span>
                      <span>{h.open === 'Closed' ? 'Closed' : `${h.open} – ${h.close}`}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}
