import express from 'express';
import redisProductRoutes from './api/redisProductRoutes.js';

const app = express();
app.use(express.json());

// Route cho CRUD Redis Product
app.use('/redis', redisProductRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Test server is running on port ${PORT}`);
}); 