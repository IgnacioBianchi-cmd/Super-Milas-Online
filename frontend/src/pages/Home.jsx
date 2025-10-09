import React from 'react';
import { ShoppingCart, User, MapPin, Heart, Clock, CreditCard, Star, Phone, Mail, Instagram } from 'lucide-react';

// Navbar Component
function Navbar() {
  return (
    <nav className="relative bg-gradient-to-r from-orange-500 to-orange-400 text-white sticky top-0 z-50 shadow-lg overflow-hidden">
      {/* Patrón de mantel */}
      <div className="absolute inset-0 opacity-20">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="checkered-navbar" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <rect x="0" y="0" width="20" height="20" fill="#FCD34D"/>
              <rect x="20" y="0" width="20" height="20" fill="#F59E0B"/>
              <rect x="0" y="20" width="20" height="20" fill="#F59E0B"/>
              <rect x="20" y="20" width="20" height="20" fill="#FCD34D"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#checkered-navbar)"/>
        </svg>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="hidden md:flex items-center space-x-2 text-sm">
            <MapPin className="w-4 h-4" />
            <div>
              <p className="font-semibold">Chaco Resistencia</p>
              <p className="text-xs opacity-90">Vezla 404</p>
            </div>
          </div>
          
          <div className="flex-1 flex justify-center md:flex-none">
            <div className="flex items-center space-x-2">
              <div className="bg-white rounded-full p-0.5 w-12 h-12 overflow-hidden flex items-center justify-center">
                <img 
                  src="/logo-super-milas.jpg" 
                  alt="Super Milas" 
                  className="w-full h-full object-cover scale-110"
                />
              </div>
              <div className="text-left">
                <h1 className="font-bold text-xl leading-tight">SUPER MILAS</h1>
                <p className="text-xs opacity-90">Resistencia</p>
              </div>
            </div>
          </div>
          
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
          
          <div className="flex md:hidden items-center space-x-2">
            <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <ShoppingCart className="w-6 h-6" />
            </button>
            <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <User className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        <div className="md:hidden pb-3 flex items-center justify-center space-x-2 text-sm border-t border-white/20 pt-2">
          <MapPin className="w-4 h-4" />
          <span className="font-medium">Chaco Resistencia - Vezla 404</span>
        </div>
      </div>
    </nav>
  );
}

// Hero Section
function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-yellow-400 via-orange-400 to-orange-500 overflow-hidden min-h-screen flex items-center">
      {/* Patrón de mantel */}
      <div className="absolute inset-0 opacity-15">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="checkered-hero" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
              <rect x="0" y="0" width="30" height="30" fill="#FCD34D"/>
              <rect x="30" y="0" width="30" height="30" fill="#F59E0B"/>
              <rect x="0" y="30" width="30" height="30" fill="#F59E0B"/>
              <rect x="30" y="30" width="30" height="30" fill="#FCD34D"/>
              {/* Puntos decorativos */}
              <circle cx="15" cy="15" r="1.5" fill="#FB923C" opacity="0.5"/>
              <circle cx="45" cy="15" r="1.5" fill="#FB923C" opacity="0.5"/>
              <circle cx="15" cy="45" r="1.5" fill="#FB923C" opacity="0.5"/>
              <circle cx="45" cy="45" r="1.5" fill="#FB923C" opacity="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#checkered-hero)"/>
        </svg>
      </div>
      
      <div className="relative w-full max-w-7xl mx-auto px-4 py-16 text-center text-white">
        {/* Logo Super Milas */}
        <div className="flex flex-col items-center mb-8 animate-fade-in">
          <div className="relative mb-6">
            <div className="w-40 h-40 md:w-52 md:h-52 bg-white rounded-full shadow-2xl overflow-hidden flex items-center justify-center transform hover:scale-110 transition-transform duration-300">
              <img 
                src="/logo-super-milas.jpg" 
                alt="Super Milas Logo" 
                className="w-full h-full object-cover scale-110"
              />
            </div>
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-orange-900 px-4 py-2 rounded-full text-sm font-bold shadow-lg flex items-center space-x-1 animate-bounce whitespace-nowrap">
              <Star className="w-4 h-4 fill-current" />
              <span>SUC. RESISTENCIA</span>
            </div>
          </div>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold mb-4 drop-shadow-lg">
          SUPER MILAS
        </h1>
        <p className="text-2xl md:text-3xl mb-8 font-light opacity-90">
          Comidas Caseras con Amor
        </p>
        
        <p className="text-lg md:text-xl mb-10 max-w-3xl mx-auto">
          Las mejores empanadas, milanesas y comidas caseras de Chaco y Corrientes. ¡Delivery rápido a tu domicilio!
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <button className="bg-yellow-400 hover:bg-yellow-300 text-orange-900 px-8 py-4 rounded-xl font-bold text-lg shadow-xl transition-all transform hover:scale-105 flex items-center space-x-2">
            <span>Pedir Ahora</span>
            <ShoppingCart className="w-5 h-5" />
          </button>
          <button className="bg-white hover:bg-gray-100 text-red-600 px-8 py-4 rounded-xl font-bold text-lg shadow-xl transition-all transform hover:scale-105">
            Ver Promociones
          </button>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          <div className="backdrop-blur-sm bg-white/10 rounded-xl p-4">
            <div className="text-4xl md:text-5xl font-bold mb-1">4+</div>
            <div className="text-sm md:text-base opacity-90">Sucursales</div>
          </div>
          <div className="backdrop-blur-sm bg-white/10 rounded-xl p-4">
            <div className="text-4xl md:text-5xl font-bold mb-1">8</div>
            <div className="text-sm md:text-base opacity-90">Categorías</div>
          </div>
          <div className="backdrop-blur-sm bg-white/10 rounded-xl p-4">
            <div className="text-4xl md:text-5xl font-bold mb-1">30'</div>
            <div className="text-sm md:text-base opacity-90">Delivery</div>
          </div>
          <div className="backdrop-blur-sm bg-white/10 rounded-xl p-4">
            <div className="text-4xl md:text-5xl font-bold mb-1">5★</div>
            <div className="text-sm md:text-base opacity-90">Calidad</div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Categories Section
function CategoriesSection() {
  const categories = [
    { name: 'Empanadas', desc: 'Carne, pollo, jamón y queso', img: '🥟', popular: true },
    { name: 'Milanesas', desc: 'Carne, pollo y promociones', img: '🍗', popular: true },
    { name: 'Guarniciones', desc: 'Papas fritas, puré y más', img: '🍟' },
    { name: 'Pastas', desc: 'Tallarines, ravioles, ñoquis', img: '🍝' },
    { name: 'Postres', desc: 'Chocotorta, flan, budín', img: '🍰' },
    { name: 'Sandwiches', desc: 'Común, especial, completo', img: '🥪' },
    { name: 'Tartas', desc: 'Verduras, atún, jamón y queso', img: '🥧' },
    { name: 'Variedades', desc: 'Carne al horno, tortilla, sopa', img: '🍲' }
  ];
  
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-4xl md:text-5xl font-bold text-center text-red-600 mb-4">
          Nuestras Especialidades
        </h2>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          Descubre nuestras deliciosas opciones preparadas con ingredientes frescos y mucho amor
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat, idx) => (
            <div key={idx} className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer transform hover:-translate-y-2">
              {cat.popular && (
                <div className="absolute top-4 left-4 bg-yellow-400 text-orange-900 px-3 py-1 rounded-full text-xs font-bold z-10 shadow-md">
                  Popular
                </div>
              )}
              
              <div className="aspect-video bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center text-8xl">
                {cat.img}
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{cat.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{cat.desc}</p>
                <div className="flex items-center justify-between">
                  <span className="text-orange-600 font-semibold text-sm">Ver más</span>
                  <div className="bg-orange-500 text-white w-8 h-8 rounded-full flex items-center justify-center group-hover:bg-orange-600 transition-colors">
                    <span className="text-lg">→</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Combos Section
function CombosSection() {
  const combos = [
    { name: 'Combo Familiar', desc: '4 Milanesas + Papas grandes + Bebida', icon: '🔥' },
    { name: 'Combo Estudiante', desc: 'Milanesa + Papas + Bebida', icon: '🎓' },
    { name: 'Combo Empanadas', desc: '12 Empanadas surtidas + Bebida', icon: '🥟' }
  ];
  
  return (
    <section className="py-16 bg-red-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-red-600 text-white px-6 py-2 rounded-full mb-4 text-lg font-bold shadow-lg">
            <span>🔥</span>
            <span>Combos Especiales</span>
          </div>
          <p className="text-gray-700 text-lg">
            Ahorra más con nuestros combos familiares y promociones especiales
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {combos.map((combo, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
              <div className="text-6xl mb-4 text-center">{combo.icon}</div>
              <h3 className="text-2xl font-bold text-red-600 mb-3 text-center">{combo.name}</h3>
              <p className="text-gray-600 text-center">{combo.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Why Us Section
function WhyUsSection() {
  const features = [
    { icon: <Heart className="w-12 h-12" />, title: 'Comidas Caseras', desc: 'Preparadas con amor y ingredientes frescos, como en casa', color: 'red' },
    { icon: <Clock className="w-12 h-12" />, title: 'Delivery Rápido', desc: '30-45 minutos y tu pedido está en tu puerta', color: 'blue' },
    { icon: <CreditCard className="w-12 h-12" />, title: 'Múltiples Pagos', desc: 'Efectivo, transferencia bancaria y más opciones', color: 'green' }
  ];
  
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-4">
          <span className="bg-yellow-400 text-orange-900 px-6 py-2 rounded-full font-bold inline-block mb-6">
            ¿Por qué elegir Super Milas?
          </span>
        </div>
        
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">
          Más que comida, es <span className="text-yellow-500">experiencia</span>
        </h2>
        
        <p className="text-center text-gray-600 mb-12 max-w-3xl mx-auto">
          Desde 2020 llevamos el sabor casero a tu hogar con la calidad y cariño que nos caracteriza.
          Descubre por qué somos la elección preferida en Chaco y Corrientes.
        </p>
        
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <div key={idx} className="text-center p-8 rounded-2xl hover:bg-gray-50 transition-all">
              <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-${feature.color}-100 text-${feature.color}-600 mb-6`}>
                {feature.icon}
              </div>
              <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Testimonials Section
function TestimonialsSection() {
  const testimonials = [
    { text: 'Las mejores empanadas de Resistencia. Siempre calientes y con mucho relleno.', author: 'María G.', rating: 5 },
    { text: 'El delivery súper rápido y las milanesas están buenísimas. Muy recomendable.', author: 'Carlos M.', rating: 5 },
    { text: 'Comida casera de verdad. Se nota el amor con que cocinan. Cliente fijo!', author: 'Ana L.', rating: 5 }
  ];
  
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-4xl font-bold text-center text-red-600 mb-12">
          Lo que dicen nuestros clientes
        </h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, idx) => (
            <div key={idx} className="bg-white p-8 rounded-2xl shadow-lg">
              <div className="flex mb-4 text-yellow-400">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-6 h-6 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 italic mb-4">"{testimonial.text}"</p>
              <p className="font-semibold text-gray-900">- {testimonial.author}</p>
            </div>
          ))}
        </div>
        
        <div className="mt-12 text-center bg-red-50 rounded-2xl p-8">
          <Instagram className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">¡Síguenos en Instagram!</h3>
          <p className="text-gray-600 mb-4">@supermilas.ck para promociones exclusivas</p>
        </div>
      </div>
    </section>
  );
}

// Footer
function Footer() {
  return (
    <footer className="relative bg-gradient-to-br from-yellow-400 via-orange-400 to-orange-500 text-white overflow-hidden">
      {/* Patrón de mantel */}
      <div className="absolute inset-0 opacity-15">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="checkered-footer" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
              <rect x="0" y="0" width="30" height="30" fill="#FCD34D"/>
              <rect x="30" y="0" width="30" height="30" fill="#F59E0B"/>
              <rect x="0" y="30" width="30" height="30" fill="#F59E0B"/>
              <rect x="30" y="30" width="30" height="30" fill="#FCD34D"/>
              {/* Puntos decorativos */}
              <circle cx="15" cy="15" r="1.5" fill="#FB923C" opacity="0.5"/>
              <circle cx="45" cy="15" r="1.5" fill="#FB923C" opacity="0.5"/>
              <circle cx="15" cy="45" r="1.5" fill="#FB923C" opacity="0.5"/>
              <circle cx="45" cy="45" r="1.5" fill="#FB923C" opacity="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#checkered-footer)"/>
        </svg>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h3 className="text-3xl font-bold mb-2">Super Milas</h3>
          <p className="text-lg opacity-90">Comidas caseras con amor desde 2020</p>
        </div>
        
        <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-8 mb-8">
          <div className="flex items-center space-x-2">
            <MapPin className="w-5 h-5" />
            <span>Chaco & Corrientes</span>
          </div>
          <div className="flex items-center space-x-2">
            <Phone className="w-5 h-5" />
            <span>+54 3734 123456</span>
          </div>
          <div className="flex items-center space-x-2">
            <Mail className="w-5 h-5" />
            <span>@supermilas.ck</span>
          </div>
        </div>
        
        <div className="text-center text-sm opacity-75 border-t border-white/20 pt-6">
          © 2024 Super Milas. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}

// Main Home Page Component
export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <HeroSection />
      <CategoriesSection />
      <CombosSection />
      <WhyUsSection />
      <TestimonialsSection />
      <Footer />
    </div>
  );
}