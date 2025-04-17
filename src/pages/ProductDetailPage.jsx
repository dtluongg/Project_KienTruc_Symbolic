import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../config/supabase';
import { formatCurrency } from '../utils/format';
import { FiShoppingCart, FiMinus, FiPlus } from 'react-icons/fi';

const ProductDetailPage = () => {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mainImage, setMainImage] = useState(null);
  const [allImages, setAllImages] = useState([]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        console.log('Product slug:', slug);

        const { data: productData, error: productError } = await supabase
          .from('products')
          .select(`
            *,
            categories (
              category_id,
              category_name,
              slug
            ),
            productvariants (
              variant_id,
              size,
              color,
              price,
              stock_quantity,
              productimages (
                image_id,
                image_url,
                alt_text,
                is_primary
              )
            )
          `)
          .eq('slug', slug)
          .single();

        if (productError) throw productError;

        // Xử lý hình ảnh
        const images = productData.productvariants.flatMap(variant => 
          variant.productimages.map(img => ({
            ...img,
            variant_id: variant.variant_id
          }))
        );
        
        setProduct(productData);
        setAllImages(images);
        setMainImage(images.find(img => img.is_primary)?.image_url || images[0]?.image_url);
        
        // Set variant mặc định
        if (productData.productvariants?.length > 0) {
          const defaultVariant = productData.productvariants[0];
          setSelectedVariant(defaultVariant);
          setSelectedColor(defaultVariant.color);
          setSelectedSize(defaultVariant.size);
        }

      } catch (err) {
        console.error('Error fetching product:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchProduct();
    }
  }, [slug]);

  const handleColorChange = (color) => {
    setSelectedColor(color);
    const variant = product.productvariants.find(v => v.color === color && v.size === selectedSize);
    if (variant) {
      setSelectedVariant(variant);
      const variantImage = allImages.find(img => img.variant_id === variant.variant_id && img.is_primary);
      if (variantImage) setMainImage(variantImage.image_url);
    }
  };

  const handleSizeChange = (size) => {
    setSelectedSize(size);
    const variant = product.productvariants.find(v => v.size === size && v.color === selectedColor);
    if (variant) setSelectedVariant(variant);
  };

  const handleQuantityChange = (action) => {
    if (action === 'increase') {
      setQuantity(prev => prev + 1);
    } else if (action === 'decrease' && quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  if (loading) return (
    <div className="min-h-screen pt-20 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="aspect-w-1 aspect-h-1 bg-gray-700 rounded-lg"></div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-700 rounded w-3/4"></div>
              <div className="h-6 bg-gray-700 rounded w-1/4"></div>
              <div className="h-4 bg-gray-700 rounded w-full"></div>
              <div className="h-4 bg-gray-700 rounded w-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen pt-20 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Có lỗi xảy ra</h2>
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    </div>
  );

  if (!product) return null;

  const uniqueColors = [...new Set(product.productvariants?.map(variant => variant.color) || [])];
  const uniqueSizes = [...new Set(product.productvariants?.map(variant => variant.size) || [])];

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-w-1 aspect-h-1 bg-[#242731] rounded-lg overflow-hidden">
              <img
                src={mainImage}
                alt={product.product_name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="grid grid-cols-4 gap-4">
              {allImages.map((image) => (
                <button
                  key={image.image_id}
                  onClick={() => setMainImage(image.image_url)}
                  className={`aspect-w-1 aspect-h-1 rounded-lg overflow-hidden bg-[#242731] ${
                    mainImage === image.image_url ? 'ring-2 ring-indigo-500' : ''
                  }`}
                >
                  <img
                    src={image.image_url}
                    alt={image.alt_text || product.product_name}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{product.product_name}</h1>
              <p className="text-gray-400">
                Danh mục: {product.categories.category_name}
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-indigo-500">
                {formatCurrency(selectedVariant?.price || 0)}
              </h2>
            </div>

            <div>
              <p className="text-gray-300">{product.description}</p>
            </div>

            {/* Color Selection */}
            <div>
              <h3 className="text-sm font-medium mb-3">Màu sắc</h3>
              <div className="flex flex-wrap gap-2">
                {uniqueColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => handleColorChange(color)}
                    className={`px-4 py-2 rounded-full border ${
                      selectedColor === color
                        ? 'border-indigo-500 text-indigo-500'
                        : 'border-gray-600 text-gray-400 hover:border-gray-400'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            {/* Size Selection */}
            <div>
              <h3 className="text-sm font-medium mb-3">Kích thước</h3>
              <div className="flex flex-wrap gap-2">
                {uniqueSizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => handleSizeChange(size)}
                    className={`w-12 h-12 rounded-full border flex items-center justify-center ${
                      selectedSize === size
                        ? 'border-indigo-500 text-indigo-500'
                        : 'border-gray-600 text-gray-400 hover:border-gray-400'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <h3 className="text-sm font-medium mb-3">Số lượng</h3>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => handleQuantityChange('decrease')}
                  className="w-10 h-10 rounded-full border border-gray-600 flex items-center justify-center text-gray-400 hover:border-gray-400"
                >
                  <FiMinus size={16} />
                </button>
                <span className="text-xl font-medium w-12 text-center">{quantity}</span>
                <button
                  onClick={() => handleQuantityChange('increase')}
                  className="w-10 h-10 rounded-full border border-gray-600 flex items-center justify-center text-gray-400 hover:border-gray-400"
                >
                  <FiPlus size={16} />
                </button>
              </div>
            </div>

            {/* Add to Cart */}
            <button
              className="w-full py-4 bg-indigo-500 text-white rounded-full font-medium hover:bg-indigo-600 transition-colors flex items-center justify-center space-x-2"
            >
              <FiShoppingCart size={20} />
              <span>Thêm vào giỏ hàng</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage; 