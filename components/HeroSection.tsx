"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function HeroSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [showTrustedText, setShowTrustedText] = useState(false);

  useEffect(() => {
    // Trigger animation after component mounts
    setIsVisible(true);
  }, []);

  useEffect(() => {
    if (isVisible) {
      // Start the loading animation after the main content becomes visible
      const stepTimers = [1, 2, 3, 4].map((step) => {
        return setTimeout(() => {
          setLoadingStep(step);

          // Show the text after the last number is active
          if (step === 4) {
            setTimeout(() => {
              setShowTrustedText(true);
            }, 400);
          }
        }, step * 500); // Each number activates after 500ms
      });

      return () => stepTimers.forEach(timer => clearTimeout(timer));
    }
  }, [isVisible]);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-b from-blue-50 to-white">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0 opacity-10">
        <div className="absolute top-20 right-20 w-64 h-64 rounded-full bg-blue-300"></div>
        <div className="absolute bottom-20 left-1/4 w-96 h-96 rounded-full bg-green-200"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 z-10 pt-24">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          
          {/* Text Content - Left Side */}
          <div 
            className={`w-full lg:w-1/2 transition-all duration-1000 transform ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 leading-tight mb-6">
              Smart Technology for a <span className="text-blue-600">Connected Future</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-lg">
              Cutting-edge security and networking solutions for homes, businesses, and smart cities.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Link 
                href="/products" 
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors duration-300 flex items-center"
              >
                Explore Products
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                </svg>
              </Link>
              
              <Link 
                href="/contact" 
                className="px-6 py-3 border border-gray-300 hover:border-gray-400 text-gray-800 font-medium rounded-md transition-colors duration-300"
              >
                Contact Us
              </Link>
            </div>

            <div className="mt-12">
              {/* Animated Trusted By Section */}
              <div className="flex items-center">
                <div className="flex items-center">
                  {/* Icon instead of image */}
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                  
                  {/* Loading Numbers */}
                  <div className="flex items-center">
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4].map((num, index) => (
                        <div 
                          key={num}
                          className={`loading-number w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                            loadingStep >= num ? 'bg-blue-600 text-white scale-100' : 'bg-gray-200 text-gray-400 scale-90'
                          }`}
                          style={{ animationDelay: `${index * 300}ms` }}
                        >
                          <span className="text-xs font-medium">{num}</span>
                        </div>
                      ))}
                    </div>
                    
                    {/* Text that appears after loading */}
                    <div 
                      className={`ml-3 transition-all duration-500 ${
                        showTrustedText ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
                      }`}
                    >
                      <p className="text-sm text-gray-600">
                        Trusted by <span className="font-semibold">1000+</span> businesses worldwide
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Hero Image - Right Side */}
          <div 
            className={`w-full lg:w-1/2 transition-all duration-1000 delay-300 transform ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}
          >
            <div className="relative">
              {/* Smart City Illustration */}
              <Image
                src="/hero1.png"
                alt="Smart City Solutions"
                width={800}
                height={600}
                priority
                className="w-full h-auto object-contain"
              />
              
              {/* CCTV Camera Image - Floating Effect */}
              <div className="absolute -top-10 -right-10 lg:right-24 w-52 lg:w-64 animate-float z-10">
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-500 rounded-xl blur-xl opacity-20 scale-110"></div>
                  <Image
                    src="/security-camera.png"
                    alt="High-Performance CCTV Camera"
                    width={300}
                    height={300}
                    className="relative z-20"
                    priority
                  />
                  <div className="absolute -bottom-2 right-4 bg-white text-blue-800 text-xs font-semibold py-1 px-3 rounded-full shadow-lg">
                    Advanced Imaging
                  </div>
                </div>
              </div>
              
              {/* Floating Elements */}
              <div className="absolute -top-4 -left-4 p-4 bg-white rounded-lg shadow-lg animate-float">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-xs font-medium">Smart Security</span>
                </div>
              </div>
              
              <div className="absolute top-1/2 right-0 p-4 bg-white rounded-lg shadow-lg animate-float-delayed">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                  <span className="text-xs font-medium">IoT Networks</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Badges - Now positioned on the right side */}
      <div className={`absolute bottom-6 md:bottom-12 lg:bottom-24 right-6 md:right-12 lg:right-24 bg-white/90 backdrop-blur-sm shadow-xl rounded-xl px-6 py-4 flex gap-6 transition-all duration-1000 z-10 border border-blue-100 ${isVisible ? 'opacity-100' : 'opacity-0 translate-y-10'}`}>
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
            </svg>
          </div>
          <div>
            <p className="text-xs text-gray-500">Resolution</p>
            <p className="text-sm font-semibold">4K Ultra HD</p>
          </div>
        </div>
        
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
            </svg>
          </div>
          <div>
            <p className="text-xs text-gray-500">Security</p>
            <p className="text-sm font-semibold">Advanced AI</p>
          </div>
        </div>
        
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center mr-3">
            <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
          </div>
          <div>
            <p className="text-xs text-gray-500">Power</p>
            <p className="text-sm font-semibold">Low Consumption</p>
          </div>
        </div>
      </div>

      {/* Water Effect Animation */}
      <div className="absolute bottom-0 left-0 right-0 overflow-hidden h-24 md:h-32 z-0">
        <div className="water-waves">
          <div className="water-wave water-wave-1"></div>
          <div className="water-wave water-wave-2"></div>
          <div className="water-wave water-wave-3"></div>
        </div>
        
        {/* Floating Elements on the Water */}
        <div className="absolute bottom-4 left-[15%] animate-float-slow">
          <div className="h-3 w-3 bg-blue-400 rounded-full opacity-70"></div>
        </div>
        <div className="absolute bottom-8 left-[45%] animate-float">
          <div className="h-2 w-2 bg-blue-300 rounded-full opacity-60"></div>
        </div>
        <div className="absolute bottom-6 right-[25%] animate-float-delayed">
          <div className="h-4 w-4 bg-blue-500 rounded-full opacity-50"></div>
        </div>
      </div>
    </section>
  );
}