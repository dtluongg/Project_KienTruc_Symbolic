export const validateProduct = (product) => {
  const errors = {};

  // Validate tên sản phẩm
  if (!product.name || product.name.trim() === '') {
    errors.name = 'Tên sản phẩm không được để trống';
  } else if (product.name.length < 3) {
    errors.name = 'Tên sản phẩm phải có ít nhất 3 ký tự';
  }

  // Validate giá
  if (!product.base_price || product.base_price <= 0) {
    errors.base_price = 'Giá sản phẩm phải lớn hơn 0';
  }

  // Validate mô tả
  if (!product.description || product.description.trim() === '') {
    errors.description = 'Mô tả sản phẩm không được để trống';
  }

  // Validate slug
  if (!product.slug || product.slug.trim() === '') {
    errors.slug = 'Slug không được để trống';
  } else if (!/^[a-z0-9-]+$/.test(product.slug)) {
    errors.slug = 'Slug chỉ được chứa chữ thường, số và dấu gạch ngang';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}; 