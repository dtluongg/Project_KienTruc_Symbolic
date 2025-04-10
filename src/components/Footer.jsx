import { Link } from 'react-router-dom';
import { FiFacebook, FiInstagram, FiTwitter, FiYoutube } from 'react-icons/fi';

const Footer = () => {
  return (
    <footer className="bg-dark text-light py-5">
      <div className="container">
        <div className="row g-4">
          <div className="col-lg-4">
            <h5 className="mb-4">Symbolic.</h5>
            <p className="mb-4">
              Thương hiệu thời trang Việt Nam với sứ mệnh mang đến phong cách thời trang hiện đại,
              chất lượng và giá cả hợp lý cho người tiêu dùng.
            </p>
            <div className="d-flex gap-3">
              <a href="#" className="text-light">
                <FiFacebook size={20} />
              </a>
              <a href="#" className="text-light">
                <FiInstagram size={20} />
              </a>
              <a href="#" className="text-light">
                <FiTwitter size={20} />
              </a>
              <a href="#" className="text-light">
                <FiYoutube size={20} />
              </a>
            </div>
          </div>

          <div className="col-lg-2">
            <h6 className="mb-4">Liên kết nhanh</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link to="/" className="text-light text-decoration-none">Trang chủ</Link>
              </li>
              <li className="mb-2">
                <Link to="/products" className="text-light text-decoration-none">Sản phẩm</Link>
              </li>
              <li className="mb-2">
                <Link to="/about" className="text-light text-decoration-none">Giới thiệu</Link>
              </li>
              <li className="mb-2">
                <Link to="/contact" className="text-light text-decoration-none">Liên hệ</Link>
              </li>
              <li className="mb-2">
                <Link to="/blog" className="text-light text-decoration-none">Blog</Link>
              </li>
            </ul>
          </div>

          <div className="col-lg-3">
            <h6 className="mb-4">Hỗ trợ</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link to="/faq" className="text-light text-decoration-none">Câu hỏi thường gặp</Link>
              </li>
              <li className="mb-2">
                <Link to="/shipping" className="text-light text-decoration-none">Chính sách vận chuyển</Link>
              </li>
              <li className="mb-2">
                <Link to="/returns" className="text-light text-decoration-none">Chính sách đổi trả</Link>
              </li>
              <li className="mb-2">
                <Link to="/privacy" className="text-light text-decoration-none">Chính sách bảo mật</Link>
              </li>
              <li className="mb-2">
                <Link to="/terms" className="text-light text-decoration-none">Điều khoản dịch vụ</Link>
              </li>
            </ul>
          </div>

          <div className="col-lg-3">
            <h6 className="mb-4">Liên hệ</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <i className="bi bi-geo-alt me-2"></i>
                123 Nguyễn Văn Linh, Quận 7, TP. Hồ Chí Minh
              </li>
              <li className="mb-2">
                <i className="bi bi-telephone me-2"></i>
                0123 456 789
              </li>
              <li className="mb-2">
                <i className="bi bi-envelope me-2"></i>
                info@symbolic.vn
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 