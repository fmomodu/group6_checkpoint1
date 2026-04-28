'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, MapPin, Sparkles, Star, ChevronRight, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import ChatBot from '@/components/ChatBot'
import { ServiceIcons, ServiceColors } from '@/lib/serviceIcons'

const CATEGORIES = ['All', 'Nails', 'Hair', 'Lashes', 'Brows', 'Makeup', 'Tan']

const FEATURED = [
  { id: 'glosslab-nails', name: 'GlossLab Nails', service: 'Nails', rating: 4.8, reviews: 34, city: 'West Lafayette, IN', price: '$45–$85', height: 'h-40' },
  { id: 'the-lash-lounge', name: 'The Lash Lounge', service: 'Lashes', rating: 4.9, reviews: 42, city: 'West Lafayette, IN', price: '$80–$200', height: 'h-48' },
  { id: 'velvet-touch-studio', name: 'Velvet Touch Studio', service: 'Hair', rating: 4.5, reviews: 21, city: 'Lafayette, IN', price: '$50–$185', height: 'h-44' },
]

export default function HomePage() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [city, setCity] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [showChat, setShowChat] = useState(false)

  function handleSearch(e) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (query) params.set('q', query)
    if (city) params.set('city', city)
    if (activeCategory !== 'All') params.set('services', activeCategory)
    router.push(`/search?${params.toString()}`)
  }

  return (
    <div className="min-h-screen bg-[#f7f7f7]">
      <Navbar active="home" />

      <main className="page-shell space-y-8">
        <section className="grid lg:grid-cols-[1.3fr_1fr] gap-4">
          <div className="rounded-3xl p-6 sm:p-8 text-white min-h-[360px] flex flex-col justify-end bg-cover bg-center"
            style={{
              backgroundImage:
                "linear-gradient(125deg, rgba(21,21,21,0.75) 20%, rgba(21,21,21,0.35) 100%), url('https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1600&q=80')",
            }}
          >
            <p className="text-xs tracking-[0.2em] uppercase font-semibold text-white/80 mb-3">Beauty Book</p>
            <h1 className="font-display text-4xl sm:text-5xl leading-tight">Your Beauty Needs Near You</h1>
            <p className="mt-3 text-sm text-white/85 max-w-lg">
              Discover, compare, and connect with local beauty professionals.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-[#e8e8e8] p-5 sm:p-6 space-y-4">
            <h2 className="font-semibold text-lg">Start your search</h2>
            <form onSubmit={handleSearch} className="space-y-3">
              <label className="block">
                <span className="text-xs text-[#6b6b6b]">Service or keyword</span>
                <div className="mt-1.5 flex items-center gap-2 bg-[#fafafa] border border-[#ececec] rounded-xl px-3 py-2.5">
                  <Search size={16} className="text-[#e00707]" />
                  <input
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Nail techs, lashes, hair color"
                    className="flex-1 bg-transparent outline-none text-sm text-[#1f1f1f] placeholder:text-[#9ca3af]"
                  />
                </div>
              </label>
              <label className="block">
                <span className="text-xs text-[#6b6b6b]">Location</span>
                <div className="mt-1.5 flex items-center gap-2 bg-[#fafafa] border border-[#ececec] rounded-xl px-3 py-2.5">
                  <MapPin size={16} className="text-[#e00707]" />
                  <input
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    placeholder="City"
                    className="flex-1 bg-transparent outline-none text-sm text-[#1f1f1f] placeholder:text-[#9ca3af]"
                  />
                </div>
              </label>
              <button className="w-full bg-[#e00707] text-white rounded-xl py-3 text-sm font-semibold hover:bg-[#b60000] transition-colors">
                Search professionals
              </button>
            </form>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-[#fafafa] rounded-xl py-2.5"><p className="text-lg font-bold">1.2k+</p><p className="text-[11px] text-[#777]">Pros</p></div>
              <div className="bg-[#fafafa] rounded-xl py-2.5"><p className="text-lg font-bold">4.8</p><p className="text-[11px] text-[#777]">Avg Rating</p></div>
              <div className="bg-[#fafafa] rounded-xl py-2.5"><p className="text-lg font-bold">10k+</p><p className="text-[11px] text-[#777]">Reviews</p></div>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-[#e8e8e8] p-3 sm:p-4 overflow-x-auto no-scrollbar">
          <div className="flex gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeCategory === cat
                    ? 'bg-[#1f1f1f] text-white'
                    : 'bg-[#f5f5f5] text-[#555] hover:bg-[#ececec]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-2xl">Featured professionals</h2>
            <Link href="/search" className="inline-flex items-center gap-1 text-sm font-semibold text-[#e00707]">
              Browse all <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURED.map(pro => {
              const Icon = ServiceIcons[pro.service]
              const colors = ServiceColors[pro.service]
              return (
                <Link
                  key={pro.id}
                  href={`/professionals/${pro.id}`}
                  className="group bg-white rounded-2xl overflow-hidden border border-[#e8e8e8] hover:shadow-md transition-all"
                >
                  <div className={`${pro.height} bg-gradient-to-br ${colors.bg} flex items-center justify-center p-4`}>
                    <div className="w-24 h-24" style={{ color: colors.dark }}><Icon /></div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-sm group-hover:text-[#e00707] transition-colors">{pro.name}</h3>
                    <p className="text-xs text-[#7b7b7b] mt-1">{pro.city} • {pro.service}</p>
                    <div className="mt-3 flex items-center justify-between border-t border-[#f0f0f0] pt-2">
                      <div className="flex items-center gap-1 text-xs">
                        <Star size={12} className="text-[#e00707] fill-[#e00707]" />
                        <span className="font-semibold">{pro.rating}</span>
                        <span className="text-[#9b9b9b]">({pro.reviews})</span>
                      </div>
                      <span className="text-xs text-[#767676]">{pro.price}</span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>

        <section>
          <button
            onClick={() => setShowChat(true)}
            className="w-full sm:w-auto inline-flex items-center gap-3 bg-[#1f1f1f] text-white rounded-xl px-5 py-3"
          >
            <Sparkles size={18} />
            Ask BeautyBot for recommendations
            <ChevronRight size={16} />
          </button>
        </section>
      </main>

      {showChat && <ChatBot onClose={() => setShowChat(false)} />}
    </div>
  )
}
