export class ProductColorModel {
  constructor(data) {
    this.color_id = data.color_id;
    this.product_id = data.product_id;
    this.color_name = data.color_name;
    this.color_code = data.color_code;
    this.price_adjustment = data.price_adjustment || 0;
    this.created_at = data.created_at;
  }

  toJSON() {
    return {
      color_id: this.color_id,
      product_id: this.product_id,
      color_name: this.color_name,
      color_code: this.color_code,
      price_adjustment: this.price_adjustment,
      created_at: this.created_at
    };
  }
} 