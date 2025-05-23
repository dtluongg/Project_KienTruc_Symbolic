import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  product_id: Number,
  category_id: Number,
  product_name: String,
  slug: String,
  description: String,
  base_price: Number,
  created_at: Date,
  updated_at: Date,
  is_active: Boolean
  // Thêm các trường khác nếu cần
});

export default mongoose.model('Product', ProductSchema); 