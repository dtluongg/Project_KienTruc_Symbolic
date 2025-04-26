export class ShippingMethodModel {
  constructor(data) {
    this.method_id = data.method_id;
    this.method_name = data.method_name;
    this.base_fee = data.base_fee;
    this.estimated_days = data.estimated_days;
    this.is_active = data.is_active ?? true;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  toJSON() {
    return {
      method_id: this.method_id,
      method_name: this.method_name,
      base_fee: this.base_fee,
      estimated_days: this.estimated_days,
      is_active: this.is_active,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
} 