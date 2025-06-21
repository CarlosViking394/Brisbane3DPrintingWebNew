import React, { useRef, useState } from 'react';
import { ModelFile } from '../types';
import { parse3DFile, formatModelStats } from '../utils/3dFileParser';

interface FileUploaderProps {
  onFileUpload: (file: ModelFile) => void;
  isLoading?: boolean;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileUpload, isLoading = false }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (file: File) => {
    setError(null);
    setParsing(true);
    
    console.log('File selected:', file.name, 'Size:', file.size, 'Type:', file.type);
    
    try {
      // Parse 3D file (auto-detects STL or 3MF format)
      console.log('Attempting to parse 3D file...');
      const parsedModel = await parse3DFile(file);
      console.log('File parsed successfully:', parsedModel);
      console.log('Geometry received:', parsedModel.geometry);
      
      const modelFile: ModelFile = {
        file,
        filename: file.name,
        size: file.size,
        volume: parsedModel.stats.volume,
        dimensions: {
          x: parsedModel.stats.dimensions.width,
          y: parsedModel.stats.dimensions.height,
          z: parsedModel.stats.dimensions.depth,
        },
        parsedModel,
      };
      
      console.log('Calling onFileUpload with:', modelFile);
      onFileUpload(modelFile);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to parse file';
      setError(errorMessage);
      console.error('File upload error:', error);
    } finally {
      setParsing(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith('.stl') || file.name.endsWith('.3mf'))) {
      handleFileSelect(file);
    } else if (file) {
      setError('Please upload a valid STL or 3MF file');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  return (
    <div className="w-full">
      <div
        className={`relative border-2 rounded-xl p-8 text-center transition-all duration-300 ease-in-out
          ${dragOver 
            ? 'border-blue-500 bg-blue-50 shadow-lg scale-[1.01]' 
            : error 
              ? 'border-red-300 bg-red-50'
              : 'border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50/50'
          }
          ${isLoading || parsing ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !parsing && !isLoading && fileInputRef.current?.click()}
        tabIndex={0}
        role="button"
        aria-label="Upload 3D model file"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            !parsing && !isLoading && fileInputRef.current?.click();
          }
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".stl,.3mf"
          onChange={handleInputChange}
          className="hidden"
          disabled={isLoading || parsing}
          aria-label="Upload 3D model file"
        />
        
        {parsing ? (
          <div className="py-6">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="w-16 h-16 rounded-full border-4 border-blue-300 border-t-blue-600 animate-spin"></div>
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">
                  Analyzing 3D Model...
                </h3>
                <p className="text-gray-600">
                  This may take a moment depending on model complexity
                </p>
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="py-6">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="flex items-center justify-center w-16 h-16 bg-red-100 text-red-600 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-red-600 mb-2">
                  Upload Error
                </h3>
                <p className="text-red-500 mb-3 max-w-md mx-auto">{error}</p>
                <button
                  onClick={(e) => { e.stopPropagation(); setError(null); }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  aria-label="Try uploading again"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-6">
            <div className="flex flex-col items-center justify-center space-y-5">
              <div className="relative">
                <div className="flex items-center justify-center w-20 h-20 bg-blue-100 text-blue-600 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                {dragOver && (
                  <div className="absolute inset-0 flex items-center justify-center bg-blue-600 bg-opacity-90 rounded-full text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13l-3 3m0 0l-3-3m3 3V8m0 13a9 9 0 110-18 9 9 0 010 18z" />
                    </svg>
                  </div>
                )}
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Upload Your 3D Model
                </h3>
                <p className="text-gray-600 mb-4">
                  {dragOver ? 'Drop to upload!' : 'Drag and drop your STL or 3MF file here, or click to browse'}
                </p>
              </div>
              
              <div className="flex flex-wrap justify-center gap-3">
                {['STL', '3MF'].map(format => (
                  <div key={format} className="px-3 py-1.5 bg-gray-100 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-1.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {format}
                  </div>
                ))}
              </div>
              
              <div className="text-xs text-gray-500 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Maximum file size: 100MB
              </div>
            </div>
          </div>
        )}
        
        {/* Animated border effect when dragging */}
        {dragOver && (
          <div className="absolute inset-0 border-2 border-blue-500 rounded-xl pointer-events-none">
            <div className="absolute inset-0 animate-pulse bg-blue-400 bg-opacity-10"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUploader; 