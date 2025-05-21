import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

export default function MarketingUseCases() {
  const [activeCategory, setActiveCategory] = useState('social');
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [sectionHeight, setSectionHeight] = useState('250vh'); // Default fallback height
  const sectionRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Categories data
  const categories = [
    { id: 'social', name: 'Social media', 
      description: 'Post your videos online and reach the masses with engaging social content designed to drive more engagement.', 
      image: '/market/img2.jpg' },
    { id: 'advertising', name: 'Advertising', 
      description: 'Create stunning ads that grab attention and convert customers with professional video animations.', 
      image: '/market/img1.jpg' },
    { id: 'photography', name: 'Photography', 
      description: 'Bring your still images to life with subtle movements and transitions that create visual interest.', 
      image: '/market/img3.jpg' },
  ];

  // Handle window-based calculations safely
  useEffect(() => {
    // This runs only in the browser, after the component mounts
    if (typeof window !== 'undefined') {
      setSectionHeight(`${window.innerHeight * 2.5}px`);
      
      // Optional: Update height on window resize
      const handleResize = () => {
        setSectionHeight(`${window.innerHeight * 2.5}px`);
      };
      
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  // Find current active category data
  const activeData = categories.find(cat => cat.id === activeCategory) || categories[0];

  // Handle intersection observer for initial visibility
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );
    
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    
    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  // Handle scroll-driven category changes
  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current || !isVisible) return;

      // Get the section's position and dimensions
      const rect = sectionRef.current.getBoundingClientRect();
      const sectionTop = rect.top;
      const sectionHeight = rect.height;
      const viewportHeight = window.innerHeight;
      
      // Adjusted calculation for better category triggering
      // Make sure we can reach the end (progress = 1.0)
      const startPoint = viewportHeight * 0.7; // Start when section is higher in the viewport
      const endPoint = -viewportHeight * 0.3; // End point further down to ensure we reach the end
      const totalScrollDistance = sectionHeight - (endPoint - startPoint);
      
      // Calculate normalized scroll progress (0 to 1)
      let progress = (startPoint - sectionTop) / totalScrollDistance;
      progress = Math.max(0, Math.min(1, progress));
      setScrollProgress(progress);
      
      // Map scroll progress to categories with slightly adjusted thresholds
      // Photography gets triggered earlier
      if (progress < 0.3) {
        setActiveCategory('social');
      } else if (progress < 0.6) {
        setActiveCategory('advertising');
      } else {
        setActiveCategory('photography');
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initialize on mount
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isVisible, categories]);

  return (
    <section 
      ref={sectionRef}
      className="relative py-24 bg-gray-50"
      // Use the state variable instead of directly accessing window
      style={{ height: sectionHeight }}
    >
      {/* Sticky container that stays in view during scrolling */}
      <div 
        ref={contentRef}
        className="sticky top-0 left-0 w-full h-screen flex items-center"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div 
            className={`transition-all duration-1000 transform ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
            }`}
          >
            {/* Header with badge */}
            <div className="mb-4">
              <span className="inline-block bg-purple-500 text-white text-xs font-medium px-3 py-1 rounded-full">
                FOR YOU
              </span>
            </div>
            
            {/* Main heading and description */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
              <div className="max-w-2xl mb-6 md:mb-0">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                  Animate for social media, ads, marketing, brand, product, and more
                </h2>
                <p className="text-gray-600">
                  The best brands use motion across all platforms to capture attention, tell powerful stories, and drive more engagement.
                </p>
              </div>
              
              <button className="px-6 py-3 bg-gray-900 hover:bg-black text-white rounded-full transition-colors duration-300 text-sm font-medium">
                Request demo access
              </button>
            </div>
            
            {/* Content area with categories and preview */}
            <div className="bg-white rounded-2xl p-6 md:p-10 shadow-sm grid grid-cols-1 md:grid-cols-5 gap-8">
              {/* Left side: Categories */}
              <div className="md:col-span-2">
                <div className="space-y-2">
                  {categories.map((category, idx) => {
                    // Simplified active state checking using the activeCategory state
                    const isActive = category.id === activeCategory;
                    
                    return (
                      <div key={category.id} className="mb-6">
                        <button
                          onClick={() => setActiveCategory(category.id)}
                          className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-300 ${
                            isActive ? 'bg-gray-100 font-medium' : 'hover:bg-gray-50'
                          }`}
                        >
                          <h3 className={`text-base ${
                            isActive ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                            {category.name}
                          </h3>
                        </button>
                        
                        {isActive && (
                          <div className="px-4 py-2 text-sm text-gray-600 animate-fadeIn">
                            <p>{category.description}</p>
                            <div className="mt-3 h-0.5 w-24 bg-gray-200"></div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  
                  {/* Scroll progress indicator with debug values */}
                  <div className="mt-6">
                    <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 transition-all duration-200"
                        style={{ width: `${scrollProgress * 100}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>Social</span>
                      <span>Advertising</span>
                      <span>Photography</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Right side: Preview */}
              <div className="md:col-span-3 bg-gray-50 rounded-xl overflow-hidden relative">
                <div className="flex items-center justify-center h-full min-h-[400px]">
                  {categories.map((category) => (
                    <div 
                      key={category.id}
                      className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 ${
                        category.id === activeCategory ? 'opacity-100 z-10' : 'opacity-0 z-0'
                      }`}
                    >
                      <div className="relative">
                        <Image 
                          src={category.image}
                          alt={category.name}
                          width={500}
                          height={400}
                          className="rounded-lg shadow-md"
                          priority
                        />
                        
                        {/* UI Elements overlay */}
                        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 text-xs font-medium text-gray-700 shadow-sm">
                          @spottive_official
                        </div>
                        
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-1">
                          {categories.map((_, i) => (
                            <div 
                              key={i} 
                              className={`h-1.5 w-1.5 rounded-full ${
                                categories[i].id === activeCategory 
                                  ? 'bg-white' 
                                  : 'bg-white/50'
                              }`}
                            ></div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}