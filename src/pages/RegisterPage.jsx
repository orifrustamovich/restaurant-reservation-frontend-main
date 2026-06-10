import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    email: '', username: '', password: '', password2: '',
    role: 'customer', phone: '',
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.password2) {
      toast.error('Passwords do not match')
      return
    }
    setLoading(true)
    try {
      const user = await register(form)
      toast.success('Account created!')
      if (user.role === 'owner') navigate('/dashboard')
      else navigate('/restaurants')
    } catch (err) {
      const data = err.response?.data
      const msg = data
        ? Object.values(data).flat()[0]
        : 'Registration failed.'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md animate-slide-up">

        <div className="mb-10">
          <p className="section-label mb-3">Join TableMate</p>
          <h1 className="font-display text-4xl font-semibold">Create account</h1>
        </div>

        {/* Role selector */}
        <div className="grid grid-cols-2 border border-charcoal-800/20 mb-6">
          {['customer', 'owner'].map((r) => (
            <button key={r} type="button"
              onClick={() => setForm({ ...form, role: r })}
              className={`py-3 text-sm font-body font-medium tracking-wide capitalize transition-colors
                ${form.role === r
                  ? 'bg-charcoal-900 text-cream-50'
                  : 'text-charcoal-800/60 hover:text-charcoal-900'}`}>
              {r === 'customer' ? 'Guest' : 'Restaurant Owner'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-body font-medium tracking-wide text-charcoal-800/60 mb-2 uppercase">Email</label>
            <input name="email" type="email" required value={form.email} onChange={handleChange}
              placeholder="you@example.com" className="input-field" />
          </div>

          <div>
            <label className="block text-xs font-body font-medium tracking-wide text-charcoal-800/60 mb-2 uppercase">Username</label>
            <input name="username" type="text" required value={form.username} onChange={handleChange}
              placeholder="johndoe" className="input-field" />
          </div>

          <div>
            <label className="block text-xs font-body font-medium tracking-wide text-charcoal-800/60 mb-2 uppercase">Phone</label>
            <input name="phone" type="tel" value={form.phone} onChange={handleChange}
              placeholder="+82 10 1234 5678" className="input-field" />
          </div>

          <div>
            <label className="block text-xs font-body font-medium tracking-wide text-charcoal-800/60 mb-2 uppercase">Password</label>
            <input name="password" type="password" required value={form.password} onChange={handleChange}
              placeholder="Min 8 characters" className="input-field" />
          </div>

          <div>
            <label className="block text-xs font-body font-medium tracking-wide text-charcoal-800/60 mb-2 uppercase">Confirm password</label>
            <input name="password2" type="password" required value={form.password2} onChange={handleChange}
              placeholder="••••••••" className="input-field" />
          </div>

          <div className="pt-2">
            <button type="submit" disabled={loading} className="btn-primary w-full py-4 disabled:opacity-50">
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </div>
        </form>

        <div className="divider" />
        <p className="text-sm font-body text-charcoal-800/60 text-center">
          Already have an account?{' '}
          <Link to="/login" className="text-charcoal-900 font-medium hover:underline underline-offset-4">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
