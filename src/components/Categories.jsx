import { Link } from 'react-router-dom';
import { useCategories } from '../hooks/useCategories';

const Categories = () => {
  const { categories, loading, error } = useCategories();

  if (loading) return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Danh mục sản phẩm</h2>
          <p>Đang tải...</p>
        </div>
      </div>
    </section>
  );

  if (error) return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Danh mục sản phẩm</h2>
          <p className="text-red-500">Có lỗi xảy ra: {error}</p>
        </div>
      </div>
    </section>
  );

  if (categories.length === 0) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Danh mục sản phẩm</h2>
            <p>Chưa có danh mục nào</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-4">Danh mục sản phẩm</h2>
        <p className="text-gray-400 text-center max-w-3xl mx-auto mb-12">
          Khám phá các danh mục sản phẩm đa dạng của chúng tôi, từ trang phục hàng ngày đến
          những bộ trang phục cho các dịp đặc biệt.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link
              key={category.category_id}
              to={`/products?category=${category.slug}`}
              className="category-card group"
            >
              <div className="relative h-64 overflow-hidden rounded-lg">
                <img
                  src={category.image_url || '/placeholder.jpg'}
                  alt={category.category_name}
                  className="category-image"
                />
                <div className="category-overlay">
                  <h3 className="text-xl font-semibold text-white mb-1">
                    {category.category_name}
                  </h3>
                  <p className="text-gray-200">
                    {category.count} sản phẩm
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories; 