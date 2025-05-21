"use client";

import { useState, useEffect, useRef } from 'react';
import { useProducts } from '@/hooks/useProducts';
import Image from 'next/image';
import Link from 'next/link';

export default function ProductsPage() {
  const { products, loading, error } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeWebsiteCategory, setActiveWebsiteCategory] = useState('All');
  const [animatedProducts, setAnimatedProducts] = useState<string[]>([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [sortOption, setSortOption] = useState('newest');
  const sortDropdownRef = useRef<HTMLDivElement>(null);
  
  // Close sort dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
        setShowSortDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Get unique categories for filters
  const categories = ['All', ...new Set(products.map(product => product.category).filter(Boolean))];
  const websiteCategories = ['All', ...new Set(products.map(product => product.websiteCategory).filter(Boolean))];
  
  // Filter products based on search, category, and website category
  let filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'All' || product.category === activeCategory;
    const matchesWebsiteCategory = activeWebsiteCategory === 'All' || product.websiteCategory === activeWebsiteCategory;
    return matchesSearch && matchesCategory && matchesWebsiteCategory;
  });
  
  // Sort products based on selected option
  filteredProducts = [...filteredProducts].sort((a, b) => {
    switch (sortOption) {
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
  
  // Animation effect for products appearing
  useEffect(() => {
    if (!loading && products.length > 0) {
      const timer = setTimeout(() => {
        const ids = products.map(p => p.id || p._id).filter((id): id is string => typeof id === 'string');
        setAnimatedProducts(ids);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [loading, products]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Our Products
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Discover our range of cutting-edge security and networking solutions designed for the modern world.
        </p>
      </div>

      {/* Mobile Filter Toggle */}
      <div className="flex justify-between items-center mb-6 md:hidden">
        <button 
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className="flex items-center text-gray-700 px-4 py-2 border border-gray-300 rounded-lg"
        >
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          Filters
        </button>

        {/* Mobile Sort Dropdown */}
        <div className="relative z-10" ref={sortDropdownRef}>
          <button 
            onClick={() => setShowSortDropdown(!showSortDropdown)}
            className="flex items-center text-gray-700 px-4 py-2 border border-gray-300 rounded-lg"
          >
            <span className="mr-2">Sort</span>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {showSortDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20">
              <div className="py-1">
                {[
                  {id: 'newest', name: 'Newest First'},
                  {id: 'oldest', name: 'Oldest First'},
                  {id: 'a-z', name: 'A to Z'},
                  {id: 'z-a', name: 'Z to A'},
                ].map(option => (
                  <button
                    key={option.id}
                    onClick={() => {
                      setSortOption(option.id);
                      setShowSortDropdown(false);
                    }}
                    className={`block w-full text-left px-4 py-2 text-sm ${
                      sortOption === option.id ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                    } hover:bg-gray-100`}
                  >
                    {option.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col md:flex-row">
        {/* Sidebar Filters - Mobile Friendly */}
        <div className={`md:w-64 flex-shrink-0 md:block ${showMobileFilters ? 'block' : 'hidden'}`}>
          <div className="sticky top-24 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-md p-5 mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Search</h3>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>
            
            {/* Category Filter */}
            <div className="bg-white rounded-lg shadow-md p-5 mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Categories</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <div key={category} className="flex items-center">
                    <input
                      id={`category-${category}`}
                      type="radio"
                      name="category"
                      checked={activeCategory === category}
                      onChange={() => setActiveCategory(category)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor={`category-${category}`} className="ml-2 text-sm text-gray-700">
                      {category}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Website Category Filter */}
            <div className="bg-white rounded-lg shadow-md p-5 mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Website Categories</h3>
              <div className="space-y-2">
                {websiteCategories.map((category) => (
                  <div key={category} className="flex items-center">
                    <input
                      id={`website-category-${category}`}
                      type="radio"
                      name="websiteCategory"
                      checked={activeWebsiteCategory === category}
                      onChange={() => setActiveWebsiteCategory(category)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor={`website-category-${category}`} className="ml-2 text-sm text-gray-700">
                      {category}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Status Filter */}
            <div className="bg-white rounded-lg shadow-md p-5 mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Status</h3>
              <div className="space-y-2">
                {['All', 'Active', 'Featured', 'New', 'Discontinued'].map((status) => (
                  <div key={status} className="flex items-center">
                    <input
                      id={`status-${status}`}
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor={`status-${status}`} className="ml-2 text-sm text-gray-700">
                      {status}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Reset Filters Button */}
            <button 
              onClick={() => {
                setSearchTerm('');
                setActiveCategory('All');
                setActiveWebsiteCategory('All');
              }}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors duration-300"
            >
              Reset Filters
            </button>
          </div>
        </div>
        
        {/* Products Content */}
        <div className="w-full md:pl-8">
          {/* Desktop Sort Dropdown */}
          <div className="hidden md:flex justify-between items-center mb-8">
            <p className="text-gray-600 text-sm">
              Showing <span className="font-medium">{filteredProducts.length}</span> products
            </p>
            
            <div className="relative z-10" ref={sortDropdownRef}>
              <button 
                onClick={() => setShowSortDropdown(!showSortDropdown)}
                className="flex items-center text-gray-700 px-4 py-2 border border-gray-300 rounded-lg"
              >
                <span className="mr-2">Sort by: {sortOption === 'newest' ? 'Newest' : sortOption === 'oldest' ? 'Oldest' : sortOption === 'a-z' ? 'A to Z' : 'Z to A'}</span>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {showSortDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20">
                  <div className="py-1">
                    {[
                      {id: 'newest', name: 'Newest First'},
                      {id: 'oldest', name: 'Oldest First'},
                      {id: 'a-z', name: 'A to Z'},
                      {id: 'z-a', name: 'Z to A'},
                    ].map(option => (
                      <button
                        key={option.id}
                        onClick={() => {
                          setSortOption(option.id);
                          setShowSortDropdown(false);
                        }}
                        className={`block w-full text-left px-4 py-2 text-sm ${
                          sortOption === option.id ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                        } hover:bg-gray-100`}
                      >
                        {option.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
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

          {/* No Results */}
          {!loading && !error && filteredProducts.length === 0 && (
            <div className="text-center py-16">
              <h3 className="text-xl font-medium text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-500">Try changing your search or filter</p>
            </div>
          )}

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => {
              const productId = product.id || product._id;
              const isAnimated = typeof productId === 'string' && animatedProducts.includes(productId);
              
              return (
                <div
                  key={productId}
                  className={`group bg-white rounded-lg shadow overflow-hidden transition-all duration-500 hover:shadow-lg ${
                    isAnimated ? 'animate-fade-in-up' : 'opacity-0'
                  }`}
                  style={{ animationDelay: `${typeof productId === 'string' ? animatedProducts.indexOf(productId) * 100 : 0}ms` }}
                >
                  <div className="relative h-48 bg-gray-100">
                    {product.imageUrl ? (
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <svg className="h-16 w-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      {product.status === 'Featured' && (
                        <span className="bg-purple-500 text-white px-2 py-1 rounded text-xs font-medium">
                          Featured
                        </span>
                      )}
                      {product.status === 'New' && (
                        <span className="bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium">
                          New
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">{product.name}</h3>
                      {product.status === 'Discontinued' ? (
                        <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">Discontinued</span>
                      ) : (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Active</span>
                      )}
                    </div>
                    
                    {/* Category Tags */}
                    <div className="flex flex-wrap gap-2 mb-2">
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                        {product.category}
                      </span>
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        {product.websiteCategory}
                      </span>
                    </div>
                    
                    {product.description && (
                      <p className="text-gray-700 text-sm mb-4 line-clamp-2">{product.description}</p>
                    )}
                    <Link 
                      href={`/products/${productId}`}
                      className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
                    >
                      Learn more
                      <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="mt-16 bg-gradient-to-r from-blue-500 to-blue-700 rounded-xl p-8 text-center text-white">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">Need help choosing the right product?</h2>
        <p className="text-lg mb-6 max-w-2xl mx-auto">Our experts are available to guide you through our product range and find the perfect solution for your needs.</p>
        <Link href="/contact" className="inline-block bg-white text-blue-600 font-medium px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors duration-300">
          Contact Us
        </Link>
      </div>
    </div>
  );
}