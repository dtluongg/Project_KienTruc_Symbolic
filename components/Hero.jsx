import { Link } from 'react-router-dom';

const Hero = () => {
  const bannerUrl = "https://vbrbponwvctuycpzhrfe.supabase.co/storage/v1/object/public/symbolicv3/banner1.png";

  return (
    <div className="hero">
      <img src={bannerUrl} alt="Symbolic Banner" />
      <div className="hero-content">
        <h1 className="display-4 fw-bold mb-3">Thời trang Symbolic</h1>
        <p className="lead mb-4">Phong cách của bạn, cá tính của riêng bạn</p>
        <div className="d-flex gap-3 justify-content-center">
          <Link to="/products" className="btn btn-dark btn-lg">
            Mua sắm ngay
          </Link>
          <Link to="/about" className="btn btn-outline-light btn-lg">
            Tìm hiểu thêm
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Hero; 