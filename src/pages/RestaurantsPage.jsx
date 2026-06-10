import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { restaurantAPI } from '../api/client'

function RestaurantCard({ r }) {
  return (
    <Link to={`/restaurants/${r.id}`} className="card group block hover:-translate-y-1 transition-transform duration-300">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-display text-xl font-semibold group-hover:text-amber-600 transition-colors">
            {r.name}
          </h3>
          <p className="text-xs font-body text-charcoal-800/50 mt-1">{r.address}</p>
        </div>
        <div className="flex items-center gap-1 shrink-0 ml-4">
          <span className="text-amber-400 text-sm">★</span>
          <span className="font-mono text-sm font-medium">{parseFloat(r.rating).toFixed(1)}</span>
        </div>
      </div>

      <div className="divider my-4" />

      <div className="flex items-center justify-between text-xs font-body text-charcoal-800/60">
        <span>{r.opening_time?.slice(0,5)} — {r.closing_time?.slice(0,5)}</span>
        <div className="flex items-center gap-3">
          <span>{r.table_count} tables</span>
          <span className={`w-1.5 h-1.5 rounded-full ${r.is_active ? 'bg-green-500' : 'bg-red-400'}`} />
        </div>
      </div>
    </Link>
  )
}

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading]         = useState(true)
  const [search, setSearch]           = useState('')
  const [minRating, setMinRating]     = useState('')
  const [next, setNext]               = useState(null)

  const fetchRestaurants = async (params = {}) => {
    setLoading(true)
    try {
      const { data } = await restaurantAPI.list({
        search: search || undefined,
        min_rating: minRating || undefined,
        ...params,
      })
      setRestaurants(data.results ?? data)
      setNext(data.next ?? null)
    } catch {
      setRestaurants([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchRestaurants() }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    fetchRestaurants()
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">

      {/* Header */}
      <div className="mb-10">
        <p className="section-label mb-3">Explore</p>
        <h1 className="font-display text-4xl font-semibold">Restaurants</h1>
      </div>

      {/* Filters */}
      <form onSubmit={handleSearch} className="flex gap-3 mb-10 flex-wrap">
        <input
          value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or address..."
          className="input-field flex-1 min-w-[200px]"
        />
        <select value={minRating} onChange={(e) => setMinRating(e.target.value)}
          className="input-field w-40">
          <option value="">All ratings</option>
          {[4, 3, 2].map(v => <option key={v} value={v}>★ {v}+</option>)}
        </select>
        <button type="submit" className="btn-primary px-6">Search</button>
        <button type="button" onClick={() => { setSearch(''); setMinRating(''); fetchRestaurants({}) }}
          className="btn-secondary px-6">Clear</button>
      </form>

      {/* Results */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-charcoal-900 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : restaurants.length === 0 ? (
        <div className="text-center py-20">
          <p className="font-display text-2xl text-charcoal-800/30">No restaurants found</p>
          <p className="font-body text-sm text-charcoal-800/40 mt-2">Try a different search</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
          {restaurants.map((r) => <RestaurantCard key={r.id} r={r} />)}
        </div>
      )}
    </div>
  )
}
