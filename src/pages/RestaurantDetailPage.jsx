import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { restaurantAPI, reservationAPI } from '../api/client'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

function TableCard({ table, selected, onSelect }) {
  return (
    <button
      onClick={() => onSelect(table)}
      disabled={!table.is_available}
      className={`w-full text-left p-4 border transition-all duration-200
        ${!table.is_available
          ? 'border-charcoal-800/10 opacity-40 cursor-not-allowed'
          : selected?.id === table.id
            ? 'border-charcoal-900 bg-charcoal-900 text-cream-50'
            : 'border-charcoal-800/20 hover:border-charcoal-900'}`}>
      <div className="flex items-center justify-between">
        <span className="font-mono text-sm font-medium">Table #{table.table_number}</span>
        <span className="text-xs font-body">{table.capacity} seats</span>
      </div>
      {table.description && (
        <p className="text-xs mt-1 opacity-60">{table.description}</p>
      )}
      {!table.is_available && (
        <p className="text-xs mt-1 text-red-500">Unavailable</p>
      )}
    </button>
  )
}

export default function RestaurantDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [restaurant, setRestaurant] = useState(null)
  const [tables, setTables]         = useState([])
  const [loading, setLoading]       = useState(true)
  const [selectedTable, setSelectedTable] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const today = format(new Date(), 'yyyy-MM-dd')
  const [form, setForm] = useState({
    reservation_date: today,
    start_time: '12:00',
    end_time: '13:00',
    party_size: 2,
    special_requests: '',
  })

  useEffect(() => {
    const load = async () => {
      try {
        const [rRes, tRes] = await Promise.all([
          restaurantAPI.detail(id),
          restaurantAPI.tables(id),
        ])
        setRestaurant(rRes.data)
        setTables(tRes.data.results ?? tRes.data)
      } catch {
        toast.error('Restaurant not found')
        navigate('/restaurants')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleReserve = async (e) => {
    e.preventDefault()
    if (!user) { navigate('/login'); return }
    if (!selectedTable) { toast.error('Please select a table'); return }

    setSubmitting(true)
    try {
      await reservationAPI.create({ ...form, table: selectedTable.id })
      toast.success('Reservation created!')
      navigate('/reservations')
    } catch (err) {
      const data = err.response?.data
      const msg = data
        ? Object.values(data).flat()[0]
        : 'Failed to create reservation.'
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-2 border-charcoal-900 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!restaurant) return null

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 animate-fade-in">

      {/* Restaurant info */}
      <div className="mb-10">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="section-label mb-3">{restaurant.address}</p>
            <h1 className="font-display text-5xl font-bold">{restaurant.name}</h1>
            {restaurant.description && (
              <p className="font-body text-charcoal-800/60 mt-4 max-w-2xl">{restaurant.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2 bg-charcoal-900 text-cream-50 px-4 py-3">
            <span className="text-amber-400">★</span>
            <span className="font-mono font-medium">{parseFloat(restaurant.rating).toFixed(1)}</span>
          </div>
        </div>

        <div className="divider" />

        <div className="flex flex-wrap gap-6 text-sm font-body text-charcoal-800/60">
          <span>🕐 {restaurant.opening_time?.slice(0,5)} — {restaurant.closing_time?.slice(0,5)}</span>
          {restaurant.phone && <span>📞 {restaurant.phone}</span>}
          {restaurant.email && <span>✉ {restaurant.email}</span>}
        </div>
      </div>

      {/* Main grid */}
      <div className="grid lg:grid-cols-2 gap-12">

        {/* Tables */}
        <div>
          <h2 className="font-display text-2xl mb-6">Available Tables</h2>
          {tables.length === 0 ? (
            <p className="text-sm font-body text-charcoal-800/50">No tables configured yet.</p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {tables.map((t) => (
                <TableCard key={t.id} table={t}
                  selected={selectedTable} onSelect={setSelectedTable} />
              ))}
            </div>
          )}
        </div>

        {/* Reservation form */}
        <div>
          <h2 className="font-display text-2xl mb-6">Make a Reservation</h2>

          {!user ? (
            <div className="card text-center py-10">
              <p className="font-body text-charcoal-800/60 mb-4">Please sign in to make a reservation</p>
              <button onClick={() => navigate('/login')} className="btn-primary">Sign in</button>
            </div>
          ) : (
            <form onSubmit={handleReserve} className="space-y-4">

              {selectedTable && (
                <div className="bg-amber-50 border border-amber-200 px-4 py-3">
                  <p className="text-xs font-mono font-medium text-amber-700">
                    Selected: Table #{selectedTable.table_number} ({selectedTable.capacity} seats)
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-body font-medium tracking-wide text-charcoal-800/60 mb-2 uppercase">Date</label>
                  <input name="reservation_date" type="date" required min={today}
                    value={form.reservation_date} onChange={handleChange} className="input-field" />
                </div>
                <div>
                  <label className="block text-xs font-body font-medium tracking-wide text-charcoal-800/60 mb-2 uppercase">Party size</label>
                  <input name="party_size" type="number" required min={1}
                    max={selectedTable?.capacity || 20}
                    value={form.party_size} onChange={handleChange} className="input-field" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-body font-medium tracking-wide text-charcoal-800/60 mb-2 uppercase">From</label>
                  <input name="start_time" type="time" required
                    value={form.start_time} onChange={handleChange} className="input-field" />
                </div>
                <div>
                  <label className="block text-xs font-body font-medium tracking-wide text-charcoal-800/60 mb-2 uppercase">Until</label>
                  <input name="end_time" type="time" required
                    value={form.end_time} onChange={handleChange} className="input-field" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-body font-medium tracking-wide text-charcoal-800/60 mb-2 uppercase">Special requests</label>
                <textarea name="special_requests" rows={3}
                  value={form.special_requests} onChange={handleChange}
                  placeholder="Allergies, high chair, window seat..."
                  className="input-field resize-none" />
              </div>

              <button type="submit" disabled={submitting || !selectedTable}
                className="btn-primary w-full py-4 disabled:opacity-50">
                {submitting ? 'Reserving...' : 'Confirm Reservation'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
