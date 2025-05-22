"use client";

import HeroSection from '../components/HeroSection';
import FeatureCards from '../components/FeatureCards';
import FeatureGrid from '../components/FeatureGrid';
import MarketingUseCases from '../components/MarketingUseCases';
import BrandLogoSection from '../components/BrandLogoSection';

export default function Home() {
  return (
    <main>
      <HeroSection />
      <FeatureCards />
      <FeatureGrid />
      <MarketingUseCases />
      <BrandLogoSection />
    </main>
  );
}