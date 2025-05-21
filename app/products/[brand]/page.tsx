"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useProducts } from '@/hooks/useProducts';

export default function BrandProductPage() {
  const params = useParams();
  const brand = params?.brand as string;
  const brandDisplay = brand.charAt(0).toUpperCase() + brand.slice(1);
  
  const { products, loading, error } = useProducts();
  const [brandProducts, setBrandProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeSubcategory, setActiveSubcategory] = useState('All');
  const [sortOrder, setSortOrder] = useState('newest');
  
  // Filter products specifically assigned to this brand page
  useEffect(() => {
    if (!loading && products.length > 0) {
      // Filter products that are assigned to this brand page
      const relatedProducts = products.filter(product => 
        product.brandPages && 
        Array.isArray(product.brandPages) && 
        product.brandPages.includes(brand.toLowerCase())
      );
      
      setBrandProducts(relatedProducts);
      setFilteredProducts(relatedProducts);
      
      // Extract unique categories from brand products
      const uniqueCategories = ['All', ...new Set(relatedProducts.map(p => p.category).filter(Boolean))];
      setCategories(uniqueCategories);
      
      // Extract all subcategories
      const allSubcategories = relatedProducts
        .filter(p => p.subcategoryId)
        .map(p => ({
          id: p.subcategoryId,
          name: p.subcategoryName || 'Unknown Subcategory',
          category: p.category
        }));
      
      // Remove duplicates
      const uniqueSubcats = Array.from(new Map(
        allSubcategories.map(item => [item.id, item])
      ).values());
      
      setSubcategories(uniqueSubcats);
    }
  }, [loading, products, brand]);
  
  // Apply filters
  useEffect(() => {
    if (brandProducts.length > 0) {
      let filtered = [...brandProducts];
      
      // Apply search filter
      if (searchTerm) {
        filtered = filtered.filter(p => 
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      }
      
      // Apply category filter
      if (activeCategory !== 'All') {
        filtered = filtered.filter(p => p.category === activeCategory);
      }
      
      // Apply subcategory filter
      if (activeSubcategory !== 'All') {
        filtered = filtered.filter(p => p.subcategoryId === activeSubcategory);
      }
      
      // Apply sorting
      filtered.sort((a, b) => {
        switch (sortOrder) {
          case 'newest':
            return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
          case 'oldest':
            return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
          case 'a-z':
            return a.name.localeCompare(b.name);
          case 'z-a':
            return b.name.localeCompare(a.name);
          default:
            return 0;
        }
      });
      
      setFilteredProducts(filtered);
    }
  }, [searchTerm, activeCategory, activeSubcategory, sortOrder, brandProducts]);
  
  // Get subcategories for selected category
  const getSubcategoriesForCategory = () => {
    if (activeCategory === 'All') {
      return ['All', ...subcategories.map(sub => sub.id)];
    }
    
    return ['All', ...subcategories
      .filter(sub => sub.category === activeCategory)
      .map(sub => sub.id)
    ];
  };
  
  // Get subcategory name by id
  const getSubcategoryName = (id: string) => {
    const subcategory = subcategories.find(sub => sub.id === id);
    return subcategory ? subcategory.name : id;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Brand Hero Section */}
      <div className="bg-gradient-to-r from-blue-800 to-blue-600 rounded-lg p-8 md:p-12 mb-12">
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {brandDisplay} Products
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
            Explore our range of {brandDisplay} security solutions for your business and home needs
          </p>
          <div className="flex justify-center space-x-4">
            <button className="bg-white text-blue-700 px-6 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors">
              View Catalog
            </button>
            <button className="bg-blue-500 bg-opacity-40 text-white px-6 py-3 rounded-lg font-medium hover:bg-opacity-60 transition-colors">
              Contact Sales
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full lg:w-64 flex-shrink-0">
          {/* Search Box */}
          <div className="bg-white p-5 rounded-lg shadow mb-6">
            <h3 className="font-medium text-gray-900 mb-3">Search</h3>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search products..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
              <svg
                className="absolute right-3 top-2.5 h-5 w-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          {/* Categories */}
          <div className="bg-white p-5 rounded-lg shadow mb-6">
            <h3 className="font-medium text-gray-900 mb-3">Categories</h3>
            <div className="space-y-2">
              {categories.map(category => (
                <div key={category} className="flex items-center">
                  <input
                    id={`category-${category}`}
                    type="radio"
                    name="category"
                    checked={activeCategory === category}
                    onChange={() => {
                      setActiveCategory(category);
                      setActiveSubcategory('All');
                    }}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <label htmlFor={`category-${category}`} className="ml-2 text-sm text-gray-700">
                    {category}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Subcategories - Show only when a category is selected */}
          {activeCategory !== 'All' && subcategories.some(sub => sub.category === activeCategory) && (
            <div className="bg-white p-5 rounded-lg shadow mb-6">
              <h3 className="font-medium text-gray-900 mb-3">Subcategories</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    id="subcategory-all"
                    type="radio"
                    name="subcategory"
                    checked={activeSubcategory === 'All'}
                    onChange={() => setActiveSubcategory('All')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <label htmlFor="subcategory-all" className="ml-2 text-sm text-gray-700">
                    All Subcategories
                  </label>
                </div>
                {subcategories
                  .filter(sub => sub.category === activeCategory)
                  .map(sub => (
                    <div key={sub.id} className="flex items-center">
                      <input
                        id={`subcategory-${sub.id}`}
                        type="radio"
                        name="subcategory"
                        checked={activeSubcategory === sub.id}
                        onChange={() => setActiveSubcategory(sub.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <label htmlFor={`subcategory-${sub.id}`} className="ml-2 text-sm text-gray-700">
                        {sub.name}
                      </label>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Sort Order */}
          <div className="bg-white p-5 rounded-lg shadow mb-6">
            <h3 className="font-medium text-gray-900 mb-3">Sort By</h3>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="a-z">A to Z</option>
              <option value="z-a">Z to A</option>
            </select>
          </div>

          {/* Reset Filters */}
          <button
            onClick={() => {
              setSearchTerm('');
              setActiveCategory('All');
              setActiveSubcategory('All');
              setSortOrder('newest');
            }}
            className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md transition-colors"
          >
            Reset Filters
          </button>
        </div>

        {/* Products Grid */}
        <div className="flex-1">
          {/* Products Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {activeCategory === 'All' ? 'All Products' : activeCategory}
              {activeSubcategory !== 'All' ? ` - ${getSubcategoryName(activeSubcategory)}` : ''}
            </h2>
            <p className="text-sm text-gray-500">
              Showing {filteredProducts.length} of {brandProducts.length} products
            </p>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 p-6 rounded-lg text-center">
              <p className="text-red-800 font-medium">{error}</p>
              <p className="text-red-600">Please try again later</p>
            </div>
          )}

          {/* No Products Found */}
          {!loading && !error && filteredProducts.length === 0 && (
            <div className="bg-white border border-gray-200 p-12 rounded-lg text-center">
              <svg className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-500 mb-6">Try changing your filters or search term</p>
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setActiveCategory('All');
                  setActiveSubcategory('All');
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                Clear filters
              </button>
            </div>
          )}

          {/* Products Grid */}
          {!loading && !error && filteredProducts.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map(product => (
                <div key={product._id || product.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div className="h-48 w-full relative bg-gray-100">
                    {product.imageUrl ? (
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <svg className="h-16 w-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    {/* Status badge */}
                    {product.status && product.status !== 'Active' && (
                      <div className="absolute top-2 right-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                          product.status === 'Featured' ? 'bg-purple-100 text-purple-800' :
                          product.status === 'New' ? 'bg-green-100 text-green-800' :
                          product.status === 'Discontinued' ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {product.status}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-1">{product.name}</h3>
                    
                    {/* Category & Subcategory */}
                    <div className="flex flex-wrap gap-2 mb-2">
                      <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                        {product.category}
                      </span>
                      {product.subcategoryId && (
                        <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                          {getSubcategoryName(product.subcategoryId)}
                        </span>
                      )}
                    </div>
                    
                    {product.description && (
                      <p className="text-sm text-gray-700 mb-4 line-clamp-2">{product.description}</p>
                    )}
                    
                    <div className="flex justify-between items-center">
                      <Link
                        href={`/products/${product._id || product.id}`}
                        className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center"
                      >
                        View Details
                        <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}