'use client';

import { useEffect, useState } from 'react';
import { useSocket } from './useSocket';

export interface IProduct {
  _id?: string;
  id?: string;
  name: string;
  category: string;
  websiteCategory: string;
  status: string;
  description?: string;
  imageUrl?: string;
  cloudinaryId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export function useProducts() {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { socket, isConnected } = useSocket();

  // Initial data loading
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/products');
        
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        
        const data = await response.json();
        setProducts(data);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, []);

  // Real-time updates via Socket.io
  useEffect(() => {
    if (!socket) return;
    
    // Listen to product events
    const handleProductsUpdate = (updatedProducts: IProduct[]) => {
      setProducts(updatedProducts);
    };
    
    const handleProductCreated = (newProduct: IProduct) => {
      setProducts(currentProducts => [newProduct, ...currentProducts]);
    };
    
    const handleProductUpdated = (updatedProduct: IProduct) => {
      setProducts(currentProducts => 
        currentProducts.map(product => 
          product._id === updatedProduct._id ? updatedProduct : product
        )
      );
    };
    
    const handleProductDeleted = (deletedId: string) => {
      setProducts(currentProducts => 
        currentProducts.filter(product => product._id !== deletedId)
      );
    };
    
    // Register listeners
    socket.on('products:updated', handleProductsUpdate);
    socket.on('product:created', handleProductCreated);
    socket.on('product:updated', handleProductUpdated);
    socket.on('product:deleted', handleProductDeleted);
    
    return () => {
      // Clean up listeners
      socket.off('products:updated', handleProductsUpdate);
      socket.off('product:created', handleProductCreated);
      socket.off('product:updated', handleProductUpdated);
      socket.off('product:deleted', handleProductDeleted);
    };
  }, [socket]);

  return { products, loading, error, isRealTimeActive: isConnected };
}