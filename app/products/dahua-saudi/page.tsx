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
  createdAt?: string | Date;
  slug?: string;
  images?: string[];
  price?: number;
  subcategoryId?: string;
  websiteCategoryId?: string;
  imageUrl?: string; // Added imageUrl property
}

export default function DahuaSaudiProductsPage() {
  const { products, loading, error } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeWebsiteCategory, setActiveWebsiteCategory] = useState('All');
  const [animatedProducts, setAnimatedProducts] = useState<string[]>([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [sortOption, setSortOption] = useState('newest');
  const sortDropdownRef = useRef<HTMLDivElement>(null);
  const [pageProducts, setPageProducts] = useState<IProduct[]>([]);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [subcategories, setSubcategories] = useState<any[]>([]); // Change from string[] to any[]
  const [pageLoading, setLoading] = useState(false);
  const [pageError, setError] = useState<string | null>(null);

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

  // Fetch products specifically for this page
  useEffect(() => {
    async function fetchPageProducts() {
      try {
        setLoading(true);

        // Fetch products assigned to this page
        const response = await fetch('/api/pages/dahua-saudi/products');

        if (!response.ok) {
          throw new Error('Failed to fetch page products');
        }

        const data = await response.json();
        setPageProducts(data);

        // Extract categories for this page
        const pageCategories = await fetch('/api/pages/dahua-saudi/categories');
        if (pageCategories.ok) {
          const categoriesData = await pageCategories.json();
          setCategories(['All', ...categoriesData.map((cat: any) => cat.name)]);
        }

        // Extract subcategories for this page
        const pageSubcategories = await fetch('/api/pages/dahua-saudi/subcategories');
        if (pageSubcategories.ok) {
          const subcategoriesData = await pageSubcategories.json();
          console.log('Loaded subcategories:', subcategoriesData); // Debug log
          setSubcategories(subcategoriesData); // Now storing full objects
        } else {
          console.error('Failed to fetch subcategories');
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

  // Filter products based on search, category, and website category
  let filteredProducts = pageProducts.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'All' || product.category === activeCategory;

    // Enhanced subcategory matching logic
    const matchesWebsiteCategory =
      activeWebsiteCategory === 'All' ||
      product.websiteCategory === activeWebsiteCategory ||
      // Also match if subcategory ID matches
      subcategories.some(
        (sub) =>
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
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Dahua Saudi Products</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Discover our range of cutting-edge Dahua security products available in Saudi Arabia.
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
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"
              />
            </svg>
            Sort
          </button>

          {showSortDropdown && (
            <div ref={sortDropdownRef} className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20">
              <div className="py-1">
                {[
                  { id: 'newest', name: 'Newest First' },
                  { id: 'oldest', name: 'Oldest First' },
                  { id: 'a-z', name: 'A to Z' },
                  { id: 'z-a', name: 'Z to A' },
                ].map((option) => (
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
                <svg
                  className="w-5 h-5 absolute right-3 top-3 text-gray-400"
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
                {/* Add "All" option first */}
                <div key="all-subcategory" className="flex items-center">
                  <input
                    id="website-category-All"
                    type="radio"
                    name="website-category"
                    checked={activeWebsiteCategory === 'All'}
                    onChange={() => setActiveWebsiteCategory('All')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
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
                      name="website-category"
                      checked={activeWebsiteCategory === subcategory.name}
                      onChange={() => setActiveWebsiteCategory(subcategory.name)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
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

        {/* Product Content */}
        <div className="flex-1 md:ml-8">
          {/* Desktop Sort Options */}
          <div className="hidden md:flex justify-between items-center mb-8">
            <div className="text-sm text-gray-500">
              Showing <span className="font-medium text-gray-900">{filteredProducts.length}</span> products
            </div>

            <div className="relative" ref={sortDropdownRef}>
              <button
                onClick={() => setShowSortDropdown(!showSortDropdown)}
                className="flex items-center text-gray-700 px-4 py-2 border border-gray-300 rounded-md"
              >
                <span className="mr-2">
                  {sortOption === 'newest'
                    ? 'Newest First'
                    : sortOption === 'oldest'
                    ? 'Oldest First'
                    : sortOption === 'a-z'
                    ? 'A to Z'
                    : 'Z to A'}
                </span>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showSortDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20">
                  <div className="py-1">
                    {[
                      { id: 'newest', name: 'Newest First' },
                      { id: 'oldest', name: 'Oldest First' },
                      { id: 'a-z', name: 'A to Z' },
                      { id: 'z-a', name: 'Z to A' },
                    ].map((option) => (
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
          {pageLoading && (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          )}

          {/* Error State */}
          {pageError && (
            <div className="bg-red-50 p-6 rounded-lg text-center">
              <p className="text-red-800 font-medium">{pageError}</p>
              <p className="text-red-600">Please try again later</p>
            </div>
          )}

          {/* No Results */}
          {!pageLoading && !pageError && filteredProducts.length === 0 && (
            <div className="text-center py-16">
              <h3 className="text-xl font-medium text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-500">Try changing your search or filter</p>
            </div>
          )}

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => {
              const productId = product._id;
              const isAnimated = typeof productId === 'string' && animatedProducts.includes(productId);

              return (
                <div
                  key={productId}
                  className={`bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 ${
                    isAnimated ? 'scale-105' : ''
                  }`}
                >
                  <div className="relative h-48 w-full overflow-hidden">
                    {(product.imageUrl || (product.images && product.images.length > 0)) ? (
                      <Image 
                        src={product.imageUrl || product.images![0]} 
                        alt={product.name} 
                        fill 
                        className="object-cover" 
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                        <svg
                          className="h-12 w-12 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">{product.name}</h3>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {product.category && (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                          {product.category}
                        </span>
                      )}
                      {product.websiteCategory && (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          {product.websiteCategory}
                        </span>
                      )}
                      {/* If product has subcategoryId but no websiteCategory name, show the name from subcategories */}
                      {!product.websiteCategory && product.subcategoryId && (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          {subcategories.find(sub => sub._id === product.subcategoryId)?.name || 'Unknown Category'}
                        </span>
                      )}
                    </div>
                    
                    {/* Rest of the product card content remains the same */}
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
        <h2 className="text-2xl md:text-3xl font-bold mb-4">Need help with Dahua products?</h2>
        <p className="text-lg mb-6 max-w-2xl mx-auto">
          Our experts are available to guide you through our Dahua product range and find the perfect solution for your
          needs.
        </p>
        <Link
          href="/contact"
          className="inline-block bg-white text-blue-600 font-medium px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors duration-300"
        >
          Contact Us
        </Link>
      </div>
    </div>
  );
}