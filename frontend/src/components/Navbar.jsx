import { Link } from 'react-router-dom'
import useAuth from '../hooks/useAuth'

export default function Navbar() {
  const { user, logout } = useAuth()

  return (
    <nav className="bg-white shadow px-6 py-3 flex items-center gap-6">
      <Link to="/" className="font-bold text-lg text-blue-600">MyApp</Link>
      <Link to="/" className="text-gray-700 hover:text-blue-600 text-sm">Home</Link>
      <Link to="/about" className="text-gray-700 hover:text-blue-600 text-sm">About</Link>
      <div className="ml-auto flex items-center gap-3">
        {user && (
          <>
            {user.avatar && <img src={user.avatar} className="w-8 h-8 rounded-full" alt="" />}
            <span className="text-sm text-gray-700">{user.name}</span>
            <button onClick={logout} className="text-sm text-red-500 hover:underline">Logout</button>
          </>
        )}
      </div>
    </nav>
  )
}
