import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { supabase } from '../../infrastructure/config/supabase';
import { formatCurrency } from '../../infrastructure/utils/format';
import { FiShoppingCart, FiEdit2, FiTrash2, FiPlus, FiX, FiCheck } from 'react-icons/fi';
import '../styles/productForm.css';

const AllProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showEditProductModal, setShowEditProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    product_name: '',
    category_id: '',
    description: '',
    base_price: '',
    is_active: true,
    colors: [{ color_name: '', color_code: '', price_adjustment: 0 }],
    sizes: [{ size_name: '', price_adjustment: 0 }],
    images: []
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get('q') || '';

  useEffect(() => {
    const checkUserRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        setUserRole(profile?.role);
      }
    };

    checkUserRole();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        // Xây dựng query cơ bản
        let query = supabase
          .from('products')
          .select(`
            *,
            categories (
              category_id,
              category_name,
              slug
            )
          `)
          .eq('is_active', true);

        // Thêm điều kiện tìm kiếm nếu có searchQuery
        if (searchQuery) {
          query = query.ilike('product_name', `%${searchQuery}%`);
        }

        const { data: productsData, error: productsError } = await query;

        if (productsError) throw productsError;

        // Lấy màu sắc của tất cả sản phẩm
        const { data: colorsData, error: colorsError } = await supabase
          .from('product_colors')
          .select('*')
          .in('product_id', productsData.map(p => p.product_id));

        if (colorsError) throw colorsError;

        // Lấy kích thước của tất cả sản phẩm
        const { data: sizesData, error: sizesError } = await supabase
          .from('product_sizes')
          .select('*')
          .in('product_id', productsData.map(p => p.product_id));

        if (sizesError) throw sizesError;

        // Lấy tồn kho
        const { data: inventoryData, error: inventoryError } = await supabase
          .from('product_inventory')
          .select('*')
          .in('color_id', colorsData.map(c => c.color_id));

        if (inventoryError) throw inventoryError;

        // Lấy ảnh của tất cả sản phẩm
        const { data: imagesData, error: imagesError } = await supabase
          .from('product_images')
          .select('*')
          .in('color_id', colorsData.map(c => c.color_id));

        if (imagesError) throw imagesError;

        // Xử lý dữ liệu sản phẩm
        const processedProducts = productsData.map(product => {
          const productColors = colorsData.filter(c => c.product_id === product.product_id);
          const primaryColor = productColors[0];
          const primaryImages = imagesData.filter(img => img.color_id === primaryColor?.color_id);
          const primaryImage = primaryImages[0]?.image_url;

          const productSizes = sizesData.filter(s => s.product_id === product.product_id);
          const firstSize = productSizes[0];
          const basePrice = product.base_price;
          const priceAdjust = firstSize?.price_adjustment || 0;
          const finalPrice = basePrice + priceAdjust;

          return {
            ...product,
            primaryImage: primaryImage || '/placeholder.jpg',
            finalPrice
          };
        });

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

    fetchProducts();
  }, [searchQuery]);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('category_name');
      
      if (error) console.error('Lỗi khi lấy danh mục:', error);
      else setCategories(data);
    };

    fetchCategories();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleColorChange = (index, field, value) => {
    const newColors = [...formData.colors];
    newColors[index][field] = value;
    setFormData(prev => ({
      ...prev,
      colors: newColors
    }));
  };

  const handleSizeChange = (index, field, value) => {
    const newSizes = [...formData.sizes];
    newSizes[index][field] = value;
    setFormData(prev => ({
      ...prev,
      sizes: newSizes
    }));
  };

  const addColor = () => {
    setFormData(prev => ({
      ...prev,
      colors: [...prev.colors, { color_name: '', color_code: '', price_adjustment: 0 }]
    }));
  };

  const removeColor = (index) => {
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.filter((_, i) => i !== index)
    }));
  };

  const addSize = () => {
    setFormData(prev => ({
      ...prev,
      sizes: [...prev.sizes, { size_name: '', price_adjustment: 0 }]
    }));
  };

  const removeSize = (index) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.filter((_, i) => i !== index)
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(files);
  };

  const uploadImages = async (colorId) => {
    const uploadedImages = [];
    
    for (const file of imageFiles) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      uploadedImages.push({
        color_id: colorId,
        image_url: publicUrl,
        alt_text: file.name,
        is_primary: uploadedImages.length === 0
      });
    }

    return uploadedImages;
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      // Thêm sản phẩm
      const { data: product, error: productError } = await supabase
        .from('products')
        .insert([{
          product_name: formData.product_name,
          category_id: formData.category_id,
          description: formData.description,
          base_price: formData.base_price,
          is_active: formData.is_active,
          slug: formData.product_name.toLowerCase().replace(/\s+/g, '-')
        }])
        .select()
        .single();

      if (productError) throw productError;

      // Thêm màu sắc
      for (const color of formData.colors) {
        const { data: colorData, error: colorError } = await supabase
          .from('product_colors')
          .insert([{
            product_id: product.product_id,
            color_name: color.color_name,
            color_code: color.color_code,
            price_adjustment: color.price_adjustment
          }])
          .select()
          .single();

        if (colorError) throw colorError;

        // Upload và thêm hình ảnh
        if (imageFiles.length > 0) {
          const images = await uploadImages(colorData.color_id);
          const { error: imageError } = await supabase
            .from('product_images')
            .insert(images);

          if (imageError) throw imageError;
        }
      }

      // Thêm kích thước
      const sizes = formData.sizes.map(size => ({
        product_id: product.product_id,
        size_name: size.size_name,
        price_adjustment: size.price_adjustment
      }));

      const { error: sizeError } = await supabase
        .from('product_sizes')
        .insert(sizes);

      if (sizeError) throw sizeError;

      showNotification('Thêm sản phẩm thành công!');
      // Đóng modal và reload trang
      setShowAddProductModal(false);
      window.location.reload();
    } catch (err) {
      console.error('Lỗi khi thêm sản phẩm:', err);
      showNotification('Có lỗi xảy ra khi thêm sản phẩm', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      // Cập nhật sản phẩm
      const { error: productError } = await supabase
        .from('products')
        .update({
          product_name: formData.product_name,
          category_id: formData.category_id,
          description: formData.description,
          base_price: formData.base_price,
          is_active: formData.is_active,
          slug: formData.product_name.toLowerCase().replace(/\s+/g, '-')
        })
        .eq('product_id', selectedProduct.product_id);

      if (productError) throw productError;

      // Xóa và thêm lại màu sắc
      await supabase
        .from('product_colors')
        .delete()
        .eq('product_id', selectedProduct.product_id);

      for (const color of formData.colors) {
        const { data: colorData, error: colorError } = await supabase
          .from('product_colors')
          .insert([{
            product_id: selectedProduct.product_id,
            color_name: color.color_name,
            color_code: color.color_code,
            price_adjustment: color.price_adjustment
          }])
          .select()
          .single();

        if (colorError) throw colorError;

        // Upload và thêm hình ảnh mới
        if (imageFiles.length > 0) {
          const images = await uploadImages(colorData.color_id);
          const { error: imageError } = await supabase
            .from('product_images')
            .insert(images);

          if (imageError) throw imageError;
        }
      }

      // Xóa và thêm lại kích thước
      await supabase
        .from('product_sizes')
        .delete()
        .eq('product_id', selectedProduct.product_id);

      const sizes = formData.sizes.map(size => ({
        product_id: selectedProduct.product_id,
        size_name: size.size_name,
        price_adjustment: size.price_adjustment
      }));

      const { error: sizeError } = await supabase
        .from('product_sizes')
        .insert(sizes);

      if (sizeError) throw sizeError;

      showNotification('Cập nhật sản phẩm thành công!');
      // Đóng modal và reload trang
      setShowEditProductModal(false);
      window.location.reload();
    } catch (err) {
      console.error('Lỗi khi cập nhật sản phẩm:', err);
      showNotification('Có lỗi xảy ra khi cập nhật sản phẩm', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      try {
        // Xóa các bản ghi liên quan trước
        await supabase.from('product_images').delete().eq('product_id', productId);
        await supabase.from('product_colors').delete().eq('product_id', productId);
        await supabase.from('product_sizes').delete().eq('product_id', productId);
        
        // Xóa sản phẩm
        const { error } = await supabase
          .from('products')
          .delete()
          .eq('product_id', productId);

        if (error) throw error;
        
        // Cập nhật lại danh sách sản phẩm
        setProducts(products.filter(p => p.product_id !== productId));
      } catch (err) {
        console.error('Lỗi khi xóa sản phẩm:', err);
        alert('Có lỗi xảy ra khi xóa sản phẩm');
      }
    }
  };

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

  return (
    <div className="min-h-screen pt-20 pb-12">
      {notification.show && (
        <div className={`notification ${notification.type}`}>
          <FiCheck className="mr-2" />
          {notification.message}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-12">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Tất cả sản phẩm</h1>
            <p className="text-gray-400 max-w-2xl">
              Khám phá bộ sưu tập đa dạng các sản phẩm của chúng tôi
            </p>
          </div>
          
          {userRole === 'manager' && (
            <div className="flex gap-4">
              <button
                onClick={() => setShowAddProductModal(true)}
                className="flex items-center gap-2 bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition-colors"
              >
                <FiPlus size={20} />
                Thêm sản phẩm
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product.product_id} className="product-card group">
              <Link to={`/product/${product.slug}`} className="block relative">
                <img
                  src={product.primaryImage}
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
                  {product.categories.category_name}
                </p>
                <div className="flex justify-between items-center mt-4">
                  <div className="flex items-center gap-2">
                    <span className="product-price">
                      {formatCurrency(product.finalPrice)}
                    </span>
                    {product.compare_at_price > product.finalPrice && (
                      <span className="product-price-old">
                        {formatCurrency(product.compare_at_price)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      className="w-10 h-10 flex items-center justify-center bg-indigo-500 text-white rounded-full hover:bg-indigo-600 transition-colors"
                      title="Thêm vào giỏ hàng"
                    >
                      <FiShoppingCart size={18} />
                    </button>
                    {userRole === 'manager' && (
                      <>
                        <button
                          onClick={() => {
                            setSelectedProduct(product);
                            setShowEditProductModal(true);
                          }}
                          className="w-10 h-10 flex items-center justify-center bg-yellow-500 text-white rounded-full hover:bg-yellow-600 transition-colors"
                          title="Cập nhật sản phẩm"
                        >
                          <FiEdit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.product_id)}
                          className="w-10 h-10 flex items-center justify-center bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                          title="Xóa sản phẩm"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal thêm sản phẩm */}
      {showAddProductModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="product-form">
            <div className="modal-header">
              <h2 className="modal-title">Thêm sản phẩm mới</h2>
              <button
                onClick={() => setShowAddProductModal(false)}
                className="close-btn"
              >
                <FiX size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label>Tên sản phẩm</label>
                <input
                  type="text"
                  name="product_name"
                  value={formData.product_name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <label>Danh mục</label>
                <select
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Chọn danh mục</option>
                  {categories.map(category => (
                    <option key={category.category_id} value={category.category_id}>
                      {category.category_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label>Mô tả</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                />
              </div>

              <div>
                <label>Giá cơ bản</label>
                <input
                  type="number"
                  name="base_price"
                  value={formData.base_price}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <label>Màu sắc</label>
                {formData.colors.map((color, index) => (
                  <div key={index} className="color-item">
                    <input
                      type="text"
                      placeholder="Tên màu"
                      value={color.color_name}
                      onChange={(e) => handleColorChange(index, 'color_name', e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="Mã màu"
                      value={color.color_code}
                      onChange={(e) => handleColorChange(index, 'color_code', e.target.value)}
                    />
                    <input
                      type="number"
                      placeholder="Giá điều chỉnh"
                      value={color.price_adjustment}
                      onChange={(e) => handleColorChange(index, 'price_adjustment', parseFloat(e.target.value))}
                      className="price-input"
                    />
                    <button
                      type="button"
                      onClick={() => removeColor(index)}
                      className="remove-btn"
                    >
                      Xóa
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addColor}
                  className="add-btn"
                >
                  Thêm màu
                </button>
              </div>

              <div>
                <label>Kích thước</label>
                {formData.sizes.map((size, index) => (
                  <div key={index} className="size-item">
                    <input
                      type="text"
                      placeholder="Tên kích thước"
                      value={size.size_name}
                      onChange={(e) => handleSizeChange(index, 'size_name', e.target.value)}
                    />
                    <input
                      type="number"
                      placeholder="Giá điều chỉnh"
                      value={size.price_adjustment}
                      onChange={(e) => handleSizeChange(index, 'price_adjustment', parseFloat(e.target.value))}
                      className="price-input"
                    />
                    <button
                      type="button"
                      onClick={() => removeSize(index)}
                      className="remove-btn"
                    >
                      Xóa
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addSize}
                  className="add-btn"
                >
                  Thêm kích thước
                </button>
              </div>

              <div>
                <label>Hình ảnh</label>
                <input
                  type="file"
                  multiple
                  onChange={handleImageChange}
                  className="file-input"
                  accept="image/*"
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(false)}
                  className="cancel-btn"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="submit-btn"
                >
                  {uploading ? 'Đang lưu...' : 'Lưu sản phẩm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal cập nhật sản phẩm */}
      {showEditProductModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="product-form">
            <div className="modal-header">
              <h2 className="modal-title">Cập nhật sản phẩm</h2>
              <button
                onClick={() => setShowEditProductModal(false)}
                className="close-btn"
              >
                <FiX size={24} />
              </button>
            </div>
            
            <form onSubmit={handleUpdateProduct} className="space-y-4">
              <div>
                <label>Tên sản phẩm</label>
                <input
                  type="text"
                  name="product_name"
                  value={formData.product_name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <label>Danh mục</label>
                <select
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Chọn danh mục</option>
                  {categories.map(category => (
                    <option key={category.category_id} value={category.category_id}>
                      {category.category_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label>Mô tả</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                />
              </div>

              <div>
                <label>Giá cơ bản</label>
                <input
                  type="number"
                  name="base_price"
                  value={formData.base_price}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <label>Màu sắc</label>
                {formData.colors.map((color, index) => (
                  <div key={index} className="color-item">
                    <input
                      type="text"
                      placeholder="Tên màu"
                      value={color.color_name}
                      onChange={(e) => handleColorChange(index, 'color_name', e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="Mã màu"
                      value={color.color_code}
                      onChange={(e) => handleColorChange(index, 'color_code', e.target.value)}
                    />
                    <input
                      type="number"
                      placeholder="Giá điều chỉnh"
                      value={color.price_adjustment}
                      onChange={(e) => handleColorChange(index, 'price_adjustment', parseFloat(e.target.value))}
                      className="price-input"
                    />
                    <button
                      type="button"
                      onClick={() => removeColor(index)}
                      className="remove-btn"
                    >
                      Xóa
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addColor}
                  className="add-btn"
                >
                  Thêm màu
                </button>
              </div>

              <div>
                <label>Kích thước</label>
                {formData.sizes.map((size, index) => (
                  <div key={index} className="size-item">
                    <input
                      type="text"
                      placeholder="Tên kích thước"
                      value={size.size_name}
                      onChange={(e) => handleSizeChange(index, 'size_name', e.target.value)}
                    />
                    <input
                      type="number"
                      placeholder="Giá điều chỉnh"
                      value={size.price_adjustment}
                      onChange={(e) => handleSizeChange(index, 'price_adjustment', parseFloat(e.target.value))}
                      className="price-input"
                    />
                    <button
                      type="button"
                      onClick={() => removeSize(index)}
                      className="remove-btn"
                    >
                      Xóa
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addSize}
                  className="add-btn"
                >
                  Thêm kích thước
                </button>
              </div>

              <div>
                <label>Hình ảnh</label>
                <input
                  type="file"
                  multiple
                  onChange={handleImageChange}
                  className="file-input"
                  accept="image/*"
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => setShowEditProductModal(false)}
                  className="cancel-btn"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="submit-btn"
                >
                  {uploading ? 'Đang cập nhật...' : 'Cập nhật sản phẩm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllProductsPage; 