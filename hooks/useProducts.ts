'use client';

import { useState, useEffect } from 'react';
import { useSocket } from './useSocket';
import { IProduct } from '@/models/Product';

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
    
    const handleProductsUpdate = (updatedProducts: IProduct[]) => {
      setProducts(updatedProducts);
    };
    
    const handleProductCreated = (newProduct: IProduct) => {
      setProducts(prev => [newProduct, ...prev]);
    };
    
    const handleProductUpdated = (updatedProduct: IProduct) => {
      setProducts(prev => 
        prev.map(p => (p._id === updatedProduct._id || p.id === updatedProduct.id) ? updatedProduct : p)
      );
    };
    
    const handleProductDeleted = (deletedId: string) => {
      setProducts(prev => 
        prev.filter(p => p._id !== deletedId && p.id !== deletedId)
      );
    };
    
    socket.on('products:updated', handleProductsUpdate);
    socket.on('product:created', handleProductCreated);
    socket.on('product:updated', handleProductUpdated);
    socket.on('product:deleted', handleProductDeleted);
    
    return () => {
      socket.off('products:updated', handleProductsUpdate);
      socket.off('product:created', handleProductCreated);
      socket.off('product:updated', handleProductUpdated);
      socket.off('product:deleted', handleProductDeleted);
    };
  }, [socket]);

  return { products, loading, error, isRealTimeActive: isConnected };
}