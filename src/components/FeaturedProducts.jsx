import { Link } from 'react-router-dom';
import { FiShoppingCart } from 'react-icons/fi';
import { useProducts } from '../hooks/useProducts';
import { formatCurrency } from '../utils/format';

const FeaturedProducts = () => {
  const { products, loading, error } = useProducts();

  console.log('FeaturedProducts - products:', products);

  if (loading) return (
    <section className="featured-products py-5">
      <div className="container">
        <div className="text-center">
          <h2 className="section-title">Sản phẩm nổi bật</h2>
          <p>Đang tải...</p>
        </div>
      </div>
    </section>
  );

  if (error) return (
    <section className="featured-products py-5">
      <div className="container">
        <div className="text-center">
          <h2 className="section-title">Sản phẩm nổi bật</h2>
          <p className="text-danger">Có lỗi xảy ra: {error}</p>
        </div>
      </div>
    </section>
  );

  // Lấy 8 sản phẩm đầu tiên
  const featuredProducts = products.slice(0, 8);

  console.log('FeaturedProducts - featuredProducts:', featuredProducts);

  if (featuredProducts.length === 0) {
    return (
      <section className="featured-products py-5">
        <div className="container">
          <div className="text-center">
            <h2 className="section-title">Sản phẩm nổi bật</h2>
            <p>Chưa có sản phẩm nào</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="featured-products py-5">
      <div className="container">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="section-title mb-0">Sản phẩm nổi bật</h2>
          <Link to="/products" className="btn btn-outline-dark">
            Xem tất cả
          </Link>
        </div>

        <div className="row g-4">
          {featuredProducts.map(product => {
            console.log('Rendering product:', product);
            const firstVariant = product.variants[0];
            return (
              <div key={product.product_id} className="col-6 col-md-4 col-lg-3">
                <div className="card h-100">
                  <Link to={`/product/${product.slug}`}>
                    <img
                      src={product.primaryImage || '/placeholder.jpg'}
                      className="card-img-top"
                      alt={product.product_name}
                      style={{ height: '200px', objectFit: 'cover' }}
                    />
                  </Link>
                  <div className="card-body">
                    <Link
                      to={`/product/${product.slug}`}
                      className="text-decoration-none text-dark"
                    >
                      <h5 className="card-title text-truncate mb-1">{product.product_name}</h5>
                    </Link>
                    <p className="card-text text-muted small mb-2">
                      {product.category?.category_name}
                    </p>
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <span className="fw-bold">
                          {formatCurrency(firstVariant?.price || 0)}
                        </span>
                        {firstVariant?.compare_at_price > firstVariant?.price && (
                          <span className="text-muted text-decoration-line-through ms-2">
                            {formatCurrency(firstVariant.compare_at_price)}
                          </span>
                        )}
                      </div>
                      <button 
                        className="btn btn-dark btn-sm"
                        title="Thêm vào giỏ hàng"
                      >
                        <FiShoppingCart />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts; 