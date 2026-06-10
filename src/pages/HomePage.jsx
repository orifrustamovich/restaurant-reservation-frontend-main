import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function HomePage() {
  const { user } = useAuth()

  return (
    <div className="min-h-[calc(100vh-64px)]">

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-20">
        <div className="max-w-3xl">
          <p className="section-label mb-6">Restaurant Reservation Platform</p>
          <h1 className="font-display text-6xl md:text-7xl font-bold leading-tight text-charcoal-900 mb-8">
            Reserve your<br />
            <span className="italic font-normal text-amber-500">perfect table</span>
          </h1>
          <p className="font-body text-lg text-charcoal-800/60 leading-relaxed mb-10 max-w-xl">
            Discover exceptional restaurants and secure your reservation in seconds.
            No waiting, no hassle — just great dining experiences.
          </p>
          <div className="flex gap-4 flex-wrap">
            <Link to="/restaurants" className="btn-primary text-sm px-8 py-4">
              Browse Restaurants
            </Link>
            {!user && (
              <Link to="/register" className="btn-secondary text-sm px-8 py-4">
                Create Account
              </Link>
            )}
            {user && (
              <Link to="/reservations" className="btn-secondary text-sm px-8 py-4">
                My Reservations
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Decorative line */}
      <div className="max-w-6xl mx-auto px-6">
        <div className="border-t border-charcoal-800/10" />
      </div>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <p className="section-label mb-12">How it works</p>
        <div className="grid md:grid-cols-3 gap-12">
          {[
            { num: '01', title: 'Find a restaurant', desc: 'Browse our curated list of restaurants. Filter by rating, location, or availability.' },
            { num: '02', title: 'Choose your table', desc: 'Select the perfect table for your party size. See real-time availability.' },
            { num: '03', title: 'Confirm & enjoy', desc: 'Get instant confirmation and reminders. Just show up and enjoy your meal.' },
          ].map((f) => (
            <div key={f.num} className="group">
              <span className="font-mono text-4xl font-medium text-charcoal-800/10 group-hover:text-amber-400 transition-colors duration-300">
                {f.num}
              </span>
              <h3 className="font-display text-xl mt-4 mb-3">{f.title}</h3>
              <p className="font-body text-sm text-charcoal-800/60 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA for owners */}
      <section className="bg-charcoal-900 text-cream-50">
        <div className="max-w-6xl mx-auto px-6 py-16 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <p className="section-label text-cream-200/50 mb-3">For restaurant owners</p>
            <h2 className="font-display text-3xl font-semibold">Manage your reservations<br />with ease</h2>
          </div>
          <Link to="/register" className="shrink-0 bg-amber-500 text-charcoal-900 font-body font-semibold
            px-8 py-4 text-sm tracking-wide hover:bg-amber-400 transition-colors">
            Register as owner
          </Link>
        </div>
      </section>

    </div>
  )
}
