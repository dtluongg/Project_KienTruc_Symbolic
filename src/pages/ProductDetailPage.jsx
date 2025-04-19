import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../config/supabase';
import { formatCurrency } from '../utils/format';
import { FiShoppingCart, FiMinus, FiPlus } from 'react-icons/fi';

const ProductDetailPage = () => {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
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

        // Lấy thông tin sản phẩm
        const { data: productData, error: productError } = await supabase
          .from('products')
          .select(`
            *,
            categories (
              category_id,
              category_name,
              slug
            )
          `)
          .eq('slug', slug)
          .single();

        if (productError) throw productError;

        // Lấy màu sắc của sản phẩm
        const { data: colorsData, error: colorsError } = await supabase
          .from('product_colors')
          .select('*')
          .eq('product_id', productData.product_id);

        if (colorsError) throw colorsError;

        // Lấy kích thước của sản phẩm
        const { data: sizesData, error: sizesError } = await supabase
          .from('product_sizes')
          .select('*')
          .eq('product_id', productData.product_id);

        if (sizesError) throw sizesError;

        // Lấy tồn kho
        const { data: inventoryData, error: inventoryError } = await supabase
          .from('product_inventory')
          .select('*')
          .in('color_id', colorsData.map(c => c.color_id));

        if (inventoryError) throw inventoryError;

        // Lấy ảnh sản phẩm
        const { data: imagesData, error: imagesError } = await supabase
          .from('product_images')
          .select('*')
          .in('color_id', colorsData.map(c => c.color_id));

        if (imagesError) throw imagesError;

        // Kết hợp dữ liệu
        const variants = colorsData.map(color => {
          const colorSizes = sizesData.filter(s => s.product_id === productData.product_id);
          const colorInventory = inventoryData.filter(i => i.color_id === color.color_id);
          const colorImages = imagesData.filter(img => img.color_id === color.color_id);

          return {
            color,
            sizes: colorSizes.map(size => ({
              ...size,
              stock: colorInventory.find(i => i.size_id === size.size_id)?.stock_quantity || 0
            })),
            images: colorImages
          };
        });

        const processedProduct = {
          ...productData,
          variants
        };

        setProduct(processedProduct);
        setAllImages(imagesData);
        setMainImage(imagesData[0]?.image_url);
        
        // Set màu và kích thước mặc định
        if (variants.length > 0) {
          setSelectedColor(variants[0].color);
          if (variants[0].sizes.length > 0) {
            setSelectedSize(variants[0].sizes[0]);
          }
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
    const variant = product.variants.find(v => v.color.color_id === color.color_id);
    if (variant) {
      const variantImage = variant.images[0]?.image_url;
      if (variantImage) setMainImage(variantImage);
    }
  };

  const handleSizeChange = (size) => {
    setSelectedSize(size);
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

  const selectedVariant = product.variants.find(v => v.color.color_id === selectedColor?.color_id);
  const basePrice = product.base_price;
  const priceAdjust = selectedSize?.price_adjust || 0;
  const finalPrice = basePrice + priceAdjust;

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
            <div className="grid grid-cols-5 gap-2">
              {allImages.map((image) => (
                <button
                  key={image.image_id}
                  onClick={() => setMainImage(image.image_url)}
                  className={`aspect-w-1 aspect-h-1 rounded-lg overflow-hidden bg-[#242731] transition-all duration-200 ${
                    mainImage === image.image_url 
                      ? 'ring-2 ring-indigo-500 scale-95' 
                      : 'hover:ring-2 hover:ring-indigo-500/50 hover:scale-95'
                  }`}
                >
                  <img
                    src={image.image_url}
                    alt={`${product.product_name} - Ảnh ${image.image_id}`}
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
                {formatCurrency(finalPrice)}
              </h2>
              {product.compare_at_price > finalPrice && (
                <span className="text-gray-400 line-through ml-2">
                  {formatCurrency(product.compare_at_price)}
                </span>
              )}
            </div>

            <div>
              <p className="text-gray-300">{product.description}</p>
            </div>

            {/* Color Selection */}
            <div>
              <h3 className="text-sm font-medium mb-3">Màu sắc</h3>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((variant) => (
                  <button
                    key={variant.color.color_id}
                    onClick={() => handleColorChange(variant.color)}
                    className={`px-4 py-2 rounded-full border ${
                      selectedColor?.color_id === variant.color.color_id
                        ? 'border-indigo-500 text-indigo-500'
                        : 'border-gray-600 text-gray-400 hover:border-gray-400'
                    }`}
                  >
                    {variant.color.color_name}
                  </button>
                ))}
              </div>
            </div>

            {/* Size Selection */}
            <div>
              <h3 className="text-sm font-medium mb-3">Kích thước</h3>
              <div className="flex flex-wrap gap-2">
                {selectedVariant?.sizes.map((size) => (
                  <button
                    key={size.size_id}
                    onClick={() => handleSizeChange(size)}
                    className={`w-12 h-12 rounded-full border flex items-center justify-center ${
                      selectedSize?.size_id === size.size_id
                        ? 'border-indigo-500 text-indigo-500'
                        : 'border-gray-600 text-gray-400 hover:border-gray-400'
                    }`}
                  >
                    {size.size_name}
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