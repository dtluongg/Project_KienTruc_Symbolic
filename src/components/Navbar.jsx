import { Link } from 'react-router-dom';
import { FiShoppingCart, FiUser } from 'react-icons/fi';
import { useState } from 'react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const logoUrl = "https://vbrbponwvctuycpzhrfe.supabase.co/storage/v1/object/public/symbolicv3/symbolic%20logo.png";

  return (
    <nav className="bg-[#191b24] fixed w-full z-50 top-0 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/">
              <img className="h-8" src={logoUrl} alt="Symbolic Logo" />
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium">
              Trang chủ
            </Link>
            <Link to="/products" className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium">
              Sản phẩm
            </Link>
            <Link to="/about" className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium">
              Giới thiệu
            </Link>
            <Link to="/contact" className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium">
              Liên hệ
            </Link>
          </div>

          {/* Search and Icons */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm..."
                className="w-64 bg-gray-800 text-white px-4 py-1 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <Link to="/cart" className="text-gray-300 hover:text-white p-2">
              <FiShoppingCart className="h-5 w-5" />
            </Link>
            <Link to="/auth" className="text-gray-300 hover:text-white p-2">
              <FiUser className="h-5 w-5" />
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-300 hover:text-white focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link to="/" className="text-gray-300 hover:text-white block px-3 py-2 text-base font-medium">
                Trang chủ
              </Link>
              <Link to="/products" className="text-gray-300 hover:text-white block px-3 py-2 text-base font-medium">
                Sản phẩm
              </Link>
              <Link to="/about" className="text-gray-300 hover:text-white block px-3 py-2 text-base font-medium">
                Giới thiệu
              </Link>
              <Link to="/contact" className="text-gray-300 hover:text-white block px-3 py-2 text-base font-medium">
                Liên hệ
              </Link>
            </div>
            <div className="px-4 py-3">
              <div className="flex items-center space-x-4">
                <Link to="/cart" className="text-gray-300 hover:text-white">
                  <FiShoppingCart className="h-5 w-5" />
                </Link>
                <Link to="/auth" className="text-gray-300 hover:text-white">
                  <FiUser className="h-5 w-5" />
                </Link>
              </div>
              <div className="mt-3">
                <input
                  type="text"
                  placeholder="Tìm kiếm..."
                  className="w-full bg-gray-800 text-white px-4 py-2 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 