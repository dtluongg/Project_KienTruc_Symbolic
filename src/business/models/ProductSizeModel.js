export class ProductSizeModel {
  constructor(data) {
    this.size_id = data.size_id;
    this.product_id = data.product_id;
    this.size_name = data.size_name;
    this.price_adjustment = data.price_adjustment || 0;
    this.is_active = data.is_active ?? true;
  }

  toJSON() {
    return {
      size_id: this.size_id,
      product_id: this.product_id,
      size_name: this.size_name,
      price_adjustment: this.price_adjustment,
      is_active: this.is_active
    };
  }
} 