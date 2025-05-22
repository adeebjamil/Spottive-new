"use client";

import { useState, useEffect, useRef } from 'react';
import { useProducts } from '@/hooks/useProducts';
import Image from 'next/image';
import Link from 'next/link';

// Add interface definition for IProduct
interface IProduct {
  _id: string;
  name: string;
  description?: string;
  category?: string;
  websiteCategory?: string;
  subcategoryId?: string;
  websiteCategoryId?: string;
  createdAt?: string | Date;
  slug?: string;
  images?: string[];
  price?: number;
  imageUrl?: string;
}

export default function HikvisionProductsPage() {
  const { products, loading: productsLoading, error: productsError } = useProducts();
  const [pageProducts, setPageProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeWebsiteCategory, setActiveWebsiteCategory] = useState('All');
  const [animatedProducts, setAnimatedProducts] = useState<string[]>([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [sortOption, setSortOption] = useState('newest');
  const [categories, setCategories] = useState<string[]>(['All']);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  // Fetch products specifically for this page
  useEffect(() => {
    async function fetchPageProducts() {
      try {
        setLoading(true);

        // Fetch products assigned to this page
        const response = await fetch('/api/pages/hikvision/products');

        if (!response.ok) {
          throw new Error('Failed to fetch page products');
        }

        const data = await response.json();
        setPageProducts(data);

        // Extract categories for this page
        const pageCategories = await fetch('/api/pages/hikvision/categories');
        if (pageCategories.ok) {
          const categoriesData = await pageCategories.json();
          setCategories(['All', ...categoriesData.map((cat: any) => cat.name)]);
        }

        // Extract subcategories for this page
        const pageSubcategories = await fetch('/api/pages/hikvision/subcategories');
        if (pageSubcategories.ok) {
          const subcategoriesData = await pageSubcategories.json();
          setSubcategories(subcategoriesData);
        }

        setError(null);
      } catch (err) {
        console.error('Error fetching page products:', err);
        setError('Failed to load products');
      } finally {
        setLoading(false);
      }
    }

    fetchPageProducts();
  }, []);

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

  // Filter products based on search, category, and website category
  let filteredProducts = pageProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'All' || product.category === activeCategory;
    
    // Enhanced subcategory matching logic
    const matchesWebsiteCategory = 
      activeWebsiteCategory === 'All' || 
      product.websiteCategory === activeWebsiteCategory ||
      // Also match if subcategory ID matches
      subcategories.some(sub => 
        activeWebsiteCategory === sub.name && 
        (product.subcategoryId === sub._id || product.websiteCategoryId === sub._id)
      );
    
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

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-12 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Hikvision Products
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Discover our premium selection of Hikvision security cameras and surveillance solutions.
        </p>
      </div>

      {/* Mobile Filter Toggle */}
      <div className="flex justify-between items-center mb-6 md:hidden">
        <button
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className="flex items-center text-gray-700 px-4 py-2 border border-gray-300 rounded-lg"
        >
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
          Filters
        </button>

        {/* Mobile Sort */}
        <div className="relative">
          <button
            onClick={() => setShowSortDropdown(!showSortDropdown)}
            className="flex items-center text-gray-700 px-4 py-2 border border-gray-300 rounded-lg"
          >
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
            </svg>
            Sort
          </button>

          {showSortDropdown && (
            <div
              ref={sortDropdownRef}
              className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20"
            >
              <div className="py-1">
                {[
                  { id: 'newest', name: 'Newest First' },
                  { id: 'oldest', name: 'Oldest First' },
                  { id: 'a-z', name: 'A to Z' },
                  { id: 'z-a', name: 'Z to A' },
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
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
                <svg className="w-5 h-5 absolute right-3 top-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Category Filter */}
            <div className="bg-white rounded-lg shadow-md p-5 mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Product Category</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <div key={category} className="flex items-center">
                    <input
                      id={`category-${category}`}
                      type="radio"
                      name="category"
                      checked={activeCategory === category}
                      onChange={() => setActiveCategory(category)}
                      className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <label htmlFor={`category-${category}`} className="ml-2 text-sm text-gray-700">
                      {category}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Website Category Filter */}
            <div className="bg-white rounded-lg shadow-md p-5">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Website Categories</h3>
              <div className="space-y-2">
                {/* Add "All" option first */}
                <div key="all-subcategory" className="flex items-center">
                  <input
                    id="website-category-All"
                    type="radio"
                    name="websiteCategory"
                    checked={activeWebsiteCategory === 'All'}
                    onChange={() => setActiveWebsiteCategory('All')}
                    className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <label htmlFor="website-category-All" className="ml-2 text-sm text-gray-700">
                    All
                  </label>
                </div>
                
                {/* Map through actual subcategories from API */}
                {subcategories.map((subcategory) => (
                  <div key={subcategory._id} className="flex items-center">
                    <input
                      id={`website-category-${subcategory._id}`}
                      type="radio"
                      name="websiteCategory"
                      checked={activeWebsiteCategory === subcategory.name}
                      onChange={() => setActiveWebsiteCategory(subcategory.name)}
                      className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <label htmlFor={`website-category-${subcategory._id}`} className="ml-2 text-sm text-gray-700">
                      {subcategory.name}
                    </label>
                  </div>
                ))}
                
                {/* Show message if no subcategories */}
                {subcategories.length === 0 && (
                  <p className="text-sm text-gray-500 italic">No subcategories available</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1 md:ml-8">
          {/* Desktop Sort */}
          <div className="hidden md:flex justify-end mb-6">
            <div className="relative inline-block">
              <button
                onClick={() => setShowSortDropdown(!showSortDropdown)}
                className="flex items-center text-gray-700 px-4 py-2 border border-gray-300 rounded-lg"
              >
                <span className="mr-2">Sort by</span>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showSortDropdown && (
                <div
                  ref={sortDropdownRef}
                  className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20"
                >
                  <div className="py-1">
                    {[
                      { id: 'newest', name: 'Newest First' },
                      { id: 'oldest', name: 'Oldest First' },
                      { id: 'a-z', name: 'A to Z' },
                      { id: 'z-a', name: 'Z to A' },
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
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">
                    There was an error loading products. Please try again later.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Products Grid */}
          {!loading && !error && (
            <>
              {filteredProducts.length > 0 ? (
                <>
                  <p className="mb-4 text-gray-600">Showing {filteredProducts.length} products</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProducts.map((product) => (
                      <div
                        key={product._id}
                        className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-[1.02]"
                      >
                        <Link href={`/product/${product.slug || product._id}`}>
                          <div className="h-48 relative overflow-hidden">
                            {(product.imageUrl || (product.images && product.images[0])) ? (
                              <Image
                                src={product.imageUrl || product.images![0]}
                                alt={product.name}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                onError={(e) => {
                                  // Fallback if image fails to load
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  target.parentElement!.classList.add('bg-gray-200', 'flex', 'items-center', 'justify-center');
                                  // Add fallback icon
                                  const parent = target.parentElement!;
                                  if (!parent.querySelector('svg')) {
                                    parent.innerHTML += `<svg class="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>`;
                                  }
                                }}
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <div className="p-4">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{product.name}</h3>
                            <p className="text-gray-600 mb-2 line-clamp-2">{product.description || 'No description available'}</p>
                            <div className="flex justify-between items-center">
                              <span className="text-blue-600 font-medium">
                                {typeof product.price === 'number' ? `SAR ${(product.price as number).toFixed(2)}` : 'Contact for price'}
                              </span>
                              <span className="text-sm text-gray-500">{product.category}</span>
                            </div>
                          </div>
                        </Link>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="mt-2 text-lg font-medium text-gray-900">No products found</h3>
                  <p className="mt-1 text-gray-500">Try adjusting your search or filter criteria.</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}