export class ProductInventoryModel {
  constructor(data) {
    this.inventory_id = data.inventory_id;
    this.color_id = data.color_id;
    this.size_id = data.size_id;
    this.stock_quantity = data.stock_quantity;
    this.sku = data.sku;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  toJSON() {
    return {
      inventory_id: this.inventory_id,
      color_id: this.color_id,
      size_id: this.size_id,
      stock_quantity: this.stock_quantity,
      sku: this.sku,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }

  // Kiểm tra còn hàng
  isInStock() {
    return this.stock_quantity > 0;
  }

  // Cập nhật số lượng tồn kho
  updateStock(quantity) {
    this.stock_quantity = quantity;
    this.updated_at = new Date().toISOString();
  }
} 