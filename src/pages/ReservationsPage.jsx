import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { reservationAPI } from '../api/client'
import toast from 'react-hot-toast'
import { format, parseISO } from 'date-fns'

function StatusBadge({ status }) {
  return (
    <span className={`status-badge status-${status}`}>{status}</span>
  )
}

function ReservationCard({ res, onCancel }) {
  const [cancelling, setCancelling] = useState(false)

  const handleCancel = async () => {
    if (!window.confirm('Cancel this reservation?')) return
    setCancelling(true)
    try {
      await onCancel(res.id)
    } finally {
      setCancelling(false)
    }
  }

  const canCancel = ['pending', 'confirmed'].includes(res.status)

  return (
    <div className="card animate-fade-in">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="section-label mb-1">Reservation #{res.id}</p>
          <h3 className="font-display text-xl font-semibold">
            {res.restaurant_detail?.name || 'Restaurant'}
          </h3>
          <p className="text-xs font-body text-charcoal-800/50 mt-1">
            Table #{res.table_detail?.table_number} · {res.table_detail?.capacity} seats
          </p>
        </div>
        <StatusBadge status={res.status} />
      </div>

      <div className="divider my-4" />

      <div className="grid grid-cols-2 gap-4 text-sm font-body mb-4">
        <div>
          <p className="text-charcoal-800/50 text-xs uppercase tracking-wide mb-1">Date</p>
          <p className="font-medium">
            {format(parseISO(res.reservation_date), 'MMM d, yyyy')}
          </p>
        </div>
        <div>
          <p className="text-charcoal-800/50 text-xs uppercase tracking-wide mb-1">Time</p>
          <p className="font-medium">{res.start_time?.slice(0,5)} — {res.end_time?.slice(0,5)}</p>
        </div>
        <div>
          <p className="text-charcoal-800/50 text-xs uppercase tracking-wide mb-1">Party size</p>
          <p className="font-medium">{res.party_size} guests</p>
        </div>
        {res.special_requests && (
          <div>
            <p className="text-charcoal-800/50 text-xs uppercase tracking-wide mb-1">Requests</p>
            <p className="font-medium text-xs">{res.special_requests}</p>
          </div>
        )}
      </div>

      {canCancel && (
        <button onClick={handleCancel} disabled={cancelling} className="btn-danger text-xs">
          {cancelling ? 'Cancelling...' : 'Cancel reservation'}
        </button>
      )}
    </div>
  )
}

export default function ReservationsPage() {
  const [reservations, setReservations] = useState([])
  const [loading, setLoading]           = useState(true)
  const [statusFilter, setStatusFilter] = useState('')

  const fetchReservations = async () => {
    setLoading(true)
    try {
      const { data } = await reservationAPI.list({
        status: statusFilter || undefined,
      })
      setReservations(data.results ?? data)
    } catch {
      setReservations([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchReservations() }, [statusFilter])

  const handleCancel = async (id) => {
    try {
      await reservationAPI.cancel(id)
      toast.success('Reservation cancelled')
      fetchReservations()
    } catch (err) {
      const msg = err.response?.data?.error || 'Cannot cancel reservation'
      toast.error(msg)
    }
  }

  const statuses = ['', 'pending', 'confirmed', 'cancelled', 'completed']

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-10 flex-wrap gap-4">
        <div>
          <p className="section-label mb-3">Your bookings</p>
          <h1 className="font-display text-4xl font-semibold">My Reservations</h1>
        </div>
        <Link to="/restaurants" className="btn-secondary text-xs py-2 px-4">
          + New reservation
        </Link>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 mb-8 flex-wrap">
        {statuses.map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`text-xs font-body font-medium px-4 py-2 border transition-colors
              ${statusFilter === s
                ? 'bg-charcoal-900 text-cream-50 border-charcoal-900'
                : 'border-charcoal-800/20 text-charcoal-800/60 hover:border-charcoal-900 hover:text-charcoal-900'}`}>
            {s || 'All'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-charcoal-900 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : reservations.length === 0 ? (
        <div className="text-center py-20">
          <p className="font-display text-2xl text-charcoal-800/30">No reservations yet</p>
          <p className="font-body text-sm text-charcoal-800/40 mt-2 mb-6">
            Find a restaurant and make your first reservation
          </p>
          <Link to="/restaurants" className="btn-primary">Browse restaurants</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {reservations.map((r) => (
            <ReservationCard key={r.id} res={r} onCancel={handleCancel} />
          ))}
        </div>
      )}
    </div>
  )
}
