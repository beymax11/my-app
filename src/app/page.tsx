"use client";

import React, { useState } from 'react';
import { Header, Footer } from '../components';
import { useUserContext } from '../context/UserContext';
import HeroSection from '../components/sections/HeroSection';
import ItemsCategory from '../components/sections/ItemsCategory';
import AboutUs from '../components/sections/AboutUs';
import MonthlyDeals from '../components/sections/MonthlyDeals';
import NewCollectionBanner from '../components/sections/NewCollectionBanner';
import FreshDrops from '../components/sections/FreshDrops';
import FeaturedProducts from '../components/sections/FeaturedProducts';
import FreeDesignConsultation from '../components/sections/FreeDesignConsultation';
import Link from 'next/link';

export default function Home() {
  const { user, logout } = useUserContext();
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-white font-sans">
      <Header 
        user={user}
        setIsAccountDropdownOpen={setIsAccountDropdownOpen}
        isAccountDropdownOpen={isAccountDropdownOpen}
        handleLogout={logout}
        setUser={() => {}} // This will be handled by the context
      />
      
      {/* Main Content */}
      <main className="p-0 mx-0 w-full">
        <HeroSection />
        <ItemsCategory user={user} />
        <AboutUs />
        <MonthlyDeals />
        <NewCollectionBanner />
        <FreshDrops />
        <FeaturedProducts />
        <FreeDesignConsultation />
        
        {/* Inserted Image Section */}
        <div className="w-full">
          <Link href="/product-list">
            <img
              src="banner.png"
              alt="Testimonials"
              className="w-full object-cover"
            />
              </Link>
              </div>
              
        {/* Slide Animation Styles */}
        <style>{`
          .slide-left {
            animation: slideLeft 0.3s ease-out;
          }
          .slide-right {
            animation: slideRight 0.3s ease-out;
          }
          @keyframes slideLeft {
            from { transform: translateX(100%); opacity: 0.5; }
            to { transform: translateX(0); opacity: 1; }
          }
          @keyframes slideRight {
            from { transform: translateX(-100%); opacity: 0.5; }
            to { transform: translateX(0); opacity: 1; }
          }
        `}</style>
      </main>

      <Footer />
    </div>
  );
}
