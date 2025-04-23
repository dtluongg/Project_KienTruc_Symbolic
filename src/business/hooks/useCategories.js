import { useState, useEffect } from 'react';
import { supabase } from '../../infrastructure/config/supabase';
import { CategoryModel } from '../../data/models/CategoryModel';

export const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        console.log('Đang lấy categories...');

        // Lấy danh sách categories và số lượng sản phẩm trong một lần truy vấn
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select(`
            *,
            products:products!inner (
              product_id
            )
          `)
          .eq('products.is_active', true);

        if (categoriesError) throw categoriesError;
        console.log('Categories:', categoriesData);

        // Xử lý dữ liệu
        const processedCategories = categoriesData.map(category => {
          const categoryModel = new CategoryModel(category);
          return {
            ...categoryModel.toJSON(),
            count: category.products?.length || 0
          };
        });

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