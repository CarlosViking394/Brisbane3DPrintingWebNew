'use client';

import React, { useState } from 'react';
import FileUploader from '../components/FileUploader';
import ModelViewer from '../components/ModelViewer';
import MaterialSelector from '../components/MaterialSelector';
// import BatchModeToggle from '../components/BatchModeToggle'; // Commented out batch mode
import CostEstimator from '../components/CostEstimator';
import ETACalculator from '../components/ETACalculator';
import Header from '../components/Header';
import { CostBreakdown, ModelFile, MaterialType, OptionalService, ETACalculation } from '../types';

// Default material
const DEFAULT_MATERIAL: MaterialType = {
  name: 'PLA',
  pricePerKg: 25,
  category: 'standard',
};

export default function Home() {
  // State management
  const [modelFile, setModelFile] = useState<ModelFile | undefined>(undefined);
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialType>(DEFAULT_MATERIAL);
  const [isBatch, setIsBatch] = useState<boolean>(false);
  const [costBreakdown, setCostBreakdown] = useState<CostBreakdown | null>(null);
  const [optionalServices, setOptionalServices] = useState<OptionalService[]>([]);
  const [etaCalculation, setEtaCalculation] = useState<ETACalculation | undefined>(undefined);

  // Handle file upload
  const handleFileUpload = (file: ModelFile) => {
    console.log('Page received uploaded file:', file);
    console.log('Parsed model geometry:', file.parsedModel?.geometry);
    setModelFile(file);
  };

  // Handle material change
  const handleMaterialChange = (material: MaterialType) => {
    setSelectedMaterial(material);
  };

  // Handle batch mode toggle
  const handleBatchToggle = (batchMode: boolean) => {
    setIsBatch(false);
  };

  // Handle cost breakdown change
  const handleCostBreakdownChange = (breakdown: CostBreakdown | null) => {
    setCostBreakdown(breakdown);
  };

  // Handle optional service update
  const handleServiceUpdate = (index: number, service: OptionalService) => {
    const newServices = [...optionalServices];
    if (index < newServices.length) {
      newServices[index] = service;
    } else {
      newServices.push(service);
    }
    setOptionalServices(newServices);
  };

  // Function to handle payment button click
  const handlePrintNowClick = async () => {
    if (!modelFile || !costBreakdown) {
      alert('Please upload a model and calculate costs first');
      return;
    }
    
    try {
      console.log('Initiating Stripe checkout...');
      
      // In a real implementation, we would send the cost and model details to the API
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: costBreakdown.totalCost,
          productName: `3D Print: ${modelFile.filename}`,
          modelDetails: {
            material: selectedMaterial.name,
            dimensions: modelFile.dimensions,
            volume: modelFile.volume,
            weight: costBreakdown.weightGrams,
            printTime: costBreakdown.printTimeHours,
          }
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // In a real implementation, we would redirect to the Stripe checkout URL
        console.log('Redirecting to Stripe payment page...');
        // window.location.href = data.url;
        
        // For demo purposes, just open a new tab with the API response
        alert('In a real implementation, you would be redirected to Stripe. Check the console for details.');
        console.log('Checkout details:', data);
      } else {
        throw new Error(data.error || 'Failed to create checkout session');
      }
    } catch (error) {
      console.error('Error initiating checkout:', error);
      alert('There was an error processing your payment. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 pt-36 pb-8 md:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column - Preview, Upload, and Material Selection */}
          <div className="lg:col-span-5 space-y-8">
            {/* Model Preview Section */}
            <section className="bg-white rounded-xl shadow-sm p-6 space-y-4">
              <h2 className="text-xl font-bold text-gray-900">Model Preview</h2>
              <ModelViewer modelFile={modelFile} className="h-96" />
            </section>
            
            {/* File Upload Section */}
            <section className="bg-white rounded-xl shadow-sm p-6 space-y-4">
              <h2 className="text-xl font-bold text-gray-900">Upload 3D Model</h2>
              <FileUploader onFileUpload={handleFileUpload} />
            </section>
            
            {/* Material Selection */}
            <section className="bg-white rounded-xl shadow-sm p-6 space-y-4">
              <h2 className="text-xl font-bold text-gray-900">Material Selection</h2>
              <MaterialSelector 
                selectedMaterial={selectedMaterial} 
                onMaterialChange={handleMaterialChange} 
                modelVolume={modelFile?.parsedModel?.stats?.volume}
              />
            </section>
          </div>
          
          {/* Right Column - Options and Calculations */}
          <div className="lg:col-span-7 space-y-8">
            {/* Batch Mode Toggle - Commented out
            <div className="grid grid-cols-1 md:grid-cols-1 gap-8">
              <section className="bg-white rounded-xl shadow-sm p-6 space-y-4">
                <BatchModeToggle 
                  isBatch={isBatch} 
                  onToggle={handleBatchToggle} 
                  selectedMaterial={selectedMaterial} 
                />
              </section>
            </div>
            */}
            
            {/* Unified Cost & Delivery Calculator */}
            <section id="print-calculator" className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6 border-b border-gray-200 pb-4">
                <div className="flex items-center">
                  <h2 className="text-xl font-bold text-gray-900">Print Cost & Delivery</h2>
                  {costBreakdown && (
                    <span className={`ml-3 px-3 py-1 rounded-full text-sm font-medium ${
                      selectedMaterial.category === 'standard' ? 'bg-blue-100 text-blue-700' : 
                      selectedMaterial.category === 'exotic' ? 'bg-purple-100 text-purple-700' : 
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {selectedMaterial.name} ({selectedMaterial.category.charAt(0).toUpperCase() + selectedMaterial.category.slice(1)})
                    </span>
                  )}
                </div>
                {costBreakdown && (
                  <div className={`text-lg font-bold ${
                    selectedMaterial.category === 'standard' ? 'text-blue-600' : 
                    selectedMaterial.category === 'exotic' ? 'text-purple-600' : 
                    'text-orange-600'
                  }`}>
                    ${costBreakdown.totalCost.toFixed(2)}
                  </div>
                )}
              </div>
              
              <div className="space-y-8">
                {/* Cost Calculator Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Cost Calculator
                  </h3>
                  <CostEstimator 
                    selectedMaterial={selectedMaterial} 
                    onMaterialChange={handleMaterialChange} 
                    isBatch={isBatch} 
                    onBatchToggle={handleBatchToggle} 
                    modelFile={modelFile} 
                    onCostBreakdownChange={handleCostBreakdownChange} 
                  />
                </div>
                
                {/* ETA Calculator Section */}
                <div className="space-y-4 pt-4 border-t border-gray-200">
                  <ETACalculator 
                    costBreakdown={costBreakdown || undefined}
                    materialCategory={selectedMaterial.category}
                  />
                </div>
                
                {/* Print Now Button */}
                {costBreakdown && (
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <button
                      onClick={handlePrintNowClick}
                      disabled={!modelFile}
                      className={`w-full py-4 rounded-lg flex items-center justify-center font-bold text-lg transition-all ${
                        modelFile 
                          ? `${selectedMaterial.category === 'standard' 
                              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                              : selectedMaterial.category === 'exotic' 
                                ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                                : 'bg-orange-600 hover:bg-orange-700 text-white'}`
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Print Now - ${costBreakdown.totalCost.toFixed(2)}
                    </button>
                    <p className="text-center text-sm text-gray-500 mt-2">
                      Secure payment via Stripe
                    </p>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="max-w-7xl mx-auto mt-16 pt-8 border-t border-gray-200 text-sm text-gray-500">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-semibold text-gray-700 mb-4">Brisbane 3D Printing</h3>
            <p>Professional 3D printing services for prototypes, models, and production parts.</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-700 mb-4">Contact</h3>
            <p>123 Printer Street</p>
            <p>Brisbane, QLD 4000</p>
            <p>info@brisbane3dprint.com.au</p>
            <p>(07) 1234-5678</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-700 mb-4">Services</h3>
            <ul className="space-y-2">
              <li>3D Printing</li>
              <li>3D Modeling</li>
              <li>Finishing Services</li>
              <li>Bulk Orders</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-200 text-center">
          <p>&copy; {new Date().getFullYear()} Brisbane 3D Printing. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
