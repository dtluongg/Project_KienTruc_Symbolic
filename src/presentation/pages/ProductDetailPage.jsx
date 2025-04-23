import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ProductService } from '../../business/services/productService';
import { ProductRepository } from '../../data/repositories/productRepository';
import { formatPrice } from '../../shared/utils/format';
import { FiShoppingCart, FiMinus, FiPlus } from 'react-icons/fi';

const ProductDetailPage = () => {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const productRepository = new ProductRepository();
        const productService = new ProductService(productRepository);
        const product = await productService.getProductDetails(slug);
        setProduct(product);
        if (product.colors.length > 0) {
          setSelectedColor(product.colors[0]);
        }
        if (product.sizes.length > 0) {
          setSelectedSize(product.sizes[0]);
        }
        setError(null);
      } catch (err) {
        console.error('Lỗi khi lấy thông tin sản phẩm:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  const handleQuantityChange = (value) => {
    const newQuantity = Math.max(1, Math.min(10, quantity + value));
    setQuantity(newQuantity);
  };

  const handleAddToCart = () => {
    if (!selectedColor || !selectedSize) {
      alert('Vui lòng chọn màu sắc và kích thước');
      return;
    }
    // TODO: Implement add to cart functionality
    console.log('Thêm vào giỏ hàng:', {
      product,
      color: selectedColor,
      size: selectedSize,
      quantity
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        <p>Đã xảy ra lỗi: {error}</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center p-4">
        <p>Không tìm thấy sản phẩm</p>
      </div>
    );
  }

  const basePrice = Number(product.base_price);
  const colorAdjust = Number(selectedColor?.price_adjustment || 0);
  const sizeAdjust = Number(selectedSize?.price_adjustment || 0);
  const finalPrice = basePrice + colorAdjust + sizeAdjust;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-lg">
            <img
              src={product.images.find(img => img.is_primary)?.image_url || product.images[0]?.image_url}
              alt={product.product_name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="grid grid-cols-4 gap-2">
            {product.images.map((image, index) => (
              <div key={index} className="aspect-square overflow-hidden rounded-lg">
                <img
                  src={image.image_url}
                  alt={`${product.product_name} - ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-[#2d2d2d]">
            {product.product_name}
          </h1>

          <div className="flex items-center space-x-4">
            <p className="text-2xl font-bold text-[#2d2d2d]">
              {formatPrice(finalPrice)}
            </p>
            {product.compare_at_price && (
              <p className="text-lg text-gray-500 line-through">
                {formatPrice(product.compare_at_price)}
              </p>
            )}
          </div>

          <div className="space-y-4">
            {/* Color Selection */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Màu sắc</h3>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((color) => (
                  <button
                    key={color.color_id}
                    onClick={() => setSelectedColor(color)}
                    className={`px-4 py-2 rounded-full border-2 ${
                      selectedColor?.color_id === color.color_id
                        ? 'border-[#2d2d2d] bg-[#a5a2b1]/50'
                        : 'border-[#a5a2b1] hover:border-[#2d2d2d]'
                    }`}
                  >
                    {color.color_name}
                  </button>
                ))}
              </div>
            </div>

            {/* Size Selection */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Kích thước</h3>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size.size_id}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 rounded-full border-2 ${
                      selectedSize?.size_id === size.size_id
                        ? 'border-[#2d2d2d] bg-[#a5a2b1]/50'
                        : 'border-[#a5a2b1] hover:border-[#2d2d2d]'
                    }`}
                  >
                    {size.size_name}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Số lượng</h3>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  className="p-2 rounded-full border-2 border-[#a5a2b1] hover:border-[#2d2d2d]"
                >
                  <FiMinus size={20} />
                </button>
                <span className="text-xl font-semibold">{quantity}</span>
                <button
                  onClick={() => handleQuantityChange(1)}
                  className="p-2 rounded-full border-2 border-[#a5a2b1] hover:border-[#2d2d2d]"
                >
                  <FiPlus size={20} />
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            className="w-full py-3 bg-[#2d2d2d] text-white rounded-full hover:bg-black transition-colors flex items-center justify-center space-x-2"
          >
            <FiShoppingCart size={20} />
            <span>Thêm vào giỏ hàng</span>
          </button>

          <div className="prose max-w-none">
            <h3 className="text-lg font-semibold mb-2">Mô tả sản phẩm</h3>
            <p className="text-gray-600">{product.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage; 