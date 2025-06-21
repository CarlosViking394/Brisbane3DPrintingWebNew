import React from 'react';
import Image from 'next/image';

const Header: React.FC = () => {
  // Calculate 15% smaller dimensions (original was 240x80)
  const width = Math.round(240 * 0.85); // 204
  const height = Math.round(80 * 0.85); // 68
  
  return (
    <header className="fixed top-0 left-0 right-0 bg-white py-8 shadow-md z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {/* Logo Container - keeping the same container height */}
            <div className="h-16 flex items-center">
              <Image
                src="/Logo-Brisbane-3D-Printing-v2-Down.png"
                alt="Brisbane 3D Printing Logo"
                width={width}
                height={height}
                priority
              />
            </div>
          </div>
          
          {/* Navigation - Not linked as per request */}
          <nav className="hidden md:block">
            <ul className="flex space-x-8">
              <li className="text-gray-800 hover:text-orange-500 cursor-pointer font-medium">Print my model</li>
              <li className="text-gray-800 hover:text-orange-500 cursor-pointer font-medium">Prices</li>
              <li className="text-gray-800 hover:text-orange-500 cursor-pointer font-medium">Services</li>
              <li className="text-gray-800 hover:text-orange-500 cursor-pointer font-medium">Materials</li>
              <li className="text-gray-800 hover:text-orange-500 cursor-pointer font-medium">Free models</li>
            </ul>
          </nav>
          
          {/* Mobile menu button - Just for visual */}
          <div className="md:hidden">
            <button className="text-gray-800 hover:text-orange-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
          
          {/* Quote button */}
          <div className="hidden md:block">
            <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md font-medium">
              Get a Quote
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 