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

  if (!category) return (
    <div className="container py-5">
      <div className="text-center">
        <h2>Không tìm thấy danh mục</h2>
      </div>
    </div>
  );

  return (
    <div className="container py-5">
      <h1 className="text-center mb-4">{category.category_name}</h1>
      <p className="text-center text-muted mb-5">
        {category.description || `Khám phá các sản phẩm ${category.category_name} của chúng tôi`}
      </p>

      <div className="row g-4">
        {products.map((product) => (
          <div key={product.product_id} className="col-md-6 col-lg-3">
            <div className="card h-100 border-0 shadow-sm">
              <Link to={`/product/${product.slug}`} className="text-decoration-none">
                <img
                  src={product.image_url}
                  alt={product.product_name}
                  className="card-img-top"
                  style={{ height: '200px', objectFit: 'cover' }}
                />
                <div className="card-body">
                  <h5 className="card-title mb-2 text-dark">{product.product_name}</h5>
                  <p className="card-text text-muted mb-2">{category.category_name}</p>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <span className="h5 mb-0 text-dark">{formatCurrency(product.price)}</span>
                    </div>
                  </div>
                </div>
              </Link>
              <div className="card-footer bg-white border-0">
                <button className="btn btn-outline-primary w-100">
                  <FiShoppingCart className="me-2" />
                  Thêm vào giỏ
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryPage; 