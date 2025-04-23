export class ProductImageModel {
  constructor(data) {
    this.image_id = data.image_id;
    this.color_id = data.color_id;
    this.image_url = data.image_url;
    this.alt_text = data.alt_text;
    this.is_primary = data.is_primary || false;
    this.display_order = data.display_order || 0;
  }

  toJSON() {
    return {
      image_id: this.image_id,
      color_id: this.color_id,
      image_url: this.image_url,
      alt_text: this.alt_text,
      is_primary: this.is_primary,
      display_order: this.display_order
    };
  }

  // Kiểm tra có phải ảnh chính không
  isPrimary() {
    return this.is_primary;
  }

  // Đặt làm ảnh chính
  setAsPrimary() {
    this.is_primary = true;
  }

  // Bỏ làm ảnh chính
  unsetAsPrimary() {
    this.is_primary = false;
  }
} 