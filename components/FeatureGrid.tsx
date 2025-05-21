import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

export default function FeatureGrid() {
  // Track which items are visible for animations
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set());
  const gridRef = useRef<HTMLDivElement>(null);
  
  // Feature grid data
  const gridItems = [
    {
      title: "Text animations",
      description: "Create advanced text effects that elevate your content and make it stand out.",
      image: "/winning-card.png",
      bgColor: "bg-orange-500",
      textColor: "text-white",
      category: "NEW"
    },
    {
      title: "Powerful effects",
      description: "Add beautiful gradients, overlays, shadows, and more to create stunning visual effects.",
      image: "/air-shop.png",
      bgColor: "bg-black",
      textColor: "text-white",
      category: "PRO"
    },
    {
      title: "Custom settings",
      description: "Fine-tune animation settings to match your brand's unique personality and style.",
      image: "/settings-ui.png",
      bgColor: "bg-blue-500",
      textColor: "text-white",
      category: "DESIGN"
    },
    {
      title: "Video & Audio",
      description: "Import audio and video content to create rich, interactive multimedia experiences.",
      image: "/audio-visual.png",
      bgColor: "bg-gray-100",
      textColor: "text-gray-800",
      category: "PRO"
    }
  ];

  // Set up intersection observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = parseInt(entry.target.getAttribute('data-index') || '0');
          
          if (entry.isIntersecting) {
            setVisibleItems(prev => new Set([...prev, index]));
          } else {
            setVisibleItems(prev => {
              const updated = new Set([...prev]);
              updated.delete(index);
              return updated;
            });
          }
        });
      },
      { threshold: 0.2 } // Trigger when 20% of the element is visible
    );

    // Observe all grid items
    const items = document.querySelectorAll('.grid-item');
    items.forEach((item) => {
      observer.observe(item);
    });

    return () => {
      items.forEach((item) => {
        observer.unobserve(item);
      });
    };
  }, []);

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold mb-16 text-center text-gray-800">
          Create stunning animations <span className="text-blue-600">for any project</span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {gridItems.map((item, index) => (
            <div 
              key={index}
              data-index={index}
              className={`grid-item relative overflow-hidden rounded-2xl group transition-all duration-700 transform ${
                visibleItems.has(index) 
                  ? 'opacity-100 translate-y-0' 
                  : 'opacity-0 translate-y-12'
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className={`${item.bgColor} p-8 h-full flex flex-col transition-all duration-500 group-hover:scale-[0.98]`}>
                {/* Category tag */}
                <span className="inline-block text-xs font-semibold tracking-wider mb-4 opacity-80">
                  {item.category}
                </span>
                
                {/* Content area */}
                <div className="flex flex-col h-full">
                  <div className="mb-8">
                    <h3 className={`text-xl font-bold mb-2 ${item.textColor}`}>
                      {item.title}
                    </h3>
                    <p className={`text-sm opacity-80 ${item.textColor}`}>
                      {item.description}
                    </p>
                  </div>
                  
                  {/* Image container with Next.js Image */}
                  <div className="mt-auto mb-4 bg-gray-100 rounded-xl p-4 overflow-hidden group-hover:shadow-lg transition-all duration-500">
                    <div className="transform transition-transform duration-700 group-hover:scale-105 relative w-full aspect-video">
                      <Image 
                        src={item.image}
                        alt={item.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}