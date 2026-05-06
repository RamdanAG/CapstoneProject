import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import About from './pages/About'
import Login from './pages/Login'
import Register from './pages/Register'
import NotFound from './pages/NotFound'
import useAuth from './hooks/useAuth'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  return user ? children : <Navigate to="/login" replace />
}

function GuestRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  return !user ? children : <Navigate to="/" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Guest only */}
        <Route path="/login"    element={<GuestRoute><Login /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />

        {/* Layout dengan Navbar */}
        <Route path="/*" element={
          <>
            <Navbar />
            <main className="min-h-screen bg-gray-50 p-4">
              <Routes>
                <Route path="/"     element={<PrivateRoute><Home /></PrivateRoute>} />
                <Route path="/about" element={<About />} />
                <Route path="*"     element={<NotFound />} />
              </Routes>
            </main>
          </>
        } />
      </Routes>
    </BrowserRouter>
  )
}
