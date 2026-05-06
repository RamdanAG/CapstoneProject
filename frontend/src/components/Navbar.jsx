import { Link } from 'react-router-dom'
import useAuth from '../hooks/useAuth'

export default function Navbar() {
  const { user, loading, login, logout } = useAuth()

  return (
    <nav className="bg-white shadow px-6 py-3 flex items-center gap-6">
      <span className="font-bold text-lg text-blue-600">MyApp</span>
      <Link to="/" className="text-gray-700 hover:text-blue-600">Home</Link>
      <Link to="/about" className="text-gray-700 hover:text-blue-600">About</Link>
      <div className="ml-auto flex items-center gap-3">
        {loading ? null : user ? (
          <>
            <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full" />
            <span className="text-sm text-gray-700">{user.name}</span>
            <button onClick={logout} className="text-sm text-red-500 hover:underline">Logout</button>
          </>
        ) : (
          <button
            onClick={login}
            className="flex items-center gap-2 bg-white border border-gray-300 rounded px-3 py-1.5 text-sm hover:bg-gray-50 shadow-sm"
          >
            <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="G" />
            Login dengan Google
          </button>
        )}
      </div>
    </nav>
  )
}
