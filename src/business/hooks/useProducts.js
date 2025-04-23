import { useState, useEffect } from 'react';
import { supabase } from '../../infrastructure/config/supabase';
import { ProductModel } from '../../data/models/ProductModel';
import { ProductColorModel } from '../../data/models/ProductColorModel';
import { ProductSizeModel } from '../../data/models/ProductSizeModel';
import { ProductInventoryModel } from '../../data/models/ProductInventoryModel';
import { ProductImageModel } from '../../data/models/ProductImageModel';

export const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        console.log('Đang lấy sản phẩm...');

        // Lấy danh sách sản phẩm
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select(`
            *,
            category:categories (
              category_name,
              slug
            )
          `)
          .eq('is_active', true);

        if (productsError) throw productsError;

        // Lấy màu sắc cho mỗi sản phẩm
        const { data: colorsData, error: colorsError } = await supabase
          .from('product_colors')
          .select('*');

        if (colorsError) throw colorsError;

        // Lấy kích thước cho mỗi sản phẩm
        const { data: sizesData, error: sizesError } = await supabase
          .from('product_sizes')
          .select('*');

        if (sizesError) throw sizesError;

        // Lấy tồn kho cho mỗi sản phẩm
        const { data: inventoryData, error: inventoryError } = await supabase
          .from('product_inventory')
          .select('*');

        if (inventoryError) throw inventoryError;

        // Lấy ảnh cho mỗi sản phẩm
        const { data: imagesData, error: imagesError } = await supabase
          .from('product_images')
          .select('*');

        if (imagesError) throw imagesError;

        // Xử lý dữ liệu
        const processedProducts = productsData.map(product => {
          const productModel = new ProductModel(product);
          
          // Lấy màu sắc của sản phẩm
          const productColors = colorsData
            .filter(color => color.product_id === product.product_id)
            .map(color => new ProductColorModel(color));

          // Lấy kích thước của sản phẩm
          const productSizes = sizesData
            .filter(size => size.product_id === product.product_id)
            .map(size => new ProductSizeModel(size));

          // Lấy tồn kho của sản phẩm
          const productInventory = inventoryData
            .filter(inventory => 
              productColors.some(color => color.color_id === inventory.color_id) &&
              productSizes.some(size => size.size_id === inventory.size_id)
            )
            .map(inventory => new ProductInventoryModel(inventory));

          // Lấy ảnh của sản phẩm
          const productImages = imagesData
            .filter(image => 
              productColors.some(color => color.color_id === image.color_id)
            )
            .map(image => new ProductImageModel(image));

          return {
            ...productModel.toJSON(),
            colors: productColors.map(color => color.toJSON()),
            sizes: productSizes.map(size => size.toJSON()),
            inventory: productInventory.map(inv => inv.toJSON()),
            images: productImages.map(img => img.toJSON()),
            category: product.category
          };
        });

        console.log('Sản phẩm đã xử lý:', processedProducts);
        setProducts(processedProducts);
        setError(null);
      } catch (err) {
        console.error('Lỗi khi lấy sản phẩm:', err);
        setError(err.message);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return { products, loading, error };
}; 