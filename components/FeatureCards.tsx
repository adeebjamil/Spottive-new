import React, { useState } from 'react';

export default function FeatureCards() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const cardsData = [
    {
      bgColor: "bg-purple-400",
      imageBg: "bg-purple-300",
      image: "/team-collaboration.png",
      imageAlt: "Team collaboration",
      badgeBg: "bg-white",
      badgeText: "text-gray-800",
      badgeLabel: "Empower every team member",
      textColor: "text-white",
      description: "With Jitter, everyone can contribute to motion projects, allowing your team to deliver even more creative work, faster."
    },
    {
      bgColor: "bg-gray-100",
      imageBg: "bg-white",
      image: "/assets-management.png",
      imageAlt: "Asset management interface",
      badgeBg: "bg-gray-900",
      badgeText: "text-white",
      badgeLabel: "One home for all your assets",
      textColor: "text-gray-700",
      description: "Your projects and assets are centralized in one shared workspace, keeping your team organized and always up to date."
    },
    {
      bgColor: "bg-blue-100",
      imageBg: "bg-white",
      image: "/review-process.png",
      imageAlt: "Review process interface",
      badgeBg: "bg-gray-900",
      badgeText: "text-white",
      badgeLabel: "Speed up approvals",
      textColor: "text-gray-700",
      description: "Share your file with a link and gather feedback to speed up reviews, secure sign-off, and keep projects moving forward."
    },
    {
      bgColor: "bg-purple-100",
      imageBg: "bg-white",
      image: "/team-collaboration.png",
      imageAlt: "Team collaboration tools",
      badgeBg: "bg-purple-700",
      badgeText: "text-white",
      badgeLabel: "Streamlined workflows",
      textColor: "text-gray-700",
      description: "It's time for a better workflow. With Jitter, you can slide through the entire motion design process with your team, in one shared workspace."
    },
    {
      bgColor: "bg-green-100",
      imageBg: "bg-white",
      image: "/advanced-analytics.png",
      imageAlt: "Analytics dashboard",
      badgeBg: "bg-green-700",
      badgeText: "text-white",
      badgeLabel: "Powerful insights",
      textColor: "text-gray-700",
      description: "Get valuable metrics and analytics about your projects to optimize processes and improve team performance."
    }
  ];

  // Calculate maximum index based on the number of cards
  const maxIndex = cardsData.length - 1;
  
  const nextSlide = () => {
    setCurrentIndex(prevIndex => (prevIndex === maxIndex ? 0 : prevIndex + 1));
  };
  
  const prevSlide = () => {
    setCurrentIndex(prevIndex => (prevIndex === 0 ? maxIndex : prevIndex - 1));
  };

  // Calculate visible cards: current card and next two
  const visibleCardCount = 3; // Number of visible cards on desktop
  const getVisibleCards = () => {
    let cards = [];
    for (let i = 0; i < visibleCardCount; i++) {
      const index = (currentIndex + i) % cardsData.length;
      cards.push(cardsData[index]);
    }
    return cards;
  };

  return (
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-800">
          Smart Solutions for Modern Security
        </h2>
        
        <div className="relative">
          {/* Navigation buttons */}
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-5 z-10 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-300 focus:outline-none"
            aria-label="Previous"
          >
            <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
            </svg>
          </button>
          
          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-5 z-10 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-300 focus:outline-none"
            aria-label="Next"
          >
            <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </button>
          
          {/* Cards container with horizontal layout and smooth scroll */}
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * (100 / visibleCardCount)}%)` }}
            >
              {/* Render all cards in a loop with proper sizing */}
              {cardsData.map((card, index) => (
                <div 
                  key={index}
                  className={`flex-shrink-0 w-full md:w-1/2 lg:w-1/3 p-4 transition-all duration-300 ${
                    index >= currentIndex && index < currentIndex + visibleCardCount ? 'opacity-100' : 'opacity-100'
                  }`}
                >
                  <div className={`${card.bgColor} rounded-3xl p-8 h-full relative overflow-hidden transition-all duration-300 hover:shadow-xl group`}>
                    <div className={`${card.imageBg} rounded-2xl p-4 mb-6 inline-block transition-transform duration-300 group-hover:scale-105`}>
                      <div className="h-56 w-full flex items-center justify-center overflow-hidden">
                        <img 
                          src={card.image} 
                          alt={card.imageAlt} 
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      </div>
                    </div>
                    
                    <div className={`inline-block ${card.badgeBg} ${card.badgeText} font-semibold text-sm py-1 px-4 rounded-full mb-4 transition-all duration-300 group-hover:shadow-md`}>
                      {card.badgeLabel}
                    </div>
                    
                    <p className={`${card.textColor} text-lg mb-6 transition-opacity duration-300`}>
                      {card.description}
                    </p>

                    <div className="absolute bottom-8 right-8 opacity-0 transform translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                      <button className="rounded-full bg-white/20 backdrop-blur-sm p-2">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Pagination indicators */}
          <div className="flex justify-center mt-8 space-x-2">
            {cardsData.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  currentIndex === index ? 'w-8 bg-blue-600' : 'w-2 bg-gray-300'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              ></button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}