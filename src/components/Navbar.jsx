import { Link } from 'react-router-dom';
import { FiShoppingCart, FiUser, FiMessageCircle } from 'react-icons/fi';
import { useState, useEffect } from 'react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const logoUrl = "https://xiocmtlosfcsrydhgjvl.supabase.co/storage/v1/object/public/symbolicv3/symbolic%20logo.png";

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);

  return (
    <nav className="fixed w-full z-[9999] top-0 px-4 py-2 bg-transparent">
      <div className={`max-w-7xl mx-auto backdrop-blur-sm rounded-full border border-[#93909f]/30 transition-colors duration-300 shadow-lg ${
        scrolled ? 'bg-[#93909f]/40' : 'bg-[#a8a7b3]/30'
      }`}>
        <div className="flex items-center justify-between h-14 px-6">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/">
              <img className="h-8" src={logoUrl} alt="Symbolic Logo" />
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-1">
            <Link to="/" className="text-[#0a0a0a] hover:text-black px-4 py-2 text-sm font-medium rounded-full hover:bg-[#93909f]/50">
              Trang chủ
            </Link>
            <Link to="/products" className="text-[#0a0a0a] hover:text-black px-4 py-2 text-sm font-medium rounded-full hover:bg-[#93909f]/50">
              Sản phẩm
            </Link>
            <Link to="/about" className="text-[#0a0a0a] hover:text-black px-4 py-2 text-sm font-medium rounded-full hover:bg-[#93909f]/50">
              Giới thiệu
            </Link>
            <Link to="/contact" className="text-[#0a0a0a] hover:text-black px-4 py-2 text-sm font-medium rounded-full hover:bg-[#93909f]/50">
              Liên hệ
            </Link>
          </div>

          {/* Search and Icons */}
          <div className="hidden md:flex items-center space-x-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm..."
                className="w-64 bg-[#93909f]/50 text-[#0a0a0a] px-4 py-1.5 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#858291] border border-[#93909f] placeholder-[#4d4d4d]"
              />
            </div>
            <button 
              className="text-[#0a0a0a] hover:text-black p-2 rounded-full hover:bg-[#93909f]/50"
              onClick={() => window.Tawk_API?.toggle()}
            >
              <FiMessageCircle className="h-5 w-5" />
            </button>
            <Link to="/cart" className="text-[#0a0a0a] hover:text-black p-2 rounded-full hover:bg-[#93909f]/50">
              <FiShoppingCart className="h-5 w-5" />
            </Link>
            <Link to="/auth" className="text-[#0a0a0a] hover:text-black p-2 rounded-full hover:bg-[#93909f]/50">
              <FiUser className="h-5 w-5" />
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-[#0a0a0a] hover:text-black p-2 rounded-full hover:bg-[#93909f]/50"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 mt-2 bg-[#858291] border border-[#93909f] rounded-2xl">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link to="/" className="text-[#0a0a0a] hover:text-black block px-3 py-2 text-base font-medium rounded-full hover:bg-[#93909f]/50">
                Trang chủ
              </Link>
              <Link to="/products" className="text-[#0a0a0a] hover:text-black block px-3 py-2 text-base font-medium rounded-full hover:bg-[#93909f]/50">
                Sản phẩm
              </Link>
              <Link to="/about" className="text-[#0a0a0a] hover:text-black block px-3 py-2 text-base font-medium rounded-full hover:bg-[#93909f]/50">
                Giới thiệu
              </Link>
              <Link to="/contact" className="text-[#0a0a0a] hover:text-black block px-3 py-2 text-base font-medium rounded-full hover:bg-[#93909f]/50">
                Liên hệ
              </Link>
            </div>
            <div className="px-4 py-3 border-t border-[#93909f]">
              <div className="flex items-center space-x-2">
                <button 
                  className="text-[#0a0a0a] hover:text-black p-2 rounded-full hover:bg-[#93909f]/50"
                  onClick={() => window.Tawk_API?.toggle()}
                >
                  <FiMessageCircle className="h-5 w-5" />
                </button>
                <Link to="/cart" className="text-[#0a0a0a] hover:text-black p-2 rounded-full hover:bg-[#93909f]/50">
                  <FiShoppingCart className="h-5 w-5" />
                </Link>
                <Link to="/auth" className="text-[#0a0a0a] hover:text-black p-2 rounded-full hover:bg-[#93909f]/50">
                  <FiUser className="h-5 w-5" />
                </Link>
              </div>
              <div className="mt-3">
                <input
                  type="text"
                  placeholder="Tìm kiếm..."
                  className="w-full bg-[#93909f]/50 text-[#0a0a0a] px-4 py-2 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#858291] border border-[#93909f] placeholder-[#4d4d4d]"
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