# TableMate — Restaurant Reservation Frontend

React frontend for the Restaurant Reservation API. Built with Vite, TailwindCSS, and React Router.

## Tech Stack

| Technology | Purpose |
|---|---|
| React 18 | UI framework |
| Vite | Build tool |
| React Router v6 | Client-side routing |
| Axios | HTTP client + JWT interceptors |
| TailwindCSS | Styling |
| react-hot-toast | Notifications |
| date-fns | Date formatting |

## Features

- JWT authentication (login, register, logout, auto-refresh)
- Role-based views (Customer / Owner / Admin)
- Restaurant browsing with search & filter
- Real-time table selection
- Reservation creation with conflict prevention
- Owner dashboard (restaurant, table, reservation management)
- Profile management

## Quick Start

```bash
git clone https://github.com/yourusername/restaurant-reservation-frontend.git
cd restaurant-reservation-frontend

npm install
npm run dev
```

Make sure the backend is running at `http://localhost:8000`.

App runs at: **http://localhost:3000**

## Pages

| Route | Description | Auth |
|---|---|---|
| `/` | Home page | Any |
| `/restaurants` | Restaurant list with search | Any |
| `/restaurants/:id` | Detail + reservation form | Any (reserve = auth) |
| `/login` | Sign in | Guest |
| `/register` | Create account | Guest |
| `/reservations` | My reservations | Customer |
| `/dashboard` | Owner management panel | Owner |
| `/profile` | Account settings | Auth |

## Backend Connection

The Vite dev server proxies `/api` requests to `http://localhost:8000`.

For production, set `VITE_API_URL` in `.env`:

```env
VITE_API_URL=https://your-backend-domain.com
```

## Project Structure

```
src/
├── api/
│   └── client.js        # Axios instance + all API functions
├── context/
│   └── AuthContext.jsx  # Global auth state
├── pages/
│   ├── HomePage.jsx
│   ├── LoginPage.jsx
│   ├── RegisterPage.jsx
│   ├── RestaurantsPage.jsx
│   ├── RestaurantDetailPage.jsx
│   ├── ReservationsPage.jsx
│   ├── DashboardPage.jsx
│   └── ProfilePage.jsx
├── components/
│   └── Navbar.jsx
├── App.jsx
├── main.jsx
└── index.css
```
