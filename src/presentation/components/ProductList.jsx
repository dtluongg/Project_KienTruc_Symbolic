import React, { useEffect, useState } from 'react';
import { cacheService } from '../../business/services/cacheService';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Try to get from cache first
        let cachedProducts = await cacheService.getCachedProductList();
        
        if (cachedProducts) {
          console.log('Products loaded from cache');
          setProducts(cachedProducts);
          setLoading(false);
          return;
        }

        // If not in cache, fetch from API
        const response = await fetch('your-api-endpoint/products');
        const data = await response.json();
        
        // Cache the results
        await cacheService.cacheProductList(data);
        
        setProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Products</h1>
      <div className="product-grid">
        {products.map(product => (
          <div key={product.id} className="product-card">
            <h2>{product.name}</h2>
            <p>{product.description}</p>
            <p>Price: ${product.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductList; 