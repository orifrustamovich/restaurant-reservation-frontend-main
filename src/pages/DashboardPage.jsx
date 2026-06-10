import { useState, useEffect } from 'react'
import { restaurantAPI, tableAPI, reservationAPI } from '../api/client'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { format, parseISO } from 'date-fns'

// ── Modals ────────────────────────────────────────

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-charcoal-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <div className="bg-cream-50 w-full max-w-lg border border-charcoal-800/20 animate-slide-up">
        <div className="flex items-center justify-between px-6 py-4 border-b border-charcoal-800/10">
          <h3 className="font-display text-xl">{title}</h3>
          <button onClick={onClose} className="text-charcoal-800/40 hover:text-charcoal-900 text-xl leading-none">×</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

function RestaurantForm({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial || {
    name: '', description: '', address: '', phone: '',
    email: '', opening_time: '09:00', closing_time: '22:00',
  })
  const [loading, setLoading] = useState(false)
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onSave(form)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {[
        { name: 'name', label: 'Restaurant name', type: 'text', required: true },
        { name: 'address', label: 'Address', type: 'text', required: true },
        { name: 'phone', label: 'Phone', type: 'tel' },
        { name: 'email', label: 'Email', type: 'email' },
      ].map(f => (
        <div key={f.name}>
          <label className="block text-xs font-body font-medium tracking-wide text-charcoal-800/60 mb-2 uppercase">{f.label}</label>
          <input name={f.name} type={f.type} required={f.required}
            value={form[f.name] || ''} onChange={handleChange} className="input-field" />
        </div>
      ))}
      <div>
        <label className="block text-xs font-body font-medium tracking-wide text-charcoal-800/60 mb-2 uppercase">Description</label>
        <textarea name="description" rows={3} value={form.description || ''} onChange={handleChange}
          className="input-field resize-none" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-body font-medium tracking-wide text-charcoal-800/60 mb-2 uppercase">Opens</label>
          <input name="opening_time" type="time" required value={form.opening_time} onChange={handleChange} className="input-field" />
        </div>
        <div>
          <label className="block text-xs font-body font-medium tracking-wide text-charcoal-800/60 mb-2 uppercase">Closes</label>
          <input name="closing_time" type="time" required value={form.closing_time} onChange={handleChange} className="input-field" />
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={loading} className="btn-primary flex-1 disabled:opacity-50">
          {loading ? 'Saving...' : 'Save'}
        </button>
        <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
      </div>
    </form>
  )
}

function TableForm({ restaurantId, initial, onSave, onClose }) {
  const [form, setForm] = useState(initial || { table_number: '', capacity: 2, description: '', is_available: true })
  const [loading, setLoading] = useState(false)
  const handleChange = (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm({ ...form, [e.target.name]: val })
  }
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try { await onSave({ ...form, restaurant: restaurantId }) }
    finally { setLoading(false) }
  }
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-body font-medium tracking-wide text-charcoal-800/60 mb-2 uppercase">Table #</label>
          <input name="table_number" type="number" required min={1}
            value={form.table_number} onChange={handleChange} className="input-field" />
        </div>
        <div>
          <label className="block text-xs font-body font-medium tracking-wide text-charcoal-800/60 mb-2 uppercase">Capacity</label>
          <input name="capacity" type="number" required min={1} max={20}
            value={form.capacity} onChange={handleChange} className="input-field" />
        </div>
      </div>
      <div>
        <label className="block text-xs font-body font-medium tracking-wide text-charcoal-800/60 mb-2 uppercase">Description</label>
        <input name="description" type="text" value={form.description || ''} onChange={handleChange}
          placeholder="Window seat, outdoor, VIP..." className="input-field" />
      </div>
      <label className="flex items-center gap-3 cursor-pointer">
        <input type="checkbox" name="is_available" checked={form.is_available} onChange={handleChange} className="w-4 h-4" />
        <span className="text-sm font-body">Available</span>
      </label>
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={loading} className="btn-primary flex-1 disabled:opacity-50">
          {loading ? 'Saving...' : 'Save'}
        </button>
        <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
      </div>
    </form>
  )
}

// ── Main Dashboard ────────────────────────────────

export default function DashboardPage() {
  const { user } = useAuth()
  const [restaurants, setRestaurants] = useState([])
  const [selectedRest, setSelectedRest] = useState(null)
  const [tables, setTables]             = useState([])
  const [reservations, setReservations] = useState([])
  const [loading, setLoading]           = useState(true)
  const [tab, setTab]                   = useState('overview')

  const [modal, setModal] = useState(null)
  // modal: null | 'new-restaurant' | 'edit-restaurant' | 'new-table' | 'edit-table'
  const [editTarget, setEditTarget] = useState(null)

  useEffect(() => { fetchRestaurants() }, [])
  useEffect(() => { if (selectedRest) { fetchTables(); fetchReservations() } }, [selectedRest])

  const fetchRestaurants = async () => {
    setLoading(true)
    try {
      const { data } = await restaurantAPI.myRestaurants()
      const list = data.results ?? data
      setRestaurants(list)
      if (list.length > 0) setSelectedRest(list[0])
    } catch { setRestaurants([]) }
    finally { setLoading(false) }
  }

  const fetchTables = async () => {
    try {
      const { data } = await restaurantAPI.tables(selectedRest.id)
      setTables(data.results ?? data)
    } catch { setTables([]) }
  }

  const fetchReservations = async () => {
    try {
      const { data } = await reservationAPI.list({ restaurant: selectedRest.id })
      setReservations(data.results ?? data)
    } catch { setReservations([]) }
  }

  // ── Restaurant CRUD ──
  const handleSaveRestaurant = async (form) => {
    try {
      if (modal === 'new-restaurant') {
        await restaurantAPI.create(form)
        toast.success('Restaurant created!')
      } else {
        await restaurantAPI.update(editTarget.id, form)
        toast.success('Restaurant updated!')
      }
      setModal(null)
      fetchRestaurants()
    } catch (err) {
      const msg = Object.values(err.response?.data || {}).flat()[0] || 'Error saving restaurant'
      toast.error(msg)
      throw err
    }
  }

  const handleDeleteRestaurant = async (id) => {
    if (!window.confirm('Delete this restaurant?')) return
    try {
      await restaurantAPI.delete(id)
      toast.success('Deleted')
      fetchRestaurants()
    } catch { toast.error('Cannot delete') }
  }

  // ── Table CRUD ──
  const handleSaveTable = async (form) => {
    try {
      if (modal === 'new-table') {
        await tableAPI.create(form)
        toast.success('Table added!')
      } else {
        await tableAPI.update(editTarget.id, form)
        toast.success('Table updated!')
      }
      setModal(null)
      fetchTables()
    } catch (err) {
      const msg = Object.values(err.response?.data || {}).flat()[0] || 'Error saving table'
      toast.error(msg)
      throw err
    }
  }

  const handleDeleteTable = async (id) => {
    if (!window.confirm('Delete this table?')) return
    try {
      await tableAPI.delete(id)
      toast.success('Table deleted')
      fetchTables()
    } catch { toast.error('Cannot delete') }
  }

  // ── Reservation actions ──
  const handleConfirm = async (id) => {
    try {
      await reservationAPI.confirm(id)
      toast.success('Reservation confirmed!')
      fetchReservations()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Cannot confirm')
    }
  }

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this reservation?')) return
    try {
      await reservationAPI.cancel(id)
      toast.success('Cancelled')
      fetchReservations()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Cannot cancel')
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-2 border-charcoal-900 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const pendingCount   = reservations.filter(r => r.status === 'pending').length
  const confirmedCount = reservations.filter(r => r.status === 'confirmed').length

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">

      {/* Header */}
      <div className="flex items-start justify-between mb-10 flex-wrap gap-4">
        <div>
          <p className="section-label mb-3">Owner panel</p>
          <h1 className="font-display text-4xl font-semibold">Dashboard</h1>
        </div>
        <button onClick={() => setModal('new-restaurant')} className="btn-primary text-xs py-2 px-4">
          + New Restaurant
        </button>
      </div>

      {restaurants.length === 0 ? (
        <div className="text-center py-20 card">
          <p className="font-display text-2xl text-charcoal-800/30 mb-4">No restaurants yet</p>
          <button onClick={() => setModal('new-restaurant')} className="btn-primary">
            Create your first restaurant
          </button>
        </div>
      ) : (
        <div className="grid lg:grid-cols-4 gap-8">

          {/* Sidebar — restaurant list */}
          <div className="lg:col-span-1">
            <p className="section-label mb-4">My Restaurants</p>
            <div className="space-y-2">
              {restaurants.map((r) => (
                <button key={r.id}
                  onClick={() => setSelectedRest(r)}
                  className={`w-full text-left px-4 py-3 border text-sm font-body font-medium transition-all
                    ${selectedRest?.id === r.id
                      ? 'bg-charcoal-900 text-cream-50 border-charcoal-900'
                      : 'border-charcoal-800/20 hover:border-charcoal-900'}`}>
                  {r.name}
                </button>
              ))}
            </div>
          </div>

          {/* Main content */}
          {selectedRest && (
            <div className="lg:col-span-3">

              {/* Restaurant header */}
              <div className="card mb-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="font-display text-2xl font-semibold">{selectedRest.name}</h2>
                    <p className="text-sm font-body text-charcoal-800/60 mt-1">{selectedRest.address}</p>
                    <p className="text-xs font-body text-charcoal-800/40 mt-1">
                      {selectedRest.opening_time?.slice(0,5)} — {selectedRest.closing_time?.slice(0,5)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setEditTarget(selectedRest); setModal('edit-restaurant') }}
                      className="btn-secondary text-xs py-1.5 px-3">Edit</button>
                    <button onClick={() => handleDeleteRestaurant(selectedRest.id)}
                      className="btn-danger text-xs py-1.5 px-3">Delete</button>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-charcoal-800/10">
                  {[
                    { label: 'Tables', value: tables.length },
                    { label: 'Pending', value: pendingCount },
                    { label: 'Confirmed', value: confirmedCount },
                  ].map(s => (
                    <div key={s.label} className="text-center">
                      <p className="font-mono text-3xl font-medium">{s.value}</p>
                      <p className="text-xs font-body text-charcoal-800/50 mt-1 uppercase tracking-wide">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-charcoal-800/10 mb-6">
                {['overview', 'tables', 'reservations'].map((t) => (
                  <button key={t} onClick={() => setTab(t)}
                    className={`px-6 py-3 text-sm font-body font-medium capitalize border-b-2 transition-colors
                      ${tab === t
                        ? 'border-charcoal-900 text-charcoal-900'
                        : 'border-transparent text-charcoal-800/50 hover:text-charcoal-900'}`}>
                    {t}
                  </button>
                ))}
              </div>

              {/* Tables tab */}
              {tab === 'tables' && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <p className="font-display text-xl">Tables</p>
                    <button onClick={() => setModal('new-table')} className="btn-primary text-xs py-2 px-4">
                      + Add Table
                    </button>
                  </div>
                  {tables.length === 0 ? (
                    <div className="card text-center py-10">
                      <p className="text-charcoal-800/40 font-body mb-4">No tables yet</p>
                      <button onClick={() => setModal('new-table')} className="btn-secondary text-xs py-2 px-4">
                        Add first table
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      {tables.map((t) => (
                        <div key={t.id} className="card">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-mono text-sm font-medium">Table #{t.table_number}</span>
                            <span className={`w-2 h-2 rounded-full ${t.is_available ? 'bg-green-500' : 'bg-red-400'}`} />
                          </div>
                          <p className="text-xs font-body text-charcoal-800/60">{t.capacity} seats</p>
                          {t.description && <p className="text-xs font-body text-charcoal-800/40 mt-1">{t.description}</p>}
                          <div className="flex gap-2 mt-3">
                            <button onClick={() => { setEditTarget(t); setModal('edit-table') }}
                              className="btn-secondary text-xs py-1 px-3">Edit</button>
                            <button onClick={() => handleDeleteTable(t.id)}
                              className="btn-danger text-xs py-1 px-3">Delete</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Reservations tab */}
              {tab === 'reservations' && (
                <div>
                  <p className="font-display text-xl mb-4">Reservations</p>
                  {reservations.length === 0 ? (
                    <div className="card text-center py-10">
                      <p className="text-charcoal-800/40 font-body">No reservations yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {reservations.map((r) => (
                        <div key={r.id} className="card">
                          <div className="flex items-start justify-between flex-wrap gap-3">
                            <div>
                              <p className="font-body font-medium text-sm">{r.customer_email}</p>
                              <p className="text-xs font-body text-charcoal-800/50 mt-0.5">
                                Table #{r.table_detail?.table_number} ·{' '}
                                {r.reservation_date} ·{' '}
                                {r.start_time?.slice(0,5)}–{r.end_time?.slice(0,5)} ·{' '}
                                {r.party_size} guests
                              </p>
                              {r.special_requests && (
                                <p className="text-xs font-body text-charcoal-800/40 mt-1 italic">
                                  "{r.special_requests}"
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`status-badge status-${r.status}`}>{r.status}</span>
                              {r.status === 'pending' && (
                                <button onClick={() => handleConfirm(r.id)}
                                  className="text-xs font-body font-medium text-green-700 border border-green-300
                                    px-3 py-1 hover:bg-green-700 hover:text-white hover:border-green-700 transition-colors">
                                  Confirm
                                </button>
                              )}
                              {['pending', 'confirmed'].includes(r.status) && (
                                <button onClick={() => handleCancel(r.id)}
                                  className="btn-danger text-xs py-1 px-3">
                                  Cancel
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Overview tab */}
              {tab === 'overview' && (
                <div className="space-y-4">
                  <p className="font-display text-xl mb-4">Recent Activity</p>
                  {reservations.slice(0, 5).map((r) => (
                    <div key={r.id} className="flex items-center justify-between py-3 border-b border-charcoal-800/10">
                      <div>
                        <p className="text-sm font-body font-medium">{r.customer_email}</p>
                        <p className="text-xs text-charcoal-800/50 font-body">
                          {r.reservation_date} · {r.party_size} guests
                        </p>
                      </div>
                      <span className={`status-badge status-${r.status}`}>{r.status}</span>
                    </div>
                  ))}
                  {reservations.length === 0 && (
                    <p className="text-charcoal-800/40 font-body text-sm">No recent activity</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {modal === 'new-restaurant' && (
        <Modal title="New Restaurant" onClose={() => setModal(null)}>
          <RestaurantForm onSave={handleSaveRestaurant} onClose={() => setModal(null)} />
        </Modal>
      )}
      {modal === 'edit-restaurant' && (
        <Modal title="Edit Restaurant" onClose={() => setModal(null)}>
          <RestaurantForm initial={editTarget} onSave={handleSaveRestaurant} onClose={() => setModal(null)} />
        </Modal>
      )}
      {modal === 'new-table' && (
        <Modal title="Add Table" onClose={() => setModal(null)}>
          <TableForm restaurantId={selectedRest?.id} onSave={handleSaveTable} onClose={() => setModal(null)} />
        </Modal>
      )}
      {modal === 'edit-table' && (
        <Modal title="Edit Table" onClose={() => setModal(null)}>
          <TableForm restaurantId={selectedRest?.id} initial={editTarget} onSave={handleSaveTable} onClose={() => setModal(null)} />
        </Modal>
      )}
    </div>
  )
}
