import express from 'express';
import redisProductRoutes from './api/redisProductRoutes.js';
import mongoose from 'mongoose';

const app = express();
app.use(express.json());

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