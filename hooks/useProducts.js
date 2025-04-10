import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';

export const useProducts = (categorySlug = null) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        console.log('Bắt đầu lấy dữ liệu...');

        // 1. Lấy danh sách categories
        console.log('Đang lấy categories...');
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*');
        
        if (categoriesError) throw categoriesError;
        console.log('Categories:', categoriesData);

        // 2. Lấy danh sách sản phẩm
        console.log('Đang lấy sản phẩm...');
        let query = supabase
          .from('products')
          .select('*')
          .eq('is_active', true);

        // Nếu có categorySlug, lọc theo category
        if (categorySlug) {
          const category = categoriesData.find(c => c.slug === categorySlug);
          if (category) {
            query = query.eq('category_id', category.category_id);
          }
        }

        const { data: productsData, error: productsError } = await query;
        if (productsError) throw productsError;
        console.log('Products:', productsData);

        if (productsData && productsData.length > 0) {
          // 3. Lấy variants của tất cả sản phẩm
          console.log('Đang lấy variants...');
          const { data: variantsData, error: variantsError } = await supabase
            .from('productvariants')
            .select('*')
            .in('product_id', productsData.map(p => p.product_id));

          if (variantsError) throw variantsError;
          console.log('Variants:', variantsData);

          // 4. Lấy images của tất cả variants
          console.log('Đang lấy images...');
          const { data: imagesData, error: imagesError } = await supabase
            .from('productimages')
            .select('*')
            .in('variant_id', variantsData.map(v => v.variant_id));

          if (imagesError) throw imagesError;
          console.log('Images:', imagesData);

          // 5. Kết hợp dữ liệu
          const processedProducts = productsData.map(product => {
            const category = categoriesData.find(c => c.category_id === product.category_id);
            const productVariants = variantsData.filter(v => v.product_id === product.product_id);
            
            const variants = productVariants.map(variant => ({
              ...variant,
              images: imagesData.filter(img => img.variant_id === variant.variant_id)
            }));

            // Lấy ảnh đầu tiên của variant đầu tiên làm ảnh chính
            const primaryImage = variants[0]?.images[0]?.image_url || null;

            return {
              ...product,
              category,
              variants,
              primaryImage
            };
          });

          console.log('Processed Products:', processedProducts);
          setProducts(processedProducts);
          setError(null);
        } else {
          setProducts([]);
        }
      } catch (err) {
        console.error('Lỗi khi lấy sản phẩm:', err);
        setError(err.message);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categorySlug]);

  return { products, loading, error };
}; 