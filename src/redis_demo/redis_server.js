import express from 'express';
import redisProductRoutes from './api/redisProductRoutes.js';
import mongoose from 'mongoose';
import rateLimit from 'express-rate-limit';

const app = express();
app.use(express.json());

// Giới hạn 5 request mỗi phút cho mỗi IP vào /redis/products
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 phút
  max: 5, // tối đa 5 request
  message: { error: 'Bạn đã gửi quá nhiều request, vui lòng thử lại sau 1 phút.' }
});

app.use('/redis/products', apiLimiter);

// Route cho CRUD Redis Product
app.use('/redis', redisProductRoutes);

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/mydb';
mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB!'))
  .catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Test server is running on port ${PORT}`);
}); 