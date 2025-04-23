import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingCart } from 'react-icons/fi';
import { ProductService } from '../../business/services/productService';
import { ProductRepository } from '../../data/repositories/productRepository';
import { formatPrice } from '../../shared/utils/format';

const FeaturedProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const productRepository = new ProductRepository();
        const productService = new ProductService(productRepository);
        const products = await productService.getAllProducts();

        // Bổ sung thêm chi tiết cho mỗi sản phẩm
        const productsWithDetails = await Promise.all(
          products.slice(0, 8).map(async (product) => {
            try {
              const details = await productService.getProductDetails(product.product_id);
              return {
                ...product,
                colors: details.colors || [],
                sizes: details.sizes || [],
                images: details.images || [],
                category: details.category
              };
            } catch (err) {
              console.error(`Lỗi khi lấy chi tiết sản phẩm ${product.product_id}:`, err);
              return {
                ...product,
                colors: [],
                sizes: [],
                images: []
              };
            }
          })
        );
        
        console.log('Sản phẩm đã tải:', productsWithDetails);
        setProducts(productsWithDetails);
        setError(null);
      } catch (err) {
        console.error('Lỗi khi lấy sản phẩm:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

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

  if (!products || products.length === 0) {
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
          {products.map((product) => {
            // Đảm bảo product là đối tượng hợp lệ
            if (!product || typeof product !== 'object') {
              console.error('Sản phẩm không hợp lệ:', product);
              return null;
            }
            
            // Xử lý hình ảnh
            const images = product.images || [];
            let primaryImage = 'https://placehold.co/400x400/EAEAEA/CCCCCC?text=No+Image';
            
            if (images.length > 0) {
              const mainImage = images.find(img => img.is_primary);
              primaryImage = mainImage ? mainImage.image_url : images[0].image_url;
            }
            
            // Tính giá
            const colors = product.colors || [];
            const sizes = product.sizes || [];
            const firstColor = colors[0];
            const firstSize = sizes[0];
            
            const basePrice = Number(product.base_price || 0);
            const priceAdjust = firstSize && firstSize.price_adjustment !== undefined 
              ? Number(firstSize.price_adjustment) 
              : 0;
            const finalPrice = basePrice + priceAdjust;

            return (
              <div key={product.product_id} className="product-card">
                <Link to={`/product/${product.slug || ''}`} className="block relative">
                  <img
                    src={primaryImage}
                    className="product-image"
                    alt={product.product_name}
                    onError={(e) => {
                      console.error(`Không thể tải hình ảnh: ${primaryImage}`);
                      e.target.src = 'https://placehold.co/400x400/EAEAEA/CCCCCC?text=No+Image';
                    }}
                  />
                </Link>
                <div className="product-content">
                  <Link
                    to={`/product/${product.slug || ''}`}
                    className="block"
                  >
                    <h3 className="product-title">{product.product_name}</h3>
                  </Link>
                  <p className="product-category">
                    {product.category?.category_name || 'Không phân loại'}
                  </p>
                  <div className="flex justify-between items-center mt-4">
                    <div className="flex items-center gap-2">
                      <span className="product-price">
                        {formatPrice(finalPrice)}
                      </span>
                      {product.compare_at_price > finalPrice && (
                        <span className="product-price-old">
                          {formatPrice(product.compare_at_price)}
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