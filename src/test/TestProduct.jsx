import { useState, useEffect } from 'react';
import { supabase } from '../infrastructure/config/supabase';

const TestProduct = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Test 1: Lấy danh sách categories
        console.log('Đang lấy categories...');
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*');
        
        if (categoriesError) throw categoriesError;
        console.log('Categories:', categoriesData);

        // Test 2: Lấy một sản phẩm
        console.log('Đang lấy sản phẩm...');
        const { data: productData, error: productError } = await supabase
          .from('products')
          .select('*')
          .limit(1);

        if (productError) throw productError;
        console.log('Product:', productData);

        if (productData && productData.length > 0) {
          // Test 3: Lấy variants của sản phẩm
          console.log('Đang lấy variants...');
          const { data: variantData, error: variantError } = await supabase
            .from('productvariants')
            .select('*')
            .eq('product_id', productData[0].product_id);

          if (variantError) throw variantError;
          console.log('Variants:', variantData);

          if (variantData && variantData.length > 0) {
            // Test 4: Lấy images của variant
            console.log('Đang lấy images...');
            const { data: imageData, error: imageError } = await supabase
              .from('productimages')
              .select('*')
              .eq('variant_id', variantData[0].variant_id);

            if (imageError) throw imageError;
            console.log('Images:', imageData);

            // Kết hợp dữ liệu
            setData({
              product: productData[0],
              category: categoriesData.find(c => c.category_id === productData[0].category_id),
              variants: variantData.map(variant => ({
                ...variant,
                images: imageData.filter(img => img.variant_id === variant.variant_id)
              }))
            });
          }
        }
      } catch (err) {
        console.error('Lỗi:', err);
        setError(err.message);
      }
    };

    fetchData();
  }, []);

  if (error) return (
    <div className="p-4">
      <h2>Lỗi Test</h2>
      <pre className="text-danger">{error}</pre>
      <div className="mt-3">
        <h3>Thông tin thêm:</h3>
        <p>URL: {supabase.supabaseUrl}</p>
        <p>Vui lòng kiểm tra:</p>
        <ul>
          <li>Kết nối internet</li>
          <li>URL Supabase có chính xác không</li>
          <li>API key có chính xác không</li>
          <li>Tên bảng có chính xác không</li>
        </ul>
      </div>
    </div>
  );

  if (!data) return <div className="p-4">Đang tải...</div>;

  return (
    <div className="p-4">
      <h2>Test Kết Nối Supabase</h2>
      <div className="mt-4">
        <h3>Thông tin sản phẩm:</h3>
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </div>
    </div>
  );
};

export default TestProduct; 