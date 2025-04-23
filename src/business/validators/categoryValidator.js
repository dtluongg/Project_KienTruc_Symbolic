export const validateCategory = (category) => {
  const errors = {};

  // Validate tên danh mục
  if (!category.name || category.name.trim() === '') {
    errors.name = 'Tên danh mục không được để trống';
  } else if (category.name.length < 3) {
    errors.name = 'Tên danh mục phải có ít nhất 3 ký tự';
  }

  // Validate slug
  if (!category.slug || category.slug.trim() === '') {
    errors.slug = 'Slug không được để trống';
  } else if (!/^[a-z0-9-]+$/.test(category.slug)) {
    errors.slug = 'Slug chỉ được chứa chữ thường, số và dấu gạch ngang';
  }

  // Validate mô tả
  if (!category.description || category.description.trim() === '') {
    errors.description = 'Mô tả danh mục không được để trống';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}; 