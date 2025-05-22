"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
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
  const [visibleProductCount, setVisibleProductCount] = useState(20);

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
      setShowSortDropdown(false);
    }
  }, []);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleCategoryChange = useCallback((category: string) => {
    setActiveCategory(category);
  }, []);

  const handleWebsiteCategoryChange = useCallback((category: string) => {
    setActiveWebsiteCategory(category);
  }, []);

  const handleSortOptionChange = useCallback((option: string) => {
    setSortOption(option);
    setShowSortDropdown(false);
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleClickOutside]);

  useEffect(() => {
    async function fetchPageProducts() {
      try {
        setLoading(true);

        const [productsRes, categoriesRes, subcategoriesRes] = await Promise.all([
          fetch('/api/pages/hikvision/products'),
          fetch('/api/pages/hikvision/categories'),
          fetch('/api/pages/hikvision/subcategories'),
        ]);

        if (!productsRes.ok) {
          throw new Error('Failed to fetch products');
        }

        const data = await productsRes.json();
        setPageProducts(data);

        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json();
          setCategories(['All', ...categoriesData.map((cat: any) => cat.name)]);
        }

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
      }
    }

    fetchPageProducts();
  }, []);

  useEffect(() => {
    if (!loading && pageProducts.length > 0) {
      const ids = pageProducts.slice(0, 20).map((p) => p._id).filter(Boolean);
      const timer = setTimeout(() => {
        setAnimatedProducts(ids);
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [loading, pageProducts]);

  const filteredProducts = useMemo(() => {
    let filtered = pageProducts.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = activeCategory === 'All' || product.category === activeCategory;

      const matchesWebsiteCategory =
        activeWebsiteCategory === 'All' ||
        product.websiteCategory === activeWebsiteCategory ||
        subcategories.some(
          (sub) =>
            activeWebsiteCategory === sub.name &&
            (product.subcategoryId === sub._id || product.websiteCategoryId === sub._id)
        );

      return matchesSearch && matchesCategory && matchesWebsiteCategory;
    });

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
  }, [pageProducts, searchTerm, activeCategory, activeWebsiteCategory, sortOption, subcategories]);

  const handleLoadMore = useCallback(() => {
    setVisibleProductCount((prev) => prev + 20);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-12 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Hikvision Products</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Discover our premium selection of Hikvision security cameras and surveillance solutions.
        </p>
      </div>

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
                ].map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleSortOptionChange(option.id)}
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
                      onChange={() => handleCategoryChange(category)}
                      className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <label htmlFor={`category-${category}`} className="ml-2 text-sm text-gray-700">
                      {category}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-5">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Website Categories</h3>
              <div className="space-y-2">
                <div key="all-subcategory" className="flex items-center">
                  <input
                    id="website-category-All"
                    type="radio"
                    name="websiteCategory"
                    checked={activeWebsiteCategory === 'All'}
                    onChange={() => handleWebsiteCategoryChange('All')}
                    className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
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
                      name="websiteCategory"
                      checked={activeWebsiteCategory === subcategory.name}
                      onChange={() => handleWebsiteCategoryChange(subcategory.name)}
                      className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <label htmlFor={`website-category-${subcategory._id}`} className="ml-2 text-sm text-gray-700">
                      {subcategory.name}
                    </label>
                  </div>
                ))}

                {subcategories.length === 0 && (
                  <p className="text-sm text-gray-500 italic">No subcategories available</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 md:ml-8">
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
                    ].map((option) => (
                      <button
                        key={option.id}
                        onClick={() => handleSortOptionChange(option.id)}
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

          {loading && (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {!loading && !error && filteredProducts.length === 0 && (
            <div className="text-center py-16 bg-gray-50 rounded-lg">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="mt-2 text-xl font-medium text-gray-900">No products found</h3>
              <p className="mt-1 text-gray-500">Try changing your search or filter criteria.</p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.slice(0, visibleProductCount).map((product) => {
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
                        loading="lazy"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover"
                        placeholder="blur"
                        blurDataURL="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMDAgMjAwIj48cmVjdCB4PSIwIiB5PSIwIiB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2VlZWVlZSI+PC9yZWN0Pjwvc3ZnPg=="
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.onerror = null;
                          target.src = '/placeholder-image.jpg';
                        }}
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
                      {!product.websiteCategory && product.subcategoryId && (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          {subcategories.find((sub) => sub._id === product.subcategoryId)?.name || 'Unknown Category'}
                        </span>
                      )}
                    </div>

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

      <div className="mt-16 bg-gradient-to-r from-blue-500 to-blue-700 rounded-xl p-8 text-center text-white">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">Questions about Hikvision products?</h2>
        <p className="text-lg mb-6 max-w-2xl mx-auto">
          Our team can provide detailed information and help you choose the right Hikvision solutions.
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