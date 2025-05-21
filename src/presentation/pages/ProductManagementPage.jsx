import { useState, useEffect } from 'react';
import { supabase } from '../../infrastructure/config/supabase';
import { FiEdit2, FiTrash2, FiEye, FiFilter, FiPlus, FiX } from 'react-icons/fi';

const ProductManagementPage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [productForm, setProductForm] = useState({
    product_name: '',
    category_id: '',
    description: '',
    base_price: '',
    is_active: true,
  });
  const [categories, setCategories] = useState([]);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewProduct, setViewProduct] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [productImages, setProductImages] = useState([]);
  const [imageColorMap, setImageColorMap] = useState([]);
  const [newColors, setNewColors] = useState([{ color_name: '', color_code: '' }]);

  const statusOptions = [
    { value: 'all', label: 'Tất cả' },
    { value: 'active', label: 'Đang bán' },
    { value: 'inactive', label: 'Ngừng bán' }
  ];

  // Fetch products
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*');
      if (error) throw error;
      setProducts(data);
      setFilteredProducts(data);
    } catch (error) {
      setProducts([]);
      setFilteredProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('category_name');
    if (!error) setCategories(data);
  };

  // Fetch product images khi sửa sản phẩm
  const fetchProductImages = async (productId) => {
    const { data, error } = await supabase
      .from('product_images')
      .select('*')
      .eq('product_id', productId);
    if (!error) setProductImages(data);
    else setProductImages([]);
  };

  useEffect(() => { fetchProducts(); fetchCategories(); }, []);

  useEffect(() => {
    if (selectedStatus === 'all') setFilteredProducts(products);
    else if (selectedStatus === 'active') setFilteredProducts(products.filter(p => p.is_active));
    else setFilteredProducts(products.filter(p => !p.is_active));
  }, [selectedStatus, products]);

  // CRUD handlers
  const openCreateModal = () => {
    setProductForm({ product_name: '', category_id: '', description: '', base_price: '', is_active: true });
    setIsEditMode(false);
    setEditingProductId(null);
    setIsModalOpen(true);
    setProductImages([]);
    setImageFiles([]);
    setNewColors([{ color_name: '', color_code: '' }]);
  };
  const openEditModal = (product) => {
    setProductForm({
      product_name: product.product_name || '',
      category_id: product.category_id || '',
      description: product.description || '',
      base_price: product.base_price || '',
      is_active: product.is_active,
    });
    setIsEditMode(true);
    setEditingProductId(product.product_id);
    setIsModalOpen(true);
    fetchProductImages(product.product_id);
    setImageFiles([]);
    setNewColors([{ color_name: '', color_code: '' }]);
  };
  const handleProductFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProductForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };
  const slugify = str => str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9 ]/g, '').trim().replace(/\s+/g, '-').toLowerCase();
  const handleColorChange = (index, field, value) => {
    setNewColors(prev => prev.map((c, i) => i === index ? { ...c, [field]: value } : c));
  };
  const addColor = () => setNewColors(prev => [...prev, { color_name: '', color_code: '' }]);
  const removeColor = (index) => setNewColors(prev => prev.filter((_, i) => i !== index));
  const handleProductFormSubmit = async (e) => {
    e.preventDefault();
    try {
      let productId = editingProductId;
      // Lấy category_name từ categories (so sánh kiểu string)
      const category = categories.find(cat => String(cat.category_id) === String(productForm.category_id));
      const categoryName = category ? category.category_name : 'unknown';
      const slug = `${slugify(categoryName)}-${slugify(productForm.product_name)}`;
      const productData = {
        ...productForm,
        slug,
      };
      if (isEditMode) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('product_id', editingProductId);
        if (error) throw error;
        productId = editingProductId;
        alert('Cập nhật sản phẩm thành công!');
      } else {
        const { data, error } = await supabase
          .from('products')
          .insert([productData])
          .select();
        if (error) throw error;
        productId = data[0].product_id;
        alert('Tạo sản phẩm thành công!');
      }
      // Tạo các màu cho sản phẩm
      const insertedColors = [];
      for (const color of newColors) {
        if (!color.color_name) continue;
        const { data: colorData, error: colorError } = await supabase
          .from('product_colors')
          .insert([{ product_id: productId, color_name: color.color_name, color_code: color.color_code }])
          .select()
          .single();
        if (!colorError && colorData) insertedColors.push(colorData);
      }
      // Upload ảnh nếu có
      if (imageColorMap.length > 0) {
        // Map color_name -> color_id
        const colorNameToId = Object.fromEntries(insertedColors.map(c => [c.color_name, c.color_id]));
        // Gán lại color_id cho imageColorMap dựa trên tên màu
        const mappedImageColorMap = imageColorMap.map(item => {
          // Nếu item.color_id là tên màu (do chọn từ dropdown), map sang id
          const cid = colorNameToId[item.color_id] || item.color_id;
          return { ...item, color_id: cid };
        });
        await uploadProductImages(productId, productForm.category_id, slug, mappedImageColorMap);
      }
      setIsModalOpen(false);
      await fetchProducts();
    } catch (error) {
      alert('Lỗi: ' + error.message);
    }
  };
  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) return;
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('product_id', productId);
      if (error) throw error;
      alert('Xóa sản phẩm thành công!');
      await fetchProducts();
    } catch (error) {
      alert('Lỗi khi xóa sản phẩm: ' + error.message);
    }
  };
  // View modal handlers
  const openViewModal = (product) => {
    setViewProduct(product);
    setIsViewModalOpen(true);
  };

  // Xử lý chọn file ảnh
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImageColorMap(files.map(file => ({ file, color_id: newColors[0]?.color_name || '' })));
  };

  // Khi chọn màu cho ảnh
  const handleImageColorChange = (index, color_id) => {
    setImageColorMap(prev => prev.map((item, i) => i === index ? { ...item, color_id } : item));
  };

  // Lấy danh sách màu của sản phẩm hiện tại
  const productColors = productForm.product_name && editingProductId
    ? (product_colors || []).filter(c => c.product_id === editingProductId)
    : [];

  // Xoá ảnh sản phẩm (khi sửa)
  const handleDeleteImage = async (imageId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xoá ảnh này?')) return;
    // Lấy thông tin ảnh để biết đường dẫn file
    const img = productImages.find(img => img.image_id === imageId);
    if (!img) return;
    // Parse đường dẫn file từ public URL
    const url = new URL(img.image_url);
    const path = decodeURIComponent(url.pathname.replace(/^\/storage\/v1\/object\/public\/symbolicv3\//, ''));
    // Xoá file trên Storage
    await supabase.storage.from('symbolicv3').remove([path]);
    // Xoá record trong DB
    const { error } = await supabase
      .from('product_images')
      .delete()
      .eq('image_id', imageId);
    if (!error) {
      setProductImages(prev => prev.filter(img => img.image_id !== imageId));
      alert('Đã xoá ảnh!');
    } else {
      alert('Lỗi khi xoá ảnh: ' + error.message);
    }
  };

  // Upload ảnh lên Supabase Storage và lưu vào bảng product_images
  const uploadProductImages = async (productId, categoryId, slug, imageColorMapParam) => {
    const category = categories.find(cat => String(cat.category_id) === String(categoryId));
    let categoryName = category ? slugify(category.category_name) : 'unknown';
    const uploadedUrls = [];
    for (const { file, color_id } of imageColorMapParam) {
      if (!color_id) {
        alert('Bạn phải chọn màu cho từng ảnh!');
        continue;
      }
      const fileExt = file.name.split('.').pop();
      const fileName = `${slug}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `danhmucsanpham/${categoryName}/${fileName}`;
      const { error: uploadError } = await supabase.storage
        .from('symbolicv3')
        .upload(filePath, file);
      if (uploadError) {
        console.error('Lỗi upload file:', uploadError.message);
        alert('Lỗi upload file: ' + uploadError.message);
        continue;
      }
      const { data } = supabase.storage.from('symbolicv3').getPublicUrl(filePath);
      if (data?.publicUrl) {
        const { error: dbError } = await supabase.from('product_images').insert({
          color_id,
          image_url: data.publicUrl,
          alt_text: file.name,
        });
        if (dbError) {
          console.error('Lỗi lưu ảnh vào database:', dbError.message);
          alert('Lỗi lưu ảnh vào database: ' + dbError.message);
          continue;
        }
        uploadedUrls.push(data.publicUrl);
      }
    }
    return uploadedUrls;
  };

  return (
    <div className="min-h-screen pt-20 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Quản lý sản phẩm</h1>
            <p className="text-gray-600 mt-2">Xem, tạo, sửa, xóa sản phẩm</p>
          </div>
          <div className="flex items-center space-x-2" style={{color: '#000'}}>
            <button onClick={openCreateModal} className="flex items-center bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
              <FiPlus className="mr-2" /> Tạo sản phẩm mới
            </button>
            <FiFilter className="text-gray-500" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="block w-48 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Modal xem chi tiết sản phẩm */}
        {isViewModalOpen && viewProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg">
              <h2 className="text-xl font-bold mb-4 text-black">Chi tiết sản phẩm</h2>
              <div className="space-y-2 text-black">
                <div><b>Tên sản phẩm:</b> {viewProduct.product_name}</div>
                <div><b>Danh mục:</b> {categories.find(c => c.category_id === viewProduct.category_id)?.category_name || 'Không có'}</div>
                <div><b>Giá:</b> {viewProduct.base_price?.toLocaleString('vi-VN')}đ</div>
                <div><b>Mô tả:</b> {viewProduct.description || 'Không có'}</div>
                <div><b>Trạng thái:</b> {viewProduct.is_active ? <span className="text-green-600">Đang bán</span> : <span className="text-red-600">Ngừng bán</span>}</div>
              </div>
              <div className="flex justify-end mt-4">
                <button onClick={() => setIsViewModalOpen(false)} className="px-4 py-2 bg-gray-300 rounded">Đóng</button>
              </div>
            </div>
          </div>
        )}

        {/* Modal tạo/sửa sản phẩm */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg text-black">
              <h2 className="text-xl font-bold mb-4">{isEditMode ? 'Cập nhật sản phẩm' : 'Tạo sản phẩm mới'}</h2>
              <form onSubmit={handleProductFormSubmit} className="space-y-4">
                <input name="product_name" value={productForm.product_name} onChange={handleProductFormChange} placeholder="Tên sản phẩm" className="w-full border px-3 py-2 rounded" required />
                <select name="category_id" value={productForm.category_id} onChange={handleProductFormChange} className="w-full border px-3 py-2 rounded" required>
                  <option value="">Chọn danh mục</option>
                  {categories.map(cat => (
                    <option key={cat.category_id} value={cat.category_id}>{cat.category_name}</option>
                  ))}
                </select>
                <input name="base_price" type="number" value={productForm.base_price} onChange={handleProductFormChange} placeholder="Giá cơ bản" className="w-full border px-3 py-2 rounded" required />
                <textarea name="description" value={productForm.description} onChange={handleProductFormChange} placeholder="Mô tả" className="w-full border px-3 py-2 rounded" />
                <label className="flex items-center gap-2">
                  <input type="checkbox" name="is_active" checked={productForm.is_active} onChange={handleProductFormChange} /> Đang bán
                </label>
                <div>
                  <label className="block font-medium mb-1">Màu sắc sản phẩm</label>
                  {newColors.map((color, idx) => (
                    <div key={idx} className="flex items-center gap-2 mb-1">
                      <input type="text" placeholder="Tên màu" value={color.color_name} onChange={e => handleColorChange(idx, 'color_name', e.target.value)} className="border px-2 py-1 rounded w-32" />
                      <input type="text" placeholder="Mã màu" value={color.color_code} onChange={e => handleColorChange(idx, 'color_code', e.target.value)} className="border px-2 py-1 rounded w-24" />
                      <button type="button" onClick={() => removeColor(idx)} className="text-red-500">X</button>
                    </div>
                  ))}
                  <button type="button" onClick={addColor} className="text-blue-500 text-sm mt-1">+ Thêm màu</button>
                </div>
                <div>
                  <label className="block font-medium mb-1">Hình ảnh sản phẩm</label>
                  <input type="file" multiple accept="image/*" onChange={handleImageChange} className="mb-2" />
                  {imageColorMap.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {imageColorMap.map((item, idx) => (
                        <div key={idx} className="flex flex-col items-center">
                          <img src={URL.createObjectURL(item.file)} alt="Preview" className="w-20 h-20 object-cover rounded border mb-1" />
                          <select value={item.color_id} onChange={e => handleImageColorChange(idx, e.target.value)} className="w-20 text-xs">
                            <option value="">Chọn màu</option>
                            {newColors.map((color, i) => (
                              <option key={i} value={color.color_name}>{color.color_name}</option>
                            ))}
                          </select>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-300 rounded">Hủy</button>
                  <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded">{isEditMode ? 'Cập nhật' : 'Tạo mới'}</button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <div className="max-h-[600px] overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã sản phẩm</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên sản phẩm</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Danh mục</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giá</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProducts.map((product) => (
                    <tr key={product.product_id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.product_id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.product_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{categories.find(c => c.category_id === product.category_id)?.category_name || 'Không có'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600 font-bold">{product.base_price?.toLocaleString('vi-VN')}đ</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {product.is_active ? <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">Đang bán</span> : <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">Ngừng bán</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openViewModal(product)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <FiEye className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => openEditModal(product)}
                            className="text-yellow-600 hover:text-yellow-900"
                          >
                            <FiEdit2 className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.product_id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <FiTrash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductManagementPage; 