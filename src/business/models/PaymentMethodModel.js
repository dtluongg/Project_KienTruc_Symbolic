export class PaymentMethodModel {
  constructor(data) {
    this.method_id = data.method_id;
    this.method_name = data.method_name;
    this.description = data.description;
    this.is_active = data.is_active ?? true;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  toJSON() {
    return {
      method_id: this.method_id,
      method_name: this.method_name,
      description: this.description,
      is_active: this.is_active,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
} 