"use client";

import HeroSection from '../components/HeroSection';
import FeatureCards from '../components/FeatureCards';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Add loading fallbacks with proper height
const FeatureGrid = dynamic(() => import('../components/FeatureGrid'), {
  loading: () => <div className="min-h-[400px] flex items-center justify-center bg-gray-50"><div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>,
  ssr: false // Don't need SSR for this component
});

const MarketingUseCases = dynamic(() => import('../components/MarketingUseCases'), {
  loading: () => <div className="min-h-[400px] flex items-center justify-center bg-gray-100"><div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>,
  ssr: false // Don't need SSR for this component
});

const BrandLogoSection = dynamic(() => import('../components/BrandLogoSection'), {
  loading: () => <div className="min-h-[400px] flex items-center justify-center bg-white"><div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>,
  ssr: false // Don't need SSR for this component
});

// Use Suspense for better loading experience
export default function Home() {
  return (
    <main>
      <HeroSection />
      <FeatureCards />
      <Suspense fallback={<div className="min-h-[400px] flex items-center justify-center bg-gray-50"><div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>}>
        <FeatureGrid />
      </Suspense>
      <Suspense fallback={<div className="min-h-[400px] flex items-center justify-center bg-gray-100"><div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>}>
        <MarketingUseCases />
      </Suspense>
      <Suspense fallback={<div className="min-h-[400px] flex items-center justify-center bg-white"><div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>}>
        <BrandLogoSection />
      </Suspense>
    </main>
  );
}