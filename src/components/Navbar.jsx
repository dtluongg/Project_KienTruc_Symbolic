import { Link } from 'react-router-dom';
import { FiShoppingCart, FiUser } from 'react-icons/fi';

const Navbar = () => {
  const logoUrl = "https://vbrbponwvctuycpzhrfe.supabase.co/storage/v1/object/public/symbolicv3/symbolic%20logo.png";

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <Link className="navbar-brand" to="/">
          <img src={logoUrl} alt="Symbolic Logo" height="40" />
        </Link>
        
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarContent"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className="nav-link" to="/">Trang chủ</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/products">Sản phẩm</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/about">Giới thiệu</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/contact">Liên hệ</Link>
            </li>
          </ul>

          <form className="d-flex me-3">
            <input 
              className="form-control me-2" 
              type="search" 
              placeholder="Tìm kiếm sản phẩm..." 
            />
            <button className="btn btn-outline-light" type="submit">Tìm</button>
          </form>

          <div className="d-flex align-items-center">
            <Link to="/cart" className="btn btn-outline-light me-2 position-relative">
              <FiShoppingCart />
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                0
              </span>
            </Link>
            <Link to="/account" className="btn btn-outline-light">
              <FiUser />
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 