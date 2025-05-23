"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useProducts } from '@/hooks/useProducts';
import Image from 'next/image';
import Link from 'next/link';

// Add interface definition for IProduct
interface IProduct {
  _id: string;
  id?: string;
  name: string;
  description?: string;
  category?: string;
  websiteCategory?: string;
  createdAt?: string | Date;
  slug?: string;
  images?: string[];
  imageUrl?: string;
  price?: number;
}

export default function UniviewProductsPage() {
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
  const [visibleProductCount, setVisibleProductCount] = useState(12); // Initial product load limit
  const sortDropdownRef = useRef<HTMLDivElement>(null);
  const productGridRef = useRef<HTMLDivElement>(null);

  // Optimized data fetching with parallel requests
  const fetchPageProducts = useCallback(async () => {
    try {
      setLoading(true);

      // Use Promise.all for parallel API calls
      const [productsRes, categoriesRes, subcategoriesRes] = await Promise.all([
        fetch('/api/pages/uniview/products'),
        fetch('/api/pages/uniview/categories'),
        fetch('/api/pages/uniview/subcategories')
      ]);

      if (!productsRes.ok) {
        throw new Error('Failed to fetch page products');
      }

      const productsData = await productsRes.json();
      setPageProducts(productsData);

      // Process categories if available
      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        setCategories(['All', ...categoriesData.map((cat: any) => cat.name)]);
      }

      // Process subcategories if available
      if (subcategoriesRes.ok) {
        const subcategoriesData = await subcategoriesRes.json();
        setSubcategories(subcategoriesData);
      }

      setError(null);
    } catch (err) {
      console.error('Error fetching page products:', err);
      setError('Failed to load products');
    } finally {
      setLoading(false);

      // Set initial animated products with a slight delay for smooth loading
      setTimeout(() => {
        const ids = products?.slice(0, 12).map(p => p._id || p.id).filter((id): id is string => typeof id === 'string') || [];
        setAnimatedProducts(ids);
      }, 100);
    }
  }, []);

  // Fetch products once on component mount
  useEffect(() => {
    fetchPageProducts();
  }, [fetchPageProducts]);

  // Optimized click outside handler
  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
      setShowSortDropdown(false);
    }
  }, []);

  // Close sort dropdown when clicking outside
  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleClickOutside]);

  // Debounced search input handler for better performance
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    // Clear any existing timeout
    const value = e.target.value;
    setSearchTerm(value);
  }, []);

  // Reset filters handler
  const handleResetFilters = useCallback(() => {
    setSearchTerm('');
    setActiveCategory('All');
    setActiveWebsiteCategory('All');
    setSortOption('newest');
  }, []);

  // Memoize filtered and sorted products for better performance
  const filteredProducts = useMemo(() => {
    // Filter products
    const filtered = pageProducts.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = activeCategory === 'All' || product.category === activeCategory;
      const matchesWebsiteCategory = activeWebsiteCategory === 'All' || product.websiteCategory === activeWebsiteCategory;
      return matchesSearch && matchesCategory && matchesWebsiteCategory;
    });

    // Sort filtered products
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
  }, [pageProducts, searchTerm, activeCategory, activeWebsiteCategory, sortOption]);

  // Load more products handler
  const handleLoadMore = useCallback(() => {
    setVisibleProductCount(prev => prev + 12);

    // Animate newly visible products
    setTimeout(() => {
      const productIds = filteredProducts
        .slice(animatedProducts.length, visibleProductCount + 12)
        .map(p => p._id || p.id)
        .filter((id): id is string => typeof id === 'string');

      setAnimatedProducts(prev => [...prev, ...productIds]);
    }, 100);
  }, [visibleProductCount, animatedProducts.length, filteredProducts]);

  // Scroll observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && filteredProducts.length > visibleProductCount) {
          handleLoadMore();
        }
      },
      { threshold: 0.5 }
    );

    // Observe the bottom of the product grid
    if (productGridRef.current) {
      observer.observe(productGridRef.current);
    }

    return () => observer.disconnect();
  }, [handleLoadMore, filteredProducts.length, visibleProductCount]);

  // Memoize visible products
  const visibleProducts = useMemo(() => 
    filteredProducts.slice(0, visibleProductCount),
    [filteredProducts, visibleProductCount]
  );

  // Memoize sort options to prevent unnecessary re-renders
  const sortOptions = useMemo(() => [
    {id: 'newest', name: 'Newest First'},
    {id: 'oldest', name: 'Oldest First'},
    {id: 'a-z', name: 'A to Z'},
    {id: 'z-a', name: 'Z to A'},
  ], []);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-12 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Uniview Products
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Explore our collection of high-quality Uniview security solutions and equipment.
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
                {sortOptions.map(option => (
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
                  onChange={handleSearchChange}
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
              </div>
            </div>
            
            {/* Reset Filters Button */}
            <button
              onClick={handleResetFilters}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors duration-300"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Product Content */}
        <div className="flex-1 md:ml-8">
          {/* Desktop Sort Options */}
          <div className="hidden md:flex justify-between items-center mb-8">
            <div className="text-sm text-gray-500">
              Showing <span className="font-medium text-gray-900">{visibleProducts.length}</span> of {filteredProducts.length} products
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
                    {sortOptions.map(option => (
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

          {/* Products Grid with Optimized Rendering */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" ref={productGridRef}>
            {visibleProducts.map((product, index) => {
              const productId = product.id || product._id;
              const isAnimated = typeof productId === 'string' && animatedProducts.includes(productId);
              
              return (
                <div 
                  key={productId} 
                  className={`bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 ${
                    isAnimated ? 'scale-105' : ''
                  }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="relative h-48 w-full overflow-hidden">
                    {product.imageUrl || (product.images && product.images[0]) ? (
                      <Image
                        src={product.imageUrl || product.images![0]}
                        alt={product.name}
                        fill
                        loading={index < 6 ? "eager" : "lazy"}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 hover:scale-105"
                        placeholder="blur"
                        blurDataURL="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMDAgMjAwIj48cmVjdCB4PSIwIiB5PSIwIiB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2VlZWVlZSI+PC9yZWN0Pjwvc3ZnPg=="
                        onError={(e) => {
                          // Fallback if image fails to load
                          const target = e.target as HTMLImageElement;
                          target.onerror = null;
                          target.src = '/placeholder-image.jpg'; // Use a placeholder
                        }}
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                        <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
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
                    </div>
                    
                    {product.description && (
                      <p className="text-gray-700 text-sm mb-4 line-clamp-2">{product.description}</p>
                    )}
                    <Link 
                      href={`/product/${product.slug || productId}`}
                      className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
                      prefetch={false} // Don't prefetch all product pages
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
          
          {/* Load More Button - Only show if there are more products to load */}
          {!loading && filteredProducts.length > visibleProductCount && (
            <div className="mt-8 text-center">
              <button 
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                onClick={handleLoadMore}
              >
                Load More Products
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="mt-16 bg-gradient-to-r from-blue-500 to-blue-700 rounded-xl p-8 text-center text-white">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">Need help choosing Uniview products?</h2>
        <p className="text-lg mb-6 max-w-2xl mx-auto">Our specialists can help you select the right Uniview solutions for your security needs.</p>
        <Link href="/contact" className="inline-block bg-white text-blue-600 font-medium px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors duration-300">
          Contact Us
        </Link>
      </div>
    </div>
  );
}