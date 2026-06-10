import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { authAPI } from '../api/client'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

export default function ProfilePage() {
  const { user, fetchProfile, logout } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: user?.username || '', phone: user?.phone || '' })
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSave = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await authAPI.updateProfile(form)
      await fetchProfile()
      toast.success('Profile updated!')
      setEditing(false)
    } catch (err) {
      const msg = Object.values(err.response?.data || {}).flat()[0] || 'Update failed'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const roleBadge = {
    customer: 'bg-blue-100 text-blue-700',
    owner:    'bg-amber-100 text-amber-700',
    admin:    'bg-purple-100 text-purple-700',
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <div className="mb-10">
        <p className="section-label mb-3">Account</p>
        <h1 className="font-display text-4xl font-semibold">Profile</h1>
      </div>

      <div className="card mb-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="w-14 h-14 bg-charcoal-900 text-cream-50 flex items-center justify-center
              font-display text-2xl font-semibold mb-4">
              {user?.email?.[0]?.toUpperCase()}
            </div>
            <h2 className="font-display text-2xl">{user?.username}</h2>
            <p className="text-sm font-body text-charcoal-800/60 mt-1">{user?.email}</p>
          </div>
          <span className={`status-badge ${roleBadge[user?.role] || ''}`}>
            {user?.role}
          </span>
        </div>

        <div className="divider" />

        {!editing ? (
          <div className="space-y-4">
            {[
              { label: 'Username', value: user?.username },
              { label: 'Email', value: user?.email },
              { label: 'Phone', value: user?.phone || '—' },
              { label: 'Member since', value: user?.date_joined
                  ? new Date(user.date_joined).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                  : '—' },
            ].map(f => (
              <div key={f.label} className="flex justify-between text-sm font-body">
                <span className="text-charcoal-800/50 uppercase tracking-wide text-xs">{f.label}</span>
                <span className="font-medium">{f.value}</span>
              </div>
            ))}
            <div className="pt-4">
              <button onClick={() => setEditing(true)} className="btn-secondary text-xs py-2 px-4">
                Edit profile
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-body font-medium tracking-wide text-charcoal-800/60 mb-2 uppercase">Username</label>
              <input name="username" value={form.username} onChange={handleChange} className="input-field" />
            </div>
            <div>
              <label className="block text-xs font-body font-medium tracking-wide text-charcoal-800/60 mb-2 uppercase">Phone</label>
              <input name="phone" value={form.phone} onChange={handleChange}
                placeholder="+82 10 1234 5678" className="input-field" />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={loading} className="btn-primary flex-1 disabled:opacity-50">
                {loading ? 'Saving...' : 'Save changes'}
              </button>
              <button type="button" onClick={() => setEditing(false)} className="btn-secondary flex-1">
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Danger zone */}
      <div className="border border-red-200 p-6">
        <p className="section-label text-red-400 mb-3">Session</p>
        <p className="text-sm font-body text-charcoal-800/60 mb-4">
          Sign out from your current session.
        </p>
        <button onClick={handleLogout} className="btn-danger">Sign out</button>
      </div>
    </div>
  )
}
