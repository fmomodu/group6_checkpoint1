'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search, MapPin, Star, SlidersHorizontal } from 'lucide-react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { ServiceIcons, ServiceColors } from '@/lib/serviceIcons'

const SERVICES = ['Nails', 'Hair', 'Lashes', 'Brows', 'Makeup', 'Tan']
const STYLES = ['Any', 'Natural', 'Glam', 'Bridal', 'Minimal', 'Classic', 'Bold']

function SearchContent() {
  const searchParams = useSearchParams()

  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [city, setCity] = useState(searchParams.get('city') || '')
  const [selectedServices, setSelectedServices] = useState(
    searchParams.get('services') ? searchParams.get('services').split(',') : []
  )
  const [maxPrice, setMaxPrice] = useState(500)
  const [minRating, setMinRating] = useState(0)
  const [style, setStyle] = useState(searchParams.get('style') || 'Any')
  const [showFilters, setShowFilters] = useState(false)

  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  async function fetchResults(p = 1) {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (query) params.set('q', query)
      if (city) params.set('city', city)
      if (selectedServices.length) params.set('services', selectedServices.join(','))
      if (maxPrice < 500) params.set('maxPrice', maxPrice)
      if (minRating > 0) params.set('minRating', minRating)
      if (style !== 'Any') params.set('style', style)
      params.set('page', p)

      const res = await fetch(`/api/professionals?${params}`)
      const data = await res.json()
      setResults(data.professionals || [])
      setTotal(data.total || 0)
      setTotalPages(data.pages || 1)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchResults(1) }, [])

  function handleSearch(e) {
    e.preventDefault()
    setPage(1)
    fetchResults(1)
  }

  function toggleService(service) {
    setSelectedServices(prev =>
      prev.includes(service)
        ? prev.filter(x => x !== service)
        : [...prev, service]
    )
  }

  return (
    <div className="min-h-screen bg-[#f7f7f7]">
      <Navbar active="search" />

      <main className="page-shell">
        <div className="grid lg:grid-cols-[290px_1fr] gap-4">
          <aside className="bg-white border border-[#e8e8e8] rounded-2xl p-4 h-fit lg:sticky lg:top-24">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold">Filters</h2>
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden p-2 rounded-lg bg-[#f2f2f2] text-[#555]"
              >
                <SlidersHorizontal size={14} />
              </button>
            </div>

            <form onSubmit={handleSearch} className={`space-y-3 ${showFilters ? 'block' : 'hidden lg:block'}`}>
              <label className="block">
                <span className="text-xs text-[#777]">Service or keyword</span>
                <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-[#ececec] bg-[#fafafa] px-3 py-2.5">
                  <Search size={14} className="text-[#666]" />
                  <input
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Nails, lashes..."
                    className="w-full bg-transparent outline-none text-sm text-[#1f1f1f] placeholder:text-[#9ca3af]"
                  />
                </div>
              </label>

              <label className="block">
                <span className="text-xs text-[#777]">Location</span>
                <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-[#ececec] bg-[#fafafa] px-3 py-2.5">
                  <MapPin size={14} className="text-[#666]" />
                  <input
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    placeholder="City"
                    className="w-full bg-transparent outline-none text-sm text-[#1f1f1f] placeholder:text-[#9ca3af]"
                  />
                </div>
              </label>

              <div>
                <p className="text-xs text-[#777] mb-2">Services</p>
                <div className="flex flex-wrap gap-1.5">
                  {SERVICES.map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleService(s)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                        selectedServices.includes(s)
                          ? 'bg-[#1f1f1f] text-white'
                          : 'bg-[#f3f3f3] text-[#555]'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-[#777]">Max Price: ${maxPrice}</label>
                <input
                  type="range"
                  min={20}
                  max={500}
                  step={10}
                  value={maxPrice}
                  onChange={e => setMaxPrice(+e.target.value)}
                  className="w-full mt-1 accent-[#1f1f1f]"
                />
              </div>

              <div>
                <label className="text-xs text-[#777]">Min Rating: {minRating > 0 ? `${minRating}+` : 'Any'}</label>
                <input
                  type="range"
                  min={0}
                  max={4.5}
                  step={0.5}
                  value={minRating}
                  onChange={e => setMinRating(+e.target.value)}
                  className="w-full mt-1 accent-[#1f1f1f]"
                />
              </div>

              <div>
                <label className="text-xs text-[#777]">Style</label>
                <select
                  value={style}
                  onChange={e => setStyle(e.target.value)}
                  className="w-full mt-1.5 rounded-xl border border-[#ececec] bg-white px-3 py-2 text-sm"
                >
                  {STYLES.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              <button className="w-full bg-[#1f1f1f] text-white rounded-xl py-2.5 text-sm font-semibold">
                Apply filters
              </button>
            </form>
          </aside>

          <section>
            <div className="bg-white border border-[#e8e8e8] rounded-2xl p-4 mb-4 flex items-center justify-between">
              <h1 className="font-display text-2xl">Search results</h1>
              <p className="text-sm text-[#7b7b7b]">{total} professionals</p>
            </div>

            {loading ? (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="h-56 rounded-2xl bg-white border border-[#ececec] animate-pulse" />
                ))}
              </div>
            ) : results.length === 0 ? (
              <div className="bg-white border border-[#ececec] rounded-2xl p-10 text-center">
                <p className="font-semibold text-[#1f1f1f]">No results found</p>
                <p className="text-sm text-[#888] mt-1">Try broadening your location or service filters.</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {results.map(pro => {
                  const service = pro.services?.[0]
                  const Icon = ServiceIcons[service]
                  const colors = ServiceColors[service]
                  return (
                    <Link
                      key={pro.id}
                      href={`/professionals/${pro.id}`}
                      className="bg-white rounded-2xl border border-[#e8e8e8] overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <div className="h-40 bg-gradient-to-br from-[#f4f4f4] to-[#ececec] flex items-center justify-center">
                        {Icon && (
                          <div className="w-20 h-20" style={{ color: colors?.dark || '#666' }}>
                            <Icon />
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-sm truncate">{pro.name}</h3>
                        <p className="text-xs text-[#7b7b7b] mt-1 truncate">{pro.city}, {pro.state}</p>

                        <div className="mt-3 flex items-center justify-between border-t border-[#f0f0f0] pt-2">
                          <div className="flex items-center gap-1 text-xs">
                            {pro.avgRating ? (
                              <>
                                <Star size={12} className="text-[#1f1f1f] fill-[#1f1f1f]" />
                                <span className="font-semibold">{pro.avgRating}</span>
                                <span className="text-[#9b9b9b]">({pro.reviewCount})</span>
                              </>
                            ) : (
                              <span className="text-[#9b9b9b]">No ratings</span>
                            )}
                          </div>
                          <span className="text-xs text-[#666]">${pro.priceMin}–${pro.priceMax}</span>
                        </div>

                        <div className="flex flex-wrap gap-1 mt-2">
                          {pro.services?.slice(0, 2).map(s => (
                            <span key={s} className="text-[10px] bg-[#f3f3f3] text-[#555] px-2 py-1 rounded-md">{s}</span>
                          ))}
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => { setPage(i + 1); fetchResults(i + 1) }}
                    className={`w-9 h-9 rounded-lg text-sm font-semibold ${
                      page === i + 1
                        ? 'bg-[#1f1f1f] text-white'
                        : 'bg-white border border-[#e8e8e8] text-[#666]'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchContent />
    </Suspense>
  )
}
