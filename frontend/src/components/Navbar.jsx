import { Link } from 'react-router-dom'

export default function Navbar() {
  return (
    <nav className="bg-white shadow px-6 py-3 flex gap-6 items-center">
      <span className="font-bold text-lg text-blue-600">MyApp</span>
      <Link to="/" className="text-gray-700 hover:text-blue-600">Home</Link>
      <Link to="/about" className="text-gray-700 hover:text-blue-600">About</Link>
    </nav>
  )
}
