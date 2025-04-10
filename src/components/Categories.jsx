import { Link } from 'react-router-dom';
import { useCategories } from '../hooks/useCategories';

const Categories = () => {
  const { categories, loading, error } = useCategories();

  if (loading) return (
    <section className="categories py-5">
      <div className="container">
        <div className="text-center">
          <h2 className="section-title">Danh mục sản phẩm</h2>
          <p>Đang tải...</p>
        </div>
      </div>
    </section>
  );

  if (error) return (
    <section className="categories py-5">
      <div className="container">
        <div className="text-center">
          <h2 className="section-title">Danh mục sản phẩm</h2>
          <p className="text-danger">Có lỗi xảy ra: {error}</p>
        </div>
      </div>
    </section>
  );

  if (categories.length === 0) {
    return (
      <section className="categories py-5">
        <div className="container">
          <div className="text-center">
            <h2 className="section-title">Danh mục sản phẩm</h2>
            <p>Chưa có danh mục nào</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="categories py-5">
      <div className="container">
        <h2 className="text-center mb-4">Danh mục sản phẩm</h2>
        <p className="text-center text-muted mb-5">
          Khám phá các danh mục sản phẩm đa dạng của chúng tôi, từ trang phục hàng ngày đến
          những bộ trang phục cho các dịp đặc biệt.
        </p>

        <div className="row g-4">
          {categories.map((category) => (
            <div key={category.category_id} className="col-md-6 col-lg-3">
              <Link
                to={`/products?category=${category.slug}`}
                className="text-decoration-none"
              >
                <div className="card h-100 border-0 shadow-sm">
                  <img
                    src={category.image_url || '/placeholder.jpg'}
                    alt={category.category_name}
                    className="card-img-top"
                    style={{ height: '200px', objectFit: 'cover' }}
                  />
                  <div className="card-body text-center">
                    <h5 className="card-title mb-2">{category.category_name}</h5>
                    <p className="card-text text-muted">
                      {category.count} sản phẩm
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories; 