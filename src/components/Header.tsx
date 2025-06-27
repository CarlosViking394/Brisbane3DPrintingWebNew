import React from 'react';
import Image from 'next/image';

interface HeaderProps {
  totalCost?: number | null;
  modelAvailable?: boolean;
}

const Header: React.FC<HeaderProps> = ({ totalCost, modelAvailable = false }) => {
  // Calculate 15% smaller dimensions (original was 240x80)
  const width = Math.round(240 * 0.85); // 204
  const height = Math.round(80 * 0.85); // 68
  
  // Function to handle payment button click
  const handlePrintNowClick = () => {
    // If we have a model and cost, try to trigger the main button's action
    if (modelAvailable) {
      const mainPrintButton = document.querySelector('#print-calculator button:not([disabled])');
      if (mainPrintButton) {
        // Try to trigger the click event on the main button
        (mainPrintButton as HTMLButtonElement).click();
        return;
      }
    }
    
    // Fallback: just scroll to the calculator section
    const calculatorSection = document.querySelector('#print-calculator');
    if (calculatorSection) {
      calculatorSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      // Fallback if the section isn't found
      window.scrollTo({
        top: 500,
        behavior: 'smooth'
      });
    }
  };
  
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
          
          {/* Print Now button - routes to Stripe */}
          <div className="hidden md:block">
            <button 
              onClick={handlePrintNowClick}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {totalCost ? `Print Now - $${totalCost.toFixed(2)}` : 'Print Now'}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 