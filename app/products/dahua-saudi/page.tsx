"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useProducts } from '@/hooks/useProducts';
import Image from 'next/image';
import Link from 'next/link';

// Simplified IProduct interface - removed category fields
interface IProduct {
  _id: string;
  name: string;
  description?: string;
  createdAt?: string | Date;
  slug?: string;
  images?: string[];
  price?: number;
  imageUrl?: string;
}

export default function DahuaSaudiProductsPage() {
  const { products, loading, error } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const [animatedProducts, setAnimatedProducts] = useState<string[]>([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [sortOption, setSortOption] = useState('newest');
  const sortDropdownRef = useRef<HTMLDivElement>(null);
  const [pageProducts, setPageProducts] = useState<IProduct[]>([]);
  const [pageLoading, setLoading] = useState(false);
  const [pageError, setError] = useState<string | null>(null);
  const [visibleProductCount, setVisibleProductCount] = useState(20); // For pagination

  // Use useCallback for event handlers
  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
      setShowSortDropdown(false);
    }
  }, []);

  // Memoized searchTerm handler for better performance
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  // Close sort dropdown when clicking outside
  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleClickOutside]); // Use the memoized callback

  // Simplified data fetch - only products
  useEffect(() => {
    async function fetchPageProducts() {
      try {
        setLoading(true);

        // Only fetch products now
        const productsRes = await fetch('/api/pages/dahua-saudi/products');

        if (!productsRes.ok) {
          throw new Error('Failed to fetch page products');
        }

        const data = await productsRes.json();
        setPageProducts(data);
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

  // Simplified filtered products - only search and sort
  const filteredProducts = useMemo(() => {
    // Filter products based only on search
    let filtered = pageProducts.filter((product) => {
      return product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()));
    });
    
    // Sorting logic remains the same
    return [...filtered].sort((a, b) => {
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
  }, [pageProducts, searchTerm, sortOption]);

  // Animation for products - optimize with useEffect dependency array
  useEffect(() => {
    if (!pageLoading && pageProducts.length > 0) {
      const ids = pageProducts.slice(0, 20).map(p => p._id).filter(Boolean);
      const timer = setTimeout(() => {
        setAnimatedProducts(ids);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [pageLoading, pageProducts]);

  // Load more handler
  const handleLoadMore = useCallback(() => {
    setVisibleProductCount(prev => prev + 20);
  }, []);

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
          Search
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
        {/* Sidebar - Search Only */}
        <div className={`md:w-64 flex-shrink-0 md:block ${showMobileFilters ? 'block' : 'hidden'}`}>
          <div className="sticky top-24 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-md p-5 mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Search</h3>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={handleSearchChange}
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
            
            {/* Reset button */}
            <button
              onClick={() => setSearchTerm('')}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors duration-300"
            >
              Clear Search
            </button>
          </div>
        </div>

        {/* Product Content */}
        <div className="flex-1 md:ml-8">
          {/* Desktop Sort Options */}
          <div className="hidden md:flex justify-between items-center mb-8">
            <div className="text-sm text-gray-500">
              Showing <span className="font-medium text-gray-900">{filteredProducts.length}</span> products
            </div>

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
                  className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-30"
                >
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
              <p className="text-gray-500">Try changing your search term</p>
            </div>
          )}

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.slice(0, visibleProductCount).map((product) => {
              const productId = product._id;
              const isAnimated = typeof productId === 'string' && animatedProducts.includes(productId);

              return (
                <div
                  key={productId}
                  className={`group bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 ${
                    isAnimated ? 'scale-105' : ''
                  }`}
                >
                  {/* Improved Image Container with aspect ratio */}
                  <div className="relative aspect-[4/3] overflow-hidden bg-gray-50">
                    {(product.imageUrl || (product.images && product.images.length > 0)) ? (
                      <div className="h-full w-full flex items-center justify-center bg-white">
                        <Image
                          src={product.imageUrl || product.images![0]}
                          alt={product.name}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-contain p-3 transition-transform duration-500 hover:scale-110"
                          loading="lazy"
                          placeholder="blur"
                          blurDataURL="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMDAgMjAwIj48cmVjdCB4PSIwIiB5PSIwIiB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YxZjFmMSI+PC9yZWN0Pjwvc3ZnPg=="
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.onerror = null;
                            target.src = '/placeholder-image.jpg';
                          }}
                        />
                      </div>
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <svg 
                          className="h-16 w-16 text-gray-300" 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={1} 
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
                          />
                        </svg>
                      </div>
                    )}
                    
                    {/* Status Badge */}
                    <div className="absolute top-2 right-2">
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-md font-medium">
                        Active
                      </span>
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">{product.name}</h3>
                    
                    {product.description && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{product.description}</p>
                    )}
                    
                    <Link
                      href={`/products/${product.slug || productId}`}
                      className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
                      prefetch={false}
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

          {/* Load More Button */}
          {filteredProducts.length > visibleProductCount && (
            <div className="mt-8 text-center">
              <button
                onClick={handleLoadMore}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
              >
                Load More Products
              </button>
            </div>
          )}
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