import { cacheService } from '../cacheService.js';
import { ProductRepository } from '../productRepository.js';

const productRepository = new ProductRepository();

// Lấy product từ Redis, nếu không có thì lấy từ Supabase rồi cache vào Redis
export const getProduct = async (req, res) => {
  const { id } = req.params;
  let product = await cacheService.getCachedProduct(id);
  if (product) {
    return res.json(product);
  }
  // Nếu không có, lấy từ Supabase (Postgres)
  product = await productRepository.getById(id);
  if (product) {
    await cacheService.cacheProduct(id, product);
    return res.json(product);
  }
  res.status(404).json({ message: 'Not found' });
};

// Tạo mới product trong Redis
export const createProduct = async (req, res) => {
  const { id, ...data } = req.body;
  await cacheService.cacheProduct(id, { id, ...data });
  res.json({ message: 'Created', id });
};

// Update product trong Redis
export const updateProduct = async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  await cacheService.cacheProduct(id, { id, ...data });
  res.json({ message: 'Updated', id });
};

// Xóa product trong Redis
export const deleteProduct = async (req, res) => {
  const { id } = req.params;
  await cacheService.invalidateCache(`product:${id}`);
  res.json({ message: 'Deleted', id });
};

// Lấy toàn bộ products từ Redis, nếu không có thì lấy từ Supabase rồi cache vào Redis
export const getAllProducts = async (req, res) => {
  let products = await cacheService.getCachedProductList();
  if (products) {
    return res.json(products);
  }
  // Nếu không có, lấy từ Supabase (Postgres)
  products = await productRepository.getAll();
  if (products) {
    await cacheService.cacheProductList(products);
    return res.json(products);
  }
  res.status(404).json({ message: 'No products found' });
}; 