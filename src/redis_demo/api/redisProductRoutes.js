import express from 'express';
import { getProduct, createProduct, updateProduct, deleteProduct, getAllProducts } from './redisProductController.js';

const router = express.Router();

router.get('/products/:id', getProduct);
router.post('/products', createProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);
router.get('/products', getAllProducts);

export default router; 