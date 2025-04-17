import { Link } from 'react-router-dom';
import { FiShoppingCart } from 'react-icons/fi';
import { useProducts } from '../hooks/useProducts';
import { formatCurrency } from '../utils/format';

const FeaturedProducts = () => {
  const { products, loading, error } = useProducts();

  console.log('FeaturedProducts - products:', products);

  if (loading) return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Sản phẩm nổi bật</h2>
          <p>Đang tải...</p>
        </div>
      </div>
    </section>
  );

  if (error) return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Sản phẩm nổi bật</h2>
          <p className="text-red-500">Có lỗi xảy ra: {error}</p>
        </div>
      </div>
    </section>
  );

  // Lấy 8 sản phẩm đầu tiên
  const featuredProducts = products.slice(0, 8);

  console.log('FeaturedProducts - featuredProducts:', featuredProducts);

  if (featuredProducts.length === 0) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Sản phẩm nổi bật</h2>
            <p>Chưa có sản phẩm nào</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Sản phẩm nổi bật</h2>
          <Link to="/products" className="px-6 py-2 border-2 border-gray-200 text-gray-200 rounded-full hover:bg-gray-200 hover:text-gray-900 transition-colors">
            Xem tất cả
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {featuredProducts.map(product => {
            console.log('Rendering product:', product);
            const firstVariant = product.variants[0];
            return (
              <div key={product.product_id} className="product-card">
                <Link to={`/product/${product.slug}`} className="block relative">
                  <img
                    src={product.primaryImage || '/placeholder.jpg'}
                    className="product-image"
                    alt={product.product_name}
                  />
                </Link>
                <div className="product-content">
                  <Link
                    to={`/product/${product.slug}`}
                    className="block"
                  >
                    <h3 className="product-title">{product.product_name}</h3>
                  </Link>
                  <p className="product-category">
                    {product.category?.category_name}
                  </p>
                  <div className="flex justify-between items-center mt-4">
                    <div className="flex items-center gap-2">
                      <span className="product-price">
                        {formatCurrency(firstVariant?.price || 0)}
                      </span>
                      {firstVariant?.compare_at_price > firstVariant?.price && (
                        <span className="product-price-old">
                          {formatCurrency(firstVariant.compare_at_price)}
                        </span>
                      )}
                    </div>
                    <button 
                      className="w-10 h-10 flex items-center justify-center bg-indigo-500 text-white rounded-full hover:bg-indigo-600 transition-colors"
                      title="Thêm vào giỏ hàng"
                    >
                      <FiShoppingCart size={18} />
                    </button>
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