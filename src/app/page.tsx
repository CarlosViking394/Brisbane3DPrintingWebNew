'use client';

import React, { useState } from 'react';
import FileUploader from '../components/FileUploader';
import ModelViewer from '../components/ModelViewer';
import MaterialSelector from '../components/MaterialSelector';
import CostEstimator from '../components/CostEstimator';
import Header from '../components/Header';
import UserInformation from '../components/UserInformation';
import { CostBreakdown, ModelFile, MaterialType } from '../types';

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
  const [addressData, setAddressData] = useState<any | undefined>(undefined);

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
    setIsBatch(batchMode);
  };

  // Handle cost breakdown change
  const handleCostBreakdownChange = (breakdown: CostBreakdown | null) => {
    setCostBreakdown(breakdown);
  };
  
  // Handle address change
  const handleAddressChange = (address: any) => {
    setAddressData(address);
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
            {/* User Information for delivery */}
            <section className="bg-white rounded-xl shadow-sm p-6 space-y-4">
              <h2 className="text-xl font-bold text-gray-900">Your Information</h2>
              <UserInformation 
                onAddressChange={handleAddressChange} 
              />
            </section>

            {/* Cost Estimator */}
            <section className="bg-white rounded-xl shadow-sm p-6 space-y-4">
              <h2 className="text-xl font-bold text-gray-900">Cost Calculator</h2>
              <CostEstimator 
                selectedMaterial={selectedMaterial} 
                onMaterialChange={handleMaterialChange} 
                isBatch={isBatch} 
                onBatchToggle={handleBatchToggle} 
                modelFile={modelFile} 
                onCostBreakdownChange={handleCostBreakdownChange} 
              />
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
