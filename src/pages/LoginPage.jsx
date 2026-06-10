import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const user = await login(form)
      toast.success(`Welcome back!`)
      if (user.role === 'owner') navigate('/dashboard')
      else navigate('/restaurants')
    } catch (err) {
      const msg = err.response?.data?.non_field_errors?.[0]
        || err.response?.data?.detail
        || 'Login failed. Please try again.'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md animate-slide-up">

        <div className="mb-10">
          <p className="section-label mb-3">Welcome back</p>
          <h1 className="font-display text-4xl font-semibold">Sign in</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-body font-medium tracking-wide text-charcoal-800/60 mb-2 uppercase">
              Email
            </label>
            <input
              name="email" type="email" required
              value={form.email} onChange={handleChange}
              placeholder="you@example.com"
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-xs font-body font-medium tracking-wide text-charcoal-800/60 mb-2 uppercase">
              Password
            </label>
            <input
              name="password" type="password" required
              value={form.password} onChange={handleChange}
              placeholder="••••••••"
              className="input-field"
            />
          </div>

          <div className="pt-2">
            <button type="submit" disabled={loading}
              className="btn-primary w-full py-4 disabled:opacity-50">
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>

        <div className="divider" />

        <p className="text-sm font-body text-charcoal-800/60 text-center">
          Don't have an account?{' '}
          <Link to="/register" className="text-charcoal-900 font-medium hover:underline underline-offset-4">
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}
