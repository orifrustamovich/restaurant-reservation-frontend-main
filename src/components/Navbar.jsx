import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    toast.success('See you soon!')
    navigate('/')
  }

  const isActive = (path) => location.pathname === path

  return (
    <nav className="border-b border-charcoal-800/10 bg-cream-50/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-16">

        {/* Logo */}
        <Link to="/" className="font-display text-xl font-semibold tracking-tight text-charcoal-900">
          Table<span className="text-amber-500">Mate</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          <Link to="/restaurants"
            className={`text-sm font-body font-medium tracking-wide transition-colors
              ${isActive('/restaurants') ? 'text-charcoal-900' : 'text-charcoal-800/60 hover:text-charcoal-900'}`}>
            Restaurants
          </Link>

          {user && (
            <Link to="/reservations"
              className={`text-sm font-body font-medium tracking-wide transition-colors
                ${isActive('/reservations') ? 'text-charcoal-900' : 'text-charcoal-800/60 hover:text-charcoal-900'}`}>
              My Reservations
            </Link>
          )}

          {user?.role === 'owner' && (
            <Link to="/dashboard"
              className={`text-sm font-body font-medium tracking-wide transition-colors
                ${isActive('/dashboard') ? 'text-charcoal-900' : 'text-charcoal-800/60 hover:text-charcoal-900'}`}>
              Dashboard
            </Link>
          )}
        </div>

        {/* Auth buttons */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-4">
              <Link to="/profile"
                className="text-sm font-body font-medium text-charcoal-800/70 hover:text-charcoal-900 transition-colors">
                {user.email}
              </Link>
              <button onClick={handleLogout} className="btn-secondary text-xs py-2 px-4">
                Sign out
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className="btn-secondary text-xs py-2 px-4">Sign in</Link>
              <Link to="/register" className="btn-primary text-xs py-2 px-4">Get started</Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
          <div className="space-y-1.5">
            <span className={`block w-6 h-0.5 bg-charcoal-900 transition-all ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block w-6 h-0.5 bg-charcoal-900 transition-all ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-6 h-0.5 bg-charcoal-900 transition-all ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </div>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-charcoal-800/10 bg-cream-50 px-6 py-4 space-y-4 animate-slide-down">
          <Link to="/restaurants" onClick={() => setMenuOpen(false)} className="block text-sm font-body">Restaurants</Link>
          {user && <Link to="/reservations" onClick={() => setMenuOpen(false)} className="block text-sm font-body">My Reservations</Link>}
          {user?.role === 'owner' && <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="block text-sm font-body">Dashboard</Link>}
          <div className="divider" />
          {user ? (
            <button onClick={() => { handleLogout(); setMenuOpen(false) }} className="block text-sm font-body text-red-600">Sign out</button>
          ) : (
            <div className="flex gap-3">
              <Link to="/login" onClick={() => setMenuOpen(false)} className="btn-secondary text-xs py-2 px-4">Sign in</Link>
              <Link to="/register" onClick={() => setMenuOpen(false)} className="btn-primary text-xs py-2 px-4">Get started</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}
