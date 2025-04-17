import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { supabase } from '../config/supabase';
import { formatCurrency } from '../utils/format';
import { FiShoppingCart } from 'react-icons/fi';

const CategoryPage = () => {
  const [searchParams] = useSearchParams();
  const categorySlug = searchParams.get('category');
  
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategoryAndProducts = async () => {
      try {
        setLoading(true);
        console.log('Category slug:', categorySlug);

        // Lấy thông tin danh mục
        const { data: categoryData, error: categoryError } = await supabase
          .from('categories')
          .select('*')
          .eq('slug', categorySlug)
          .single();

        if (categoryError) {
          console.error('Lỗi khi lấy danh mục:', categoryError);
          throw categoryError;
        }
        console.log('Category data:', categoryData);
        setCategory(categoryData);

        // Lấy danh sách sản phẩm của danh mục
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select(`
            *,
            productvariants (
              variant_id,
              price,
              productimages (
                image_id,
                image_url,
                is_primary
              )
            )
          `)
          .eq('category_id', categoryData.category_id)
          .eq('is_active', true);

        if (productsError) {
          console.error('Lỗi khi lấy sản phẩm:', productsError);
          throw productsError;
        }
        console.log('Products data:', productsData);

        // Xử lý dữ liệu sản phẩm
        const processedProducts = productsData.map(product => {
          const primaryVariant = product.productvariants?.[0];
          const primaryImage = primaryVariant?.productimages?.find(img => img.is_primary)?.image_url;

          return {
            ...product,
            price: primaryVariant?.price || 0,
            image_url: primaryImage || '/placeholder.jpg'
          };
        });

        console.log('Processed products:', processedProducts);
        setProducts(processedProducts);
        setError(null);
      } catch (err) {
        console.error('Lỗi khi lấy dữ liệu:', err);
        setError(err.message);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    if (categorySlug) {
      fetchCategoryAndProducts();
    }
  }, [categorySlug]);

  if (loading) return (
    <div className="min-h-screen pt-20 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <div className="animate-pulse">
            <div className="h-8 w-64 bg-gray-700 rounded mx-auto mb-4"></div>
            <div className="h-4 w-96 bg-gray-700 rounded mx-auto"></div>
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

  if (!category) return (
    <div className="min-h-screen pt-20 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Không tìm thấy danh mục</h2>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-4">{category.category_name}</h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            {category.description || `Khám phá các sản phẩm ${category.category_name} của chúng tôi`}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product.product_id} className="product-card group">
              <Link to={`/product/${product.slug}`} className="block relative">
                <img
                  src={product.image_url}
                  alt={product.product_name}
                  className="product-image"
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
                  {category.category_name}
                </p>
                <div className="flex justify-between items-center mt-4">
                  <span className="product-price">
                    {formatCurrency(product.price)}
                  </span>
                  <button 
                    className="w-10 h-10 flex items-center justify-center bg-indigo-500 text-white rounded-full hover:bg-indigo-600 transition-colors"
                    title="Thêm vào giỏ hàng"
                  >
                    <FiShoppingCart size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryPage; 