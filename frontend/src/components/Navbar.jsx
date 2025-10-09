import { useState } from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 w-full bg-white shadow-md z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center p-4">
        {/* Logo / Marca */}
        <Link to="/" className="text-2xl font-bold text-green-700">
          Super Milas 🍽️
        </Link>

        {/* Menú Desktop */}
        <ul className="hidden md:flex space-x-8 text-gray-700 font-medium">
          <li><Link to="/">Inicio</Link></li>
          <li><Link to="/menu">Menú</Link></li>
          <li><Link to="/reservas">Reservas</Link></li>
          <li><Link to="/contacto">Contacto</Link></li>
        </ul>

        {/* Botón principal */}
        <Link
          to="/login"
          className="hidden md:inline-block bg-green-600 text-white px-5 py-2 rounded-full font-medium hover:bg-green-700 transition"
        >
          Pedir Ahora
        </Link>

        {/* Botón hamburguesa (Mobile) */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden flex flex-col space-y-1"
        >
          <span className="w-6 h-0.5 bg-gray-800"></span>
          <span className="w-6 h-0.5 bg-gray-800"></span>
          <span className="w-6 h-0.5 bg-gray-800"></span>
        </button>
      </div>

      {/* Menú Mobile */}
      {menuOpen && (
        <div className="md:hidden bg-white shadow-md">
          <ul className="flex flex-col items-center space-y-3 py-4">
            <li><Link to="/" onClick={() => setMenuOpen(false)}>Inicio</Link></li>
            <li><Link to="/menu" onClick={() => setMenuOpen(false)}>Menú</Link></li>
            <li><Link to="/reservas" onClick={() => setMenuOpen(false)}>Reservas</Link></li>
            <li><Link to="/contacto" onClick={() => setMenuOpen(false)}>Contacto</Link></li>
            <li>
              <Link
                to="/login"
                className="bg-green-600 text-white px-4 py-2 rounded-full font-medium hover:bg-green-700 transition"
                onClick={() => setMenuOpen(false)}
              >
                Pedir Ahora
              </Link>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
}
