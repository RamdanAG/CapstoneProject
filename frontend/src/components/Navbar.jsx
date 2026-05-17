import { Link } from 'react-router-dom'

export default function Navbar() {
  return (
    <nav className="bg-white shadow px-6 py-3 flex items-center gap-6">
      <Link to="/" className="font-bold text-lg text-blue-600">ARIS</Link>
      <Link to="/"        className="text-sm text-gray-600 hover:text-blue-600">Dashboard</Link>
      <Link to="/analyze" className="text-sm text-gray-600 hover:text-blue-600">Analisis Manual</Link>
    </nav>
  )
}
