"use client";

import { useState, useEffect } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { ToastContainer, toast } from 'react-toastify';
import Image from 'next/image';
import 'react-toastify/dist/ReactToastify.css';

// Define types
interface Product {
  _id: string;
  id?: string;
  name: string;
  category?: string;
  description?: string;
  imageUrl?: string;
  images?: string[];
}

export default function ProductsPage() {
  // Product pages
  const pages = [
    { id: 'dahua-saudi', name: 'Dahua Saudi' },
    { id: 'uniview', name: 'Uniview' },
    { id: 'unv', name: 'UNV' },
    { id: 'hikvision', name: 'Hikvision' }
  ];
  
  // States
  const { products, loading: productsLoading } = useProducts();
  const [selectedPage, setSelectedPage] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null); // Track when products were last saved

  // Load page data when a page is selected
  useEffect(() => {
    if (selectedPage) {
      fetchPageData(selectedPage);
    }
  }, [selectedPage]);

  const fetchPageData = async (pageId: string) => {
    setLoading(true);
    try {
      // Fetch page products only
      const productsResponse = await fetch(`/api/pages/${pageId}/products`);
      if (productsResponse.ok) {
        const productsData = await productsResponse.json();
        setSelectedProducts(productsData.map((p: any) => p._id || p.id));
      } else {
        setSelectedProducts([]);
      }
    } catch (error) {
      console.error('Error fetching page data:', error);
      toast.error('Failed to load page data');
    } finally {
      setLoading(false);
    }
  };

  const handleProductSelection = async (productId: string) => {
    // Toggle product selection
    const newSelectedProducts = selectedProducts.includes(productId)
      ? selectedProducts.filter(id => id !== productId)
      : [...selectedProducts, productId];
    
    setSelectedProducts(newSelectedProducts);
  };

  return (
    <div className="bg-gray-50 min-h-full p-6 rounded-lg shadow-sm">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Page Products</h1>
      </div>
      
      {/* Page Selection */}
      <div className="mb-8">
        <label htmlFor="page-select" className="block text-sm font-medium text-gray-700 mb-2">
          Select Product Page
        </label>
        <select
          id="page-select"
          value={selectedPage}
          onChange={(e) => setSelectedPage(e.target.value)}
          className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Select a page</option>
          {pages.map(page => (
            <option key={page.id} value={page.id}>{page.name}</option>
          ))}
        </select>
      </div>
      
      {/* Page Summary */}
      {selectedPage && (
        <div className="mb-4 bg-white p-4 rounded-md shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-md font-medium text-gray-700">
              {pages.find(p => p.id === selectedPage)?.name} Page Summary
            </h2>
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {selectedProducts.length} Products Assigned
            </span>
          </div>
          
          {selectedProducts.length > 0 && (
            <div className="border-t border-gray-100 pt-2 mt-2">
              <p className="text-sm text-gray-500 mb-2">Assigned products:</p>
              <div className="flex flex-wrap gap-1.5">
                {selectedProducts.map(productId => {
                  const product = products.find(p => (p._id || p.id) === productId);
                  return product ? (
                    <span 
                      key={productId} 
                      className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100"
                    >
                      {product.name}
                    </span>
                  ) : null;
                })}
              </div>
            </div>
          )}
        </div>
      )}
      
      {selectedPage ? (
        <>
          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          )}
          
          {/* Products Management */}
          {!loading && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-lg font-semibold mb-4">
                Select Products for {pages.find(p => p.id === selectedPage)?.name}
              </h2>
              
              {productsLoading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : products.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    {products.map(product => (
                      <div 
                        key={product._id || product.id} 
                        className={`p-4 border rounded-md cursor-pointer ${
                          selectedProducts.includes(product._id || product.id as string) 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handleProductSelection(product._id || product.id as string)}
                      >
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12 mr-3 relative bg-gray-100 rounded overflow-hidden">
                            {product.imageUrl ? (
                              <Image 
                                src={product.imageUrl} 
                                alt={product.name}
                                fill
                                className="object-cover"
                              />
                            ) : (product.images && product.images.length > 0) ? (
                              <Image 
                                src={product.images[0]} 
                                alt={product.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-gray-400">
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{product.name}</p>
                            {product.category && (
                              <p className="text-sm text-gray-500">Category: {product.category}</p>
                            )}
                          </div>
                        </div>
                        <div className="mt-2 flex justify-between items-center">
                          <span className={`text-xs px-2 py-1 rounded ${
                            selectedProducts.includes(product._id || product.id as string) 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {selectedProducts.includes(product._id || product.id as string) ? 'Selected' : 'Not selected'}
                          </span>
                          <input
                            type="checkbox"
                            checked={selectedProducts.includes(product._id || product.id as string)}
                            onChange={() => {}}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Last Saved Notification */}
                  {lastSaved && (
                    <div className="bg-green-50 border border-green-100 rounded-md p-3 mb-4">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-sm text-green-700">
                          Products list was saved successfully {lastSaved.toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-xs text-green-600 ml-7 mt-0.5">
                        {selectedProducts.length} products are now assigned to {pages.find(p => p.id === selectedPage)?.name} page
                      </p>
                    </div>
                  )}
                  
                  {/* Save Button */}
                  <div className="flex flex-col md:flex-row justify-between items-center mt-6">
                    <div className="mb-4 md:mb-0 flex items-center">
                      <span className="text-sm text-gray-600 mr-2">
                        {selectedProducts.length} products selected
                      </span>
                      {loading ? null : (
                        <div className="flex items-center text-xs">
                          <span className="flex h-2 w-2 relative mr-1">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                          </span>
                          <span className="text-green-600">Changes will be saved</span>
                        </div>
                      )}
                    </div>
                    
                    <button
                      onClick={async () => {
                        try {
                          setLoading(true);
                          const response = await fetch(`/api/pages/${selectedPage}/products`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ products: selectedProducts })
                          });
                          
                          if (!response.ok) throw new Error('Failed to save product assignments');
                          
                          setLastSaved(new Date()); // Set the last saved time
                          toast.success(`Successfully assigned ${selectedProducts.length} products to ${pages.find(p => p.id === selectedPage)?.name}`);
                        } catch (error) {
                          console.error('Error saving products:', error);
                          toast.error('Failed to save product assignments');
                        } finally {
                          setLoading(false);
                        }
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Saving...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                          Save Product Assignments
                        </>
                      )}
                    </button>
                  </div>
                </>
              ) : (
                <p className="text-gray-500 text-center py-4">No products available</p>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="bg-white p-12 rounded-lg shadow-md text-center">
          <svg className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.663 17h4.673M12 3v1m0 16v1m9-9h-1M4 12H3m3.343-5.657l-.707-.707M18.364 6.343l.707-.707m-9.193 9.193l-4.243 4.243M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Product Page</h3>
          <p className="text-gray-500 mb-6">
            Please select a product page from the dropdown above to manage its products.
          </p>
        </div>
      )}
    </div>
  );
}