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

interface PageCategory {
  _id?: string;
  name: string;
  slug?: string;
  products: string[];
}

interface PageSubcategory {
  _id?: string;
  name: string;
  parentCategoryId: string;
}

export default function CategoriesPage() {
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
  const [pageCategories, setPageCategories] = useState<PageCategory[]>([]);
  const [pageSubcategories, setPageSubcategories] = useState<PageSubcategory[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'subcategories'>('products');
  const [lastSaved, setLastSaved] = useState<Date | null>(null); // Add state for tracking when products were last saved
  
  // Form states
  const [categoryForm, setCategoryForm] = useState({ name: '' });
  const [subcategoryForm, setSubcategoryForm] = useState({ 
    name: '', 
    parentCategoryId: '' 
  });

  // Load page data when a page is selected
  useEffect(() => {
    if (selectedPage) {
      fetchPageData(selectedPage);
    }
  }, [selectedPage]);

  const fetchPageData = async (pageId: string) => {
    setLoading(true);
    try {
      // Fetch page categories
      const categoriesResponse = await fetch(`/api/pages/${pageId}/categories`);
      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json();
        setPageCategories(categoriesData);
      }
      
      // Fetch page subcategories
      const subcategoriesResponse = await fetch(`/api/pages/${pageId}/subcategories`);
      if (subcategoriesResponse.ok) {
        const subcategoriesData = await subcategoriesResponse.json();
        setPageSubcategories(subcategoriesData);
      }
      
      // Fetch page products
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

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!categoryForm.name.trim()) {
      toast.error('Category name is required');
      return;
    }
    
    if (!selectedPage) {
      toast.error('Please select a page first');
      return;
    }
    
    try {
      setLoading(true); // Add loading state while creating
      const response = await fetch(`/api/pages/${selectedPage}/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: categoryForm.name })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create category');
      }
      
      const newCategory = await response.json();
      
      // Refresh the categories data completely rather than just appending
      fetchPageData(selectedPage);
      
      setCategoryForm({ name: '' });
      toast.success('Category created successfully');
    } catch (error) {
      console.error('Error creating category:', error);
      toast.error('Failed to create category');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubcategory = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!subcategoryForm.name.trim()) {
      toast.error('Subcategory name is required');
      return;
    }
    
    if (!subcategoryForm.parentCategoryId) {
      toast.error('Please select a parent category');
      return;
    }
    
    try {
      setLoading(true);
      const response = await fetch(`/api/pages/${selectedPage}/subcategories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(subcategoryForm)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create subcategory');
      }
      
      // Refresh the subcategories data completely
      fetchPageData(selectedPage);
      
      setSubcategoryForm({ name: '', parentCategoryId: '' });
      toast.success('Subcategory created successfully');
    } catch (error) {
      console.error('Error creating subcategory:', error);
      toast.error('Failed to create subcategory');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category? This will also delete all subcategories.')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/pages/${selectedPage}/categories/${categoryId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete category');
      }
      
      // Remove the category from state
      setPageCategories(pageCategories.filter(cat => cat._id !== categoryId));
      // Also remove any subcategories that belonged to this category
      setPageSubcategories(pageSubcategories.filter(sub => sub.parentCategoryId !== categoryId));
      toast.success('Category deleted successfully');
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
    }
  };

  const handleDeleteSubcategory = async (subcategoryId: string) => {
    if (!confirm('Are you sure you want to delete this subcategory?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/pages/${selectedPage}/subcategories/${subcategoryId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete subcategory');
      }
      
      // Remove the subcategory from state
      setPageSubcategories(pageSubcategories.filter(sub => sub._id !== subcategoryId));
      toast.success('Subcategory deleted successfully');
    } catch (error) {
      console.error('Error deleting subcategory:', error);
      toast.error('Failed to delete subcategory');
    }
  };

  return (
    <div className="bg-gray-50 min-h-full p-6 rounded-lg shadow-sm">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Page Products & Categories</h1>
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
          {/* Tabs */}
          <div className="mb-8 border-b border-gray-200">
            <nav className="-mb-px flex space-x-6">
              <button
                onClick={() => setActiveTab('products')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'products'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Products
              </button>
              <button
                onClick={() => setActiveTab('categories')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'categories'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Categories
              </button>
              <button
                onClick={() => setActiveTab('subcategories')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'subcategories'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Subcategories
              </button>
            </nav>
          </div>
          
          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          )}
          
          {/* Products Tab */}
          {!loading && activeTab === 'products' && (
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
                  
                  {/* Enhanced Save Button */}
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
          
          {/* Categories Tab */}
          {!loading && activeTab === 'categories' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Create Category Form */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-lg font-semibold mb-4">Create New Category</h2>
                <form onSubmit={handleCreateCategory}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category Name*
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={categoryForm.name}
                      onChange={(e) => setCategoryForm({ name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Security Cameras"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                  >
                    Create Category
                  </button>
                </form>
              </div>
              
              {/* Categories List */}
              <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-lg font-semibold mb-4">
                  Categories for {pages.find(p => p.id === selectedPage)?.name}
                </h2>
                
                {pageCategories.length > 0 ? (
                  <div className="divide-y divide-gray-200">
                    {pageCategories.map(category => (
                      <div key={category._id} className="py-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">{category.name}</h3>
                            <div className="flex items-center mt-2 text-xs text-gray-500">
                              <span className="mr-3">
                                {pageSubcategories.filter(sub => sub.parentCategoryId === category._id).length} subcategories
                              </span>
                              <span>
                                {category.products?.length || 0} products
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteCategory(category._id as string)}
                            className="inline-flex items-center px-2.5 py-1.5 border border-red-300 text-xs font-medium rounded text-red-700 bg-white hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <p className="text-gray-500">No categories found. Create your first category.</p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Subcategories Tab */}
          {!loading && activeTab === 'subcategories' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Create Subcategory Form */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-lg font-semibold mb-4">Create New Subcategory</h2>
                <form onSubmit={handleCreateSubcategory}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Parent Category*
                    </label>
                    <select
                      name="parentCategoryId"
                      value={subcategoryForm.parentCategoryId}
                      onChange={(e) => setSubcategoryForm({...subcategoryForm, parentCategoryId: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Select a category</option>
                      {pageCategories.map(category => (
                        <option key={category._id} value={category._id}>{category.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subcategory Name*
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={subcategoryForm.name}
                      onChange={(e) => setSubcategoryForm({...subcategoryForm, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Wireless Cameras"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                  >
                    Create Subcategory
                  </button>
                </form>
              </div>
              
              {/* Subcategories List */}
              <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-lg font-semibold mb-4">All Subcategories</h2>
                
                {pageSubcategories.length > 0 ? (
                  <div className="divide-y divide-gray-200">
                    {pageCategories.map(category => (
                      <div key={category._id} className="py-4">
                        <h3 className="text-md font-medium text-gray-700">{category.name}</h3>
                        {pageSubcategories.filter(sub => sub.parentCategoryId === category._id).length > 0 ? (
                          <ul className="mt-2 space-y-2">
                            {pageSubcategories
                              .filter(sub => sub.parentCategoryId === category._id)
                              .map(sub => (
                                <li key={sub._id} className="pl-4 border-l-2 border-gray-200">
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">{sub.name}</span>
                                    <button
                                      onClick={() => handleDeleteSubcategory(sub._id as string)}
                                      className="text-red-600 hover:text-red-800 text-xs"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </li>
                              ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-gray-500 mt-1 italic">No subcategories</p>
                        )}
                      </div>
                    ))}
                    
                    {pageCategories.length === 0 && (
                      <div className="py-8 text-center">
                        <p className="text-gray-500">No categories found. Create categories first.</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <p className="text-gray-500">No subcategories found.</p>
                  </div>
                )}
              </div>
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
            Please select a product page from the dropdown above to manage its products, categories, and subcategories.
          </p>
        </div>
      )}
    </div>
  );
}