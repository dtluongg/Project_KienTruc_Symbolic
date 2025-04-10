import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';

export const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        console.log('Đang lấy categories...');

        // Lấy danh sách categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*');
        
        if (categoriesError) throw categoriesError;
        console.log('Categories:', categoriesData);

        // Lấy số lượng sản phẩm cho mỗi category
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('category_id')
          .eq('is_active', true);

        if (productsError) throw productsError;

        // Đếm số lượng sản phẩm cho mỗi category
        const productCounts = productsData.reduce((acc, product) => {
          acc[product.category_id] = (acc[product.category_id] || 0) + 1;
          return acc;
        }, {});

        // Kết hợp dữ liệu
        const processedCategories = categoriesData.map(category => ({
          ...category,
          count: productCounts[category.category_id] || 0
        }));

        console.log('Processed Categories:', processedCategories);
        setCategories(processedCategories);
        setError(null);
      } catch (err) {
        console.error('Lỗi khi lấy categories:', err);
        setError(err.message);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, loading, error };
}; 