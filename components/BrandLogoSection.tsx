import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

export default function BrandLogoSection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  // Array of brand logos from the public/brand folder
  const brandLogos = [
    { id: 2, name: "UNV" },
    { id: 3, name: "Ezviz" },
    { id: 4, name: "D-Link" },
    { id: 5, name: "Grandstream" },
    { id: 6, name: "Dahua" },
    { id: 7, name: "Imou" },
    { id: 8, name: "TP-Link" },
    { id: 9, name: "Seagate" },
    { id: 10, name: "Hikvision" },
    { id: 11, name: "ZKTeco" },
    { id: 12, name: "Ubiquiti" },
    { id: 13, name: "WD" },
    { id: 14, name: "Eufy" },
    { id: 15, name: "Yealink" }
  ];

  // Animation variations for different logos
  const animations = [
    "fade-in-up",
    "fade-in-down",
    "fade-in-left",
    "fade-in-right",
    "scale-in"
  ];

  // Handle intersection observer for animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );
    
    // Store current value of ref for cleanup
    const currentRef = sectionRef.current;
    
    if (currentRef) {
      observer.observe(currentRef);
    }
    
    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  // Function to get a random animation class
  const getRandomAnimation = (index: number) => {
    // Use modulo to cycle through animations, but in a way that spreads them out
    return animations[index % animations.length];
  };

  return (
    <section ref={sectionRef} className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Trusted by Leading Brands
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            We partner with top security and technology companies to deliver premium solutions for your business needs.
          </p>
        </div>

        {/* First row of logos with different animations */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-16">
          {brandLogos.slice(0, 6).map((logo, index) => (
            <div 
              key={logo.id}
              className={`flex items-center justify-center ${
                isVisible ? `animate-${getRandomAnimation(index)}` : 'opacity-0'
              }`}
              style={{ 
                animationDelay: `${index * 0.2}s`,
                animationDuration: '1s',
                animationFillMode: 'forwards'
              }}
            >
              <div className="relative w-32 h-32 transition-transform duration-700 hover:scale-110">
                <Image
                  src={`/brand/${logo.id}.jpg`}
                  alt={logo.name}
                  fill
                  sizes="(max-width: 768px) 50vw, 16vw"
                  className="object-contain"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Second row of logos with floating animation */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-8">
          {brandLogos.slice(6).map((logo, index) => (
            <div 
              key={logo.id}
              className={`flex items-center justify-center ${
                isVisible ? 'opacity-100' : 'opacity-0'
              } transition-opacity duration-1000`}
              style={{ 
                transitionDelay: `${(index + 6) * 0.15}s`,
                animationName: isVisible ? 'float' : 'none',
                animationDuration: `${3 + index % 3}s`,
                animationTimingFunction: 'ease-in-out',
                animationIterationCount: 'infinite',
                animationDirection: 'alternate',
                animationDelay: `${index * 0.3}s`
              }}
            >
              <div className="relative w-24 h-24 transition-all duration-500 hover:scale-110 hover:shadow-lg rounded-lg">
                <Image
                  src={`/brand/${logo.id}.jpg`}
                  alt={logo.name}
                  fill
                  sizes="(max-width: 768px) 25vw, 12vw"
                  className="object-contain"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}