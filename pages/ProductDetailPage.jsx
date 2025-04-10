import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../config/supabase';
import { formatCurrency } from '../utils/format';
import { FiShoppingCart, FiMinus, FiPlus } from 'react-icons/fi';

const ProductDetailPage = () => {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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

        if (productError) {
          console.error('Lỗi khi lấy sản phẩm:', productError);
          throw productError;
        }

        console.log('Product data:', productData);
        setProduct(productData);
        
        // Chọn variant mặc định (variant đầu tiên)
        if (productData.productvariants?.length > 0) {
          setSelectedVariant(productData.productvariants[0]);
        }

        // Lấy tất cả hình ảnh từ tất cả các biến thể
        const allProductImages = [];
        productData.productvariants?.forEach(variant => {
          if (variant.productimages) {
            allProductImages.push(...variant.productimages);
          }
        });
        
        // Loại bỏ các hình ảnh trùng lặp dựa trên image_id
        const uniqueImages = Array.from(
          new Map(allProductImages.map(img => [img.image_id, img])).values()
        );
        
        setAllImages(uniqueImages);

        setError(null);
      } catch (err) {
        console.error('Lỗi khi lấy dữ liệu:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchProduct();
    }
  }, [slug]);

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= (selectedVariant?.stock_quantity || 1)) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    // TODO: Implement add to cart functionality
    console.log('Adding to cart:', {
      product: product.product_id,
      variant: selectedVariant.variant_id,
      quantity
    });
  };

  if (loading) return (
    <div className="container py-5">
      <div className="text-center">
        <h2>Đang tải...</h2>
      </div>
    </div>
  );

  if (error) return (
    <div className="container py-5">
      <div className="text-center">
        <h2>Có lỗi xảy ra</h2>
        <p className="text-danger">{error}</p>
      </div>
    </div>
  );

  if (!product) return (
    <div className="container py-5">
      <div className="text-center">
        <h2>Không tìm thấy sản phẩm</h2>
      </div>
    </div>
  );

  // Lấy hình ảnh chính từ tất cả hình ảnh
  const primaryImage = allImages.find(img => img.is_primary)?.image_url || allImages[0]?.image_url || '/placeholder.jpg';

  // Lấy danh sách các màu sắc duy nhất
  const uniqueColors = [...new Set(product.productvariants?.map(variant => variant.color) || [])];

  return (
    <div className="container py-5">
      <div className="row">
        <div className="col-md-6">
          <img
            src={primaryImage}
            alt={product.product_name}
            className="img-fluid rounded"
            style={{ width: '100%', height: 'auto', objectFit: 'cover' }}
          />
          <div className="row mt-3">
            {allImages.map((image) => (
              <div key={image.image_id} className="col-3">
                <img
                  src={image.image_url}
                  alt={image.alt_text || product.product_name}
                  className="img-fluid rounded cursor-pointer"
                  style={{ width: '100%', height: '100px', objectFit: 'cover' }}
                />
              </div>
            ))}
          </div>
        </div>
        <div className="col-md-6">
          <h1 className="mb-3">{product.product_name}</h1>
          <p className="text-muted mb-3">
            Danh mục: {product.categories.category_name}
          </p>
          <div className="mb-4">
            <h3 className="text-primary mb-0">
              {formatCurrency(selectedVariant?.price || 0)}
            </h3>
          </div>
          <p className="mb-4">{product.description}</p>

          {/* Hiển thị màu sắc */}
          {uniqueColors.length > 0 && (
            <div className="mb-4">
              <h5>Màu sắc</h5>
              <div className="d-flex flex-wrap gap-2">
                {uniqueColors.map((color) => {
                  // Tìm variant có màu này
                  const variantWithColor = product.productvariants.find(v => v.color === color);
                  
                  return (
                    <button
                      key={color}
                      className={`btn ${
                        selectedVariant?.color === color
                          ? 'btn-primary'
                          : 'btn-outline-primary'
                      }`}
                      onClick={() => setSelectedVariant(variantWithColor)}
                    >
                      {color}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Hiển thị kích thước */}
          {product.productvariants?.some(v => v.size) && (
            <div className="mb-4">
              <h5>Kích thước</h5>
              <div className="btn-group">
                {product.productvariants
                  .filter(v => v.color === selectedVariant?.color)
                  .map((variant) => (
                    <button
                      key={variant.variant_id}
                      className={`btn ${
                        selectedVariant?.variant_id === variant.variant_id
                          ? 'btn-primary'
                          : 'btn-outline-primary'
                      }`}
                      onClick={() => setSelectedVariant(variant)}
                    >
                      {variant.size}
                    </button>
                  ))}
              </div>
            </div>
          )}

          <div className="mb-4">
            <h5>Số lượng</h5>
            <div className="d-flex align-items-center">
              <button
                className="btn btn-outline-secondary"
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= 1}
              >
                <FiMinus />
              </button>
              <span className="mx-3">{quantity}</span>
              <button
                className="btn btn-outline-secondary"
                onClick={() => handleQuantityChange(1)}
                disabled={quantity >= (selectedVariant?.stock_quantity || 1)}
              >
                <FiPlus />
              </button>
            </div>
            <small className="text-muted">
              Còn {selectedVariant?.stock_quantity || 0} sản phẩm
            </small>
          </div>

          <button
            className="btn btn-primary btn-lg w-100 mb-3"
            onClick={handleAddToCart}
            disabled={!selectedVariant || selectedVariant.stock_quantity === 0}
          >
            <FiShoppingCart className="me-2" />
            Thêm vào giỏ hàng
          </button>

          {selectedVariant?.stock_quantity === 0 && (
            <p className="text-danger text-center">
              Sản phẩm đã hết hàng
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage; 