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
          // 3. Lấy màu sắc của tất cả sản phẩm
          console.log('Đang lấy màu sắc...');
          const { data: colorsData, error: colorsError } = await supabase
            .from('product_colors')
            .select('*')
            .in('product_id', productsData.map(p => p.product_id));

          if (colorsError) throw colorsError;
          console.log('Colors:', colorsData);

          // 4. Lấy kích thước của tất cả sản phẩm
          console.log('Đang lấy kích thước...');
          const { data: sizesData, error: sizesError } = await supabase
            .from('product_sizes')
            .select('*')
            .in('product_id', productsData.map(p => p.product_id));

          if (sizesError) throw sizesError;
          console.log('Sizes:', sizesData);

          // 5. Lấy tồn kho của tất cả sản phẩm
          console.log('Đang lấy tồn kho...');
          const { data: inventoryData, error: inventoryError } = await supabase
            .from('product_inventory')
            .select('*')
            .in('color_id', colorsData.map(c => c.color_id));

          if (inventoryError) throw inventoryError;
          console.log('Inventory:', inventoryData);

          // 6. Lấy ảnh của tất cả sản phẩm
          console.log('Đang lấy ảnh...');
          const { data: imagesData, error: imagesError } = await supabase
            .from('product_images')
            .select('*')
            .in('color_id', colorsData.map(c => c.color_id));

          if (imagesError) throw imagesError;
          console.log('Images:', imagesData);

          // 7. Kết hợp dữ liệu
          const processedProducts = productsData.map(product => {
            const category = categoriesData.find(c => c.category_id === product.category_id);
            const productColors = colorsData.filter(c => c.product_id === product.product_id);
            
            const variants = productColors.map(color => {
              const colorSizes = sizesData.filter(s => s.product_id === product.product_id);
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