import { Link } from 'react-router-dom';

const Hero = () => {
  const bannerUrl = "https://vbrbponwvctuycpzhrfe.supabase.co/storage/v1/object/public/symbolicv3/banner1.png";

  return (
    <div className="hero-section">
      <img src={bannerUrl} alt="Symbolic Banner" className="absolute inset-0 w-full h-full object-cover" />
      <div className="hero-content">
        <h1 className="hero-title">Thời trang Symbolic</h1>
        <p className="hero-subtitle">Phong cách của bạn, cá tính của riêng bạn</p>
        <div className="flex gap-4 justify-center">
          <Link to="/products" className="px-6 py-3 bg-white text-gray-900 rounded-full font-medium hover:bg-gray-100 transition-colors">
            Mua sắm ngay
          </Link>
          <Link to="/about" className="px-6 py-3 bg-transparent border-2 border-white text-white rounded-full font-medium hover:bg-white/10 transition-colors">
            Tìm hiểu thêm
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Hero; 