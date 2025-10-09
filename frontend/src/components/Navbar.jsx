import React, { useState } from 'react';
import { ShoppingCart, User, MapPin, Menu, X } from 'lucide-react';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-gradient-to-r from-orange-500 to-orange-400 text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Ubicación - Solo Desktop */}
          <div className="hidden md:flex items-center space-x-2 text-sm">
            <MapPin className="w-4 h-4" />
            <div>
              <p className="font-semibold">Chaco Resistencia</p>
              <p className="text-xs opacity-90">Vezla 404</p>
            </div>
          </div>

          {/* Logo Central */}
          <div className="flex-1 flex justify-center md:flex-none">
            <div className="flex items-center space-x-2">
              <div className="bg-white rounded-full p-1">
                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xs">SM</span>
                </div>
              </div>
              <div className="text-left">
                <h1 className="font-bold text-xl leading-tight">SUPER MILAS</h1>
                <p className="text-xs opacity-90">Resistencia</p>
              </div>
            </div>
          </div>

          {/* Botones Derecha - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            <button className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 transition-colors px-4 py-2 rounded-lg">
              <ShoppingCart className="w-5 h-5" />
              <span className="font-medium">Carrito</span>
            </button>
            <button className="flex items-center space-x-2 bg-white text-orange-500 hover:bg-orange-50 transition-colors px-4 py-2 rounded-lg font-medium">
              <User className="w-5 h-5" />
              <span>Perfil</span>
            </button>
          </div>

          {/* Botones Mobile */}
          <div className="flex md:hidden items-center space-x-2">
            <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <ShoppingCart className="w-6 h-6" />
            </button>
            <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <User className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Ubicación Mobile */}
        <div className="md:hidden pb-3 flex items-center justify-center space-x-2 text-sm border-t border-white/20 pt-2">
          <MapPin className="w-4 h-4" />
          <span className="font-medium">Chaco Resistencia - Vezla 404</span>
        </div>
      </div>
    </nav>
  );
}