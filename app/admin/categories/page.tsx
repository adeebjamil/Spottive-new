"use client";

import { useState, useEffect } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Link from 'next/link';
import Image from 'next/image';

// Types
interface Category {
  _id?: string;
  name: string;
  slug: string;
  description?: string;
  subcategories: SubCategory[];
  createdAt?: Date;
  updatedAt?: Date;
}

interface SubCategory {
  _id?: string;
  name: string;
  slug: string;
}

interface BrandPage {
  id: string;
  name: string;
  slug: string;
}

type CategoryFormData = {
  name: string;
  description: string;
};

type SubCategoryFormData = {
  name: string;
  parentId: string;
};

type AssignProductData = {
  productId: string;
  categoryId: string;
  subcategoryId: string;
};

export default function CategoriesPage() {
  // Products state
  const { products, loading: productsLoading } = useProducts();
  
  // Categories state
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Brand Pages state
  const [brandPages, setBrandPages] = useState<BrandPage[]>([]);
  const [brandPageForm, setBrandPageForm] = useState({ name: '' });
  const [assignBrandForm, setAssignBrandForm] = useState({
    productId: '',
    brandPageIds: [] as string[]
  });

  // Form states
  const [categoryForm, setCategoryForm] = useState<CategoryFormData>({ name: '', description: '' });
  const [subcategoryForm, setSubcategoryForm] = useState<SubCategoryFormData>({ name: '', parentId: '' });
  const [assignProductForm, setAssignProductForm] = useState<AssignProductData>({
    productId: '',
    categoryId: '',
    subcategoryId: ''
  });
  
  // UI states
  const [activeTab, setActiveTab] = useState<'categories' | 'subcategories' | 'assign' | 'brandpages'>('categories');
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  
  // Fetch categories and brand pages on mount
  useEffect(() => {
    fetchCategories();
    fetchBrandPages();
  }, []);
  
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/categories');
      
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const fetchBrandPages = async () => {
    try {
      const response = await fetch('/api/brandpages');
      
      if (!response.ok) {
        throw new Error('Failed to fetch brand pages');
      }
      
      const data = await response.json();
      setBrandPages(data);
    } catch (err) {
      console.error('Error fetching brand pages:', err);
      toast.error('Failed to load brand pages');
    }
  };
  
  // Handle category form change
  const handleCategoryFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCategoryForm(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle subcategory form change
  const handleSubcategoryFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSubcategoryForm(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle assign product form change
  const handleAssignProductFormChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAssignProductForm(prev => ({ ...prev, [name]: value }));
    
    // If category changes, reset subcategory
    if (name === 'categoryId') {
      setAssignProductForm(prev => ({ ...prev, subcategoryId: '' }));
    }
  };

  // Handle assign brand pages form change
  const handleAssignBrandFormChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.name === 'productId') {
      setAssignBrandForm({
        productId: e.target.value,
        brandPageIds: []
      });
    }
  };

  // Handle checkbox for multiple brand page selection
  const handleBrandCheckboxChange = (brandId: string) => {
    setAssignBrandForm(prev => {
      const isSelected = prev.brandPageIds.includes(brandId);
      return {
        ...prev,
        brandPageIds: isSelected
          ? prev.brandPageIds.filter(id => id !== brandId)
          : [...prev.brandPageIds, brandId]
      };
    });
  };
  
  // Create category
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!categoryForm.name.trim()) {
      toast.error('Category name is required');
      return;
    }
    
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(categoryForm)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create category');
      }
      
      toast.success('Category created successfully');
      setCategoryForm({ name: '', description: '' });
      fetchCategories();
    } catch (err) {
      console.error('Error creating category:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to create category');
    }
  };
  
  // Create subcategory
  const handleCreateSubcategory = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!subcategoryForm.name.trim()) {
      toast.error('Subcategory name is required');
      return;
    }
    
    if (!subcategoryForm.parentId) {
      toast.error('Please select a parent category');
      return;
    }
    
    try {
      const response = await fetch(`/api/categories/${subcategoryForm.parentId}/subcategories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: subcategoryForm.name })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create subcategory');
      }
      
      toast.success('Subcategory created successfully');
      setSubcategoryForm({ name: '', parentId: '' });
      fetchCategories();
    } catch (err) {
      console.error('Error creating subcategory:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to create subcategory');
    }
  };

  // Create a brand page
  const handleCreateBrandPage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!brandPageForm.name.trim()) {
      toast.error('Brand page name is required');
      return;
    }
    
    try {
      const response = await fetch('/api/brandpages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(brandPageForm)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create brand page');
      }
      
      toast.success('Brand page created successfully');
      setBrandPageForm({ name: '' });
      fetchBrandPages();
    } catch (err) {
      console.error('Error creating brand page:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to create brand page');
    }
  };

  // Assign product to category/subcategory
  const handleAssignProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!assignProductForm.productId) {
      toast.error('Please select a product');
      return;
    }
    
    if (!assignProductForm.categoryId) {
      toast.error('Please select a category');
      return;
    }
    
    try {
      const response = await fetch(`/api/products/${assignProductForm.productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          websiteCategory: assignProductForm.categoryId,
          subcategory: assignProductForm.subcategoryId || undefined
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to assign product');
      }
      
      toast.success('Product assigned successfully');
      setAssignProductForm({ productId: '', categoryId: '', subcategoryId: '' });
    } catch (err) {
      console.error('Error assigning product:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to assign product');
    }
  };

  // Assign product to brand pages
  const handleAssignBrandPages = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!assignBrandForm.productId) {
      toast.error('Please select a product');
      return;
    }
    
    try {
      const response = await fetch(`/api/products/${assignBrandForm.productId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          brandPages: assignBrandForm.brandPageIds
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to assign brand pages');
      }
      
      toast.success('Brand pages assigned successfully');
      setAssignBrandForm({ productId: '', brandPageIds: [] });
    } catch (err) {
      console.error('Error assigning brand pages:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to assign brand pages');
    }
  };

  // Delete category
  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete category');
      }
      
      toast.success('Category deleted successfully');
      fetchCategories();
    } catch (err) {
      console.error('Error deleting category:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to delete category');
    }
  };
  
  // Delete subcategory
  const handleDeleteSubcategory = async (categoryId: string, subcategoryId: string) => {
    if (!confirm('Are you sure you want to delete this subcategory? This action cannot be undone.')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/categories/${categoryId}/subcategories/${subcategoryId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete subcategory');
      }
      
      toast.success('Subcategory deleted successfully');
      fetchCategories();
    } catch (err) {
      console.error('Error deleting subcategory:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to delete subcategory');
    }
  };

  // Delete brand page
  const handleDeleteBrandPage = async (id: string) => {
    if (!confirm('Are you sure you want to delete this brand page? This action cannot be undone.')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/brandpages/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete brand page');
      }
      
      toast.success('Brand page deleted successfully');
      fetchBrandPages();
    } catch (err) {
      console.error('Error deleting brand page:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to delete brand page');
    }
  };

  // Get available subcategories for selected category
  const getSubcategoriesForCategory = () => {
    const selectedCategory = categories.find(cat => cat._id === assignProductForm.categoryId);
    return selectedCategory?.subcategories || [];
  };

  // Load product's current brand pages when product is selected
  useEffect(() => {
    if (assignBrandForm.productId) {
      const product = products.find(p => p._id === assignBrandForm.productId || p.id === assignBrandForm.productId);
      if (product && product.brandPages) {
        setAssignBrandForm(prev => ({
          ...prev,
          brandPageIds: Array.isArray(product.brandPages) ? product.brandPages : []
        }));
      }
    }
  }, [assignBrandForm.productId, products]);
  
  return (
    <div className="bg-gray-50 min-h-full p-6 rounded-lg shadow-sm">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Category Management</h1>
      </div>
      
      {/* Tabs */}
      <div className="mb-8 border-b border-gray-200">
        <nav className="-mb-px flex space-x-6">
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
          <button
            onClick={() => setActiveTab('brandpages')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'brandpages'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Brand Pages
          </button>
          <button
            onClick={() => setActiveTab('assign')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'assign'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Assign Products
          </button>
        </nav>
      </div>
      
      {/* Categories Tab */}
      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Category Form */}
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
                  onChange={handleCategoryFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Featured Products"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={categoryForm.description}
                  onChange={handleCategoryFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Category description"
                  rows={3}
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
            <h2 className="text-lg font-semibold mb-4">Categories</h2>
            
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : categories.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {categories.map(category => (
                  <div key={category._id} className="py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{category.name}</h3>
                        {category.description && (
                          <p className="text-sm text-gray-500 mt-1">{category.description}</p>
                        )}
                        <div className="flex items-center mt-2 text-xs text-gray-500">
                          <span className="mr-3">Slug: {category.slug}</span>
                          <span>{category.subcategories.length} subcategories</span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setExpandedCategory(expandedCategory === (category._id ?? '') ? null : (category._id ?? ''))}
                          className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                        >
                          {expandedCategory === category._id ? 'Hide details' : 'View details'}
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category._id!)}
                          className="inline-flex items-center px-2.5 py-1.5 border border-red-300 text-xs font-medium rounded text-red-700 bg-white hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    
                    {expandedCategory === category._id && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Subcategories:</h4>
                        {category.subcategories.length > 0 ? (
                          <ul className="list-disc list-inside space-y-1">
                            {category.subcategories.map(sub => (
                              <li key={sub._id} className="text-sm text-gray-600">
                                {sub.name}
                                <button
                                  onClick={() => handleDeleteSubcategory(category._id!, sub._id!)}
                                  className="ml-2 text-red-600 hover:text-red-800 text-xs"
                                >
                                  Delete
                                </button>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-gray-500 italic">No subcategories</p>
                        )}
                      </div>
                    )}
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
      {activeTab === 'subcategories' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Subcategory Form */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-4">Create New Subcategory</h2>
            <form onSubmit={handleCreateSubcategory}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Parent Category*
                </label>
                <select
                  name="parentId"
                  value={subcategoryForm.parentId}
                  onChange={handleSubcategoryFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
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
                  onChange={handleSubcategoryFormChange}
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
            
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {categories.map(category => (
                  <div key={category._id} className="py-4">
                    <h3 className="text-md font-medium text-gray-700">{category.name}</h3>
                    {category.subcategories.length > 0 ? (
                      <ul className="mt-2 space-y-2">
                        {category.subcategories.map(sub => (
                          <li key={sub._id} className="pl-4 border-l-2 border-gray-200">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">{sub.name}</span>
                              <button
                                onClick={() => handleDeleteSubcategory(category._id!, sub._id!)}
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
                
                {categories.length === 0 && (
                  <div className="py-8 text-center">
                    <p className="text-gray-500">No categories found. Create categories first.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Brand Pages Tab */}
      {activeTab === 'brandpages' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Brand Page Form */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-4">Create New Brand Page</h2>
            <form onSubmit={handleCreateBrandPage}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Brand Page Name*
                </label>
                <input
                  type="text"
                  name="name"
                  value={brandPageForm.name}
                  onChange={(e) => setBrandPageForm({ name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Dahua, Uniview, UNV, etc."
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
              >
                Create Brand Page
              </button>
            </form>
          </div>
          
          {/* Brand Pages List */}
          <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-4">Brand Pages</h2>
            
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : brandPages.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {brandPages.map(brandPage => (
                  <div key={brandPage.id} className="py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{brandPage.name}</h3>
                        <div className="flex items-center mt-2 text-xs text-gray-500">
                          <span>URL: /products/{brandPage.slug}</span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleDeleteBrandPage(brandPage.id)}
                          className="inline-flex items-center px-2.5 py-1.5 border border-red-300 text-xs font-medium rounded text-red-700 bg-white hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="text-gray-500">No brand pages found. Create your first brand page.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Assign Products Tab */}
      {activeTab === 'assign' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Assign Product Form */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-4">Assign Product to Category</h2>
            <form onSubmit={handleAssignProduct}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Product*
                </label>
                <select
                  name="productId"
                  value={assignProductForm.productId}
                  onChange={handleAssignProductFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select a product</option>
                  {products.map(product => (
                    <option key={product._id || product.id} value={product._id || product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Category*
                </label>
                <select
                  name="categoryId"
                  value={assignProductForm.categoryId}
                  onChange={handleAssignProductFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category._id} value={category._id}>{category.name}</option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Subcategory (Optional)
                </label>
                <select
                  name="subcategoryId"
                  value={assignProductForm.subcategoryId}
                  onChange={handleAssignProductFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  disabled={!assignProductForm.categoryId}
                >
                  <option value="">Select a subcategory</option>
                  {getSubcategoriesForCategory().map(sub => (
                    <option key={sub._id} value={sub._id}>{sub.name}</option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                disabled={!assignProductForm.productId || !assignProductForm.categoryId}
              >
                Assign Product
              </button>
            </form>
          </div>
          
          {/* Assign Product to Brand Pages */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-4">Assign Product to Brand Pages</h2>
            <form onSubmit={handleAssignBrandPages}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Product*
                </label>
                <select
                  name="productId"
                  value={assignBrandForm.productId}
                  onChange={handleAssignBrandFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select a product</option>
                  {products.map(product => (
                    <option key={product._id || product.id} value={product._id || product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Brand Pages
                </label>
                <div className="space-y-2 max-h-60 overflow-y-auto border border-gray-300 rounded-md p-3">
                  {brandPages.map(brandPage => (
                    <div key={brandPage.id} className="flex items-center">
                      <input
                        id={`brand-${brandPage.id}`}
                        type="checkbox"
                        checked={assignBrandForm.brandPageIds.includes(brandPage.id)}
                        onChange={() => handleBrandCheckboxChange(brandPage.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`brand-${brandPage.id}`} className="ml-2 text-sm text-gray-700">
                        {brandPage.name}
                      </label>
                    </div>
                  ))}
                  {brandPages.length === 0 && (
                    <p className="text-sm text-gray-500 italic">No brand pages available. Create some first.</p>
                  )}
                </div>
              </div>
              
              <button
                type="submit"
                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                disabled={!assignBrandForm.productId}
              >
                Assign Brand Pages
              </button>
            </form>
          </div>
          
          {/* Products with Brand Pages */}
          <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-4">Products & Brand Pages</h2>
            
            {productsLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Brand Pages
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {products.map(product => {
                      // Find brand page names for this product
                      const assignedBrandPages = product.brandPages || [];
                      const brandPageNames = brandPages
                        .filter(bp => assignedBrandPages.includes(bp.id))
                        .map(bp => bp.name);
                      
                      return (
                        <tr key={product._id || product.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 relative">
                                {product.imageUrl ? (
                                  <Image
                                    src={product.imageUrl}
                                    alt={product.name}
                                    className="h-10 w-10 rounded-md object-cover"
                                    width={40}
                                    height={40}
                                  />
                                ) : (
                                  <div className="h-10 w-10 rounded-md bg-gray-200 flex items-center justify-center text-gray-400">
                                    <span className="text-xs">No img</span>
                                  </div>
                                )}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                <div className="text-sm text-gray-500">{product.category}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1">
                              {brandPageNames.length > 0 ? (
                                brandPageNames.map(name => (
                                  <span 
                                    key={name} 
                                    className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800"
                                  >
                                    {name}
                                  </span>
                                ))
                              ) : (
                                <span className="text-sm text-gray-500 italic">Not assigned</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <button
                              onClick={() => setAssignBrandForm({
                                productId: product._id || product.id || '',
                                brandPageIds: product.brandPages || []
                              })}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Edit
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}