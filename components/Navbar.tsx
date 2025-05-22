"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProductsOpen, setIsProductsOpen] = useState(false);
  const [isBrandsOpen, setIsBrandsOpen] = useState(false);
  const [closeTimeout, setCloseTimeout] = useState<NodeJS.Timeout | null>(null);

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Improved dropdown handlers with delay
  const handleMouseEnter = (setter: React.Dispatch<React.SetStateAction<boolean>>) => {
    if (closeTimeout) {
      clearTimeout(closeTimeout);
      setCloseTimeout(null);
    }
    setter(true);
  };

  const handleMouseLeave = (setter: React.Dispatch<React.SetStateAction<boolean>>) => {
    const timeout = setTimeout(() => {
      setter(false);
    }, 150); // 150ms delay before closing dropdown

    setCloseTimeout(timeout);
  };

  // Clean up any timeouts when component unmounts
  useEffect(() => {
    return () => {
      if (closeTimeout) {
        clearTimeout(closeTimeout);
      }
    };
  }, [closeTimeout]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isProductsOpen || isBrandsOpen) {
        // Check if the click is outside the dropdown
        if (!(event.target as HTMLElement).closest('.dropdown-container')) {
          setIsProductsOpen(false);
          setIsBrandsOpen(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isProductsOpen, isBrandsOpen]);

  return (
    <header
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled ? "bg-white shadow-md" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center">
              <Image 
                src="/logo.png" 
                alt="Spottive Logo" 
                width={180} 
                height={50} 
                className="h-auto" 
                priority
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link
              href="/"
              className="text-gray-700 hover:text-black px-3 py-2 text-sm font-medium"
            >
              Home
            </Link>
            
            {/* Our Products with hover dropdown */}
            <div 
              className="relative dropdown-container"
              onMouseEnter={() => handleMouseEnter(setIsProductsOpen)}
              onMouseLeave={() => handleMouseLeave(setIsProductsOpen)}
            >
              <Link
                href="/products"
                className="text-gray-700 hover:text-black px-3 py-2 text-sm font-medium flex items-center"
              >
                Our Products
                <svg
                  className={`ml-1 h-4 w-4 transition-transform ${isProductsOpen ? "rotate-180" : ""}`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </Link>
              
              {/* Products Mega Dropdown - Adjusted position */}
              {isProductsOpen && (
                <div className="absolute left-1/2 transform -translate-x-1/2 mt-2 w-[800px] bg-white rounded-md shadow-lg py-6 px-6 z-10 grid grid-cols-12 gap-4">
                  {/* Left column - 2 cards in a grid */}
                  <div className="col-span-8 grid grid-cols-2 gap-4">
                    {/* Card 1 - Replace with logo */}
                    <div className="bg-blue-500 text-white p-6 rounded-md flex flex-col">
                      <div className="flex-grow flex items-center justify-center">
                        <Image 
                          src="/brand/dahua.png" 
                          alt="Dahua-saudi" 
                          width={120} 
                          height={60}
                          className="h-25 w-auto object-contain mb-2" 
                        />
                      </div>
                      <h4 className="font-medium text-center mb-4">Dahua-Saudi</h4>
                      <Link href="/products/dahua-saudi" className="flex items-center text-sm font-medium">
                        Learn more 
                        <svg className="h-4 w-4 ml-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </Link>
                    </div>
                    
                    {/* Card 2 - Replace with logo */}
                    <div className="bg-gray-100 p-6 rounded-md flex flex-col">
                      <div className="flex-grow flex items-center justify-center">
                        <Image 
                          src="/brand/hikvision.png" 
                          alt="Hikvision" 
                          width={120} 
                          height={60}
                          className="h-25 w-auto object-contain mb-2" 
                        />
                      </div>
                      <h4 className="font-medium text-center mb-4">Hikvision</h4>
                      <Link href="/products/hikvision" className="flex items-center text-sm font-medium text-purple-500">
                        Learn more 
                        <svg className="h-4 w-4 ml-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </Link>
                    </div>
                    
                    {/* Card 3 - Replace with logo */}
                    <div className="bg-purple-500 text-white p-6 rounded-md flex flex-col">
                      <div className="flex-grow flex items-center justify-center">
                        <Image 
                          src="/brand/Uniview.png" 
                          alt="Uniview" 
                          width={120} 
                          height={60}
                          className="h-16 w-auto object-contain mb-2" 
                        />
                      </div>
                      <h4 className="font-medium text-center mb-4">Uniview</h4>
                      <Link href="/products/uniview" className="flex items-center text-sm font-medium">
                        Learn more 
                        <svg className="h-4 w-4 ml-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </Link>
                    </div>
                    
                    {/* Card 4 - Replace with logo */}
                    <div className="bg-gray-100 p-6 rounded-md flex flex-col">
                      <div className="flex-grow flex items-center justify-center">
                        <Image 
                          src="/brand/unv.png" 
                          alt="UNV" 
                          width={120} 
                          height={60}
                          className="h-25 w-auto object-contain mb-2" 
                        />
                      </div>
                      <h4 className="font-medium text-center mb-4">UNV</h4>
                      <Link href="/products/unv" className="flex items-center text-sm font-medium text-purple-500">
                        Learn more 
                        <svg className="h-4 w-4 ml-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                  
                  {/* Right column - What's new section */}
                  <div className="col-span-4">
                    <h3 className="text-lg font-bold mb-4">What's new</h3>
                    <div className="space-y-3">
                      <Link href="/updates/figma-config" className="block text-gray-700 hover:text-black">
                        Our CCTV products
                      </Link>
                      <Link href="/updates/new-website" className="block text-gray-700 hover:text-black">
                        all types of cctv
                      </Link>
                      <Link href="/updates/css-easing" className="block text-gray-700 hover:text-black">
                        Best in UAE and Saudi
                      </Link>
                      <div className="mt-6">
                        <Link 
                          href="/updates" 
                          className="inline-flex items-center px-4 py-2 bg-gray-100 rounded-full text-sm font-medium hover:bg-gray-200"
                        >
                          See what's new 
                          <svg className="h-4 w-4 ml-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Our Brands with hover dropdown */}
            <div 
              className="relative dropdown-container"
              onMouseEnter={() => handleMouseEnter(setIsBrandsOpen)}
              onMouseLeave={() => handleMouseLeave(setIsBrandsOpen)}
            >
              <Link
                href="/brands"
                className="text-gray-700 hover:text-black px-3 py-2 text-sm font-medium flex items-center"
              >
                Our Brands
                <svg
                  className={`ml-1 h-4 w-4 transition-transform ${isBrandsOpen ? "rotate-180" : ""}`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </Link>
              
              {/* Brands Mega Dropdown - Simplified version */}
              {isBrandsOpen && (
                <div className="absolute left-1/2 transform -translate-x-1/2 mt-2 w-[800px] bg-white rounded-md shadow-lg py-8 px-6 z-10">
                  {/* Featured Brands with colorful backgrounds - kept */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-blue-500 text-white p-5 rounded-md flex flex-col items-center">
                      <Image 
                        src="/brand/10.jpg" 
                        alt="Hikvision" 
                        width={160} 
                        height={80}
                        className="h-16 w-auto object-contain mb-2" 
                      />
                      <p className="text-sm font-medium mt-2">Premium Security Solutions</p>
                    </div>
                    
                    <div className="bg-purple-500 text-white p-5 rounded-md flex flex-col items-center">
                      <Image 
                        src="/brand/6.jpg" 
                        alt="Dahua" 
                        width={160} 
                        height={80}
                        className="h-16 w-auto object-contain mb-2" 
                      />
                      <p className="text-sm font-medium mt-2">Advanced Surveillance</p>
                    </div>
                    
                    <div className="bg-green-500 text-white p-5 rounded-md flex flex-col items-center">
                      <Image 
                        src="/brand/12.jpg" 
                        alt="Ubiquiti" 
                        width={160} 
                        height={80}
                        className="h-16 w-auto object-contain mb-2" 
                      />
                      <p className="text-sm font-medium mt-2">Enterprise Networking</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Link
              href="/who-we-are"
              className="text-gray-700 hover:text-black px-3 py-2 text-sm font-medium"
            >
              Who We Are
            </Link>
            <Link
              href="/contact"
              className="text-gray-700 hover:text-black px-3 py-2 text-sm font-medium"
            >
              Contact
            </Link>
          </nav>

          {/* Social Media Icons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link 
              href="https://facebook.com" 
              className="text-gray-700 hover:text-blue-600"
              aria-label="Facebook"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z"/>
              </svg>
            </Link>
            <Link 
              href="https://twitter.com" 
              className="text-gray-700 hover:text-blue-400"
              aria-label="Twitter"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07a4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
              </svg>
            </Link>
            <Link 
              href="https://youtube.com" 
              className="text-gray-700 hover:text-red-600"
              aria-label="YouTube"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M21.543 6.498C22 8.28 22 12 22 12s0 3.72-.457 5.502c-.254-.985-.997-1.76-1.938-2.022C17.896 20 12 20 12 20s-5.893 0-7.605-.476c-.945-.266-1.687-1.04-1.938-2.022C2 15.72 2 12 2 12s0-3.72.457-5.502c-.254-.985-.997-1.76-1.938-2.022C6.107 4 12 4 12 4s5.896 0 7.605.476c.945-.266 1.687-1.04 1.938-2.022zM10 15.5l6-3.5-6-3.5v7z" />
              </svg>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-black focus:outline-none"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {!isMenuOpen ? (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      {isMenuOpen && (
        <div className="md:hidden bg-white">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              href="/"
              className="block text-gray-700 hover:text-black px-3 py-2 text-base font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            
            {/* Mobile Our Products */}
            <div>
              <button 
                className="flex justify-between items-center w-full text-gray-700 hover:text-black px-3 py-2 text-base font-medium"
                onClick={() => setIsProductsOpen(!isProductsOpen)}
              >
                Our Products
                <svg
                  className={`ml-1 h-4 w-4 transition-transform ${isProductsOpen ? "rotate-180" : ""}`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {/* Mobile Products dropdown content */}
              {isProductsOpen && (
                <div className="pl-4 py-2 space-y-2">
                  <Link
                    href="/products/figma-import"
                    className="block text-gray-700 hover:text-black px-3 py-2 text-sm font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Import from Figma
                  </Link>
                  <Link
                    href="/products/collaboration"
                    className="block text-gray-700 hover:text-black px-3 py-2 text-sm font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Unlock collaboration
                  </Link>
                  <Link
                    href="/products/design"
                    className="block text-gray-700 hover:text-black px-3 py-2 text-sm font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    A brand-new way to design
                  </Link>
                  <Link
                    href="/products/export"
                    className="block text-gray-700 hover:text-black px-3 py-2 text-sm font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Export to 4K, GIF, Lottie
                  </Link>
                </div>
              )}
            </div>
            
            {/* Mobile Our Brands */}
            <div>
              <button 
                className="flex justify-between items-center w-full text-gray-700 hover:text-black px-3 py-2 text-base font-medium"
                onClick={() => setIsBrandsOpen(!isBrandsOpen)}
              >
                Our Brands
                <svg
                  className={`ml-1 h-4 w-4 transition-transform ${isBrandsOpen ? "rotate-180" : ""}`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {/* Mobile Brands dropdown content */}
              {isBrandsOpen && (
                <div className="pl-4 py-2">
                  <Link
                    href="/customers/creative-teams"
                    className="block text-gray-700 hover:text-black px-3 py-2 text-sm font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Creative teams
                  </Link>
                  <Link
                    href="/customers/agencies"
                    className="block text-gray-700 hover:text-black px-3 py-2 text-sm font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Agencies
                  </Link>
                  <Link
                    href="/customers/studios"
                    className="block text-gray-700 hover:text-black px-3 py-2 text-sm font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Studios
                  </Link>
                  <Link
                    href="/brands/perplexity"
                    className="block text-gray-700 hover:text-black px-3 py-2 text-sm font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Perplexity case study
                  </Link>
                </div>
              )}
            </div>

            <Link
              href="/who-we-are"
              className="block text-gray-700 hover:text-black px-3 py-2 text-base font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Who We Are
            </Link>
            <Link
              href="/contact"
              className="block text-gray-700 hover:text-black px-3 py-2 text-base font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </Link>
          </div>
          
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="flex items-center justify-center space-x-6 px-5 py-3">
              {/* Mobile Social Media Icons */}
              <Link 
                href="https://facebook.com" 
                className="text-gray-700 hover:text-blue-600"
                aria-label="Facebook"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                  <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z"/>
                </svg>
              </Link>
              <Link 
                href="https://twitter.com" 
                className="text-gray-700 hover:text-blue-400"
                aria-label="Twitter"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                  <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07a4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                </svg>
              </Link>
              <Link 
                href="https://youtube.com" 
                className="text-gray-700 hover:text-red-600"
                aria-label="YouTube"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                  <path d="M21.543 6.498C22 8.28 22 12 22 12s0 3.72-.457 5.502c-.254-.985-.997-1.76-1.938-2.022C17.896 20 12 20 12 20s-5.893 0-7.605-.476c-.945-.266-1.687-1.04-1.938-2.022C2 15.72 2 12 2 12s0-3.72.457-5.502c-.254-.985-.997-1.76-1.938-2.022C6.107 4 12 4 12 4s5.896 0 7.605.476c.945-.266 1.687-1.04 1.938-2.022zM10 15.5l6-3.5-6-3.5v7z" />
              </svg>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}