import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../infrastructure/config/supabase';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('is_active', true);
        if (error) throw error;
        setProducts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading) return <div className="p-8">Đang tải sản phẩm...</div>;
  if (error) return <div className="p-8 text-red-500">Lỗi: {error}</div>;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Tất cả sản phẩm</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map(product => (
          <Link to={`/products/${product.product_id}`} key={product.product_id} className="block bg-white rounded-lg shadow hover:shadow-lg transition p-4">
            <img src={product.image_url || '/placeholder.jpg'} alt={product.product_name} className="w-full h-40 object-cover rounded mb-3" />
            <div className="font-semibold text-lg mb-1">{product.product_name}</div>
            <div className="text-indigo-600 font-bold">{product.base_price?.toLocaleString('vi-VN')}đ</div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ProductsPage; 