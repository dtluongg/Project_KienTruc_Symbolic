export class ProductModel {
  constructor(data) {
    this.product_id = data.product_id;
    this.category_id = data.category_id;
    this.product_name = data.product_name;
    this.slug = data.slug;
    this.description = data.description;
    this.base_price = data.base_price;
    this.is_active = data.is_active ?? true;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  toJSON() {
    return {
      product_id: this.product_id,
      category_id: this.category_id,
      product_name: this.product_name,
      slug: this.slug,
      description: this.description,
      base_price: this.base_price,
      is_active: this.is_active,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }

  // Phương thức tính giá cuối cùng dựa trên màu và size
  calculateFinalPrice(colorAdjustment = 0, sizeAdjustment = 0) {
    return Number(this.base_price) + Number(colorAdjustment) + Number(sizeAdjustment);
  }
} 