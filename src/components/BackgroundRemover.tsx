'use client';

import { useState } from 'react';
import ImageUploader from './ImageUploader';
import ProcessedImage from './ProcessedImage';

export default function BackgroundRemover() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [originalFile, setOriginalFile] = useState<File | null>(null);

  const handleImageUpload = async (file: File) => {
    const url = URL.createObjectURL(file);
    setOriginalImage(url);
    setOriginalFile(file);
    setProcessedImage(null);
    
    await processImage(file);
  };

  const processImage = async (file: File) => {
    // Process image using the API
    setIsProcessing(true);
    
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('flip', 'true'); 
      
      const response = await fetch('/api/removebg', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process image');
      }
      
      // Create blob URL for the processed image
      const blob = await response.blob();
      const processedUrl = URL.createObjectURL(blob);
      setProcessedImage(processedUrl);
      
    } catch (error) {
      console.error('Error processing image:', error);
      alert('Failed to process image. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    if (originalImage) {
      URL.revokeObjectURL(originalImage);
    }
    if (processedImage) {
      URL.revokeObjectURL(processedImage);
    }
    
    setOriginalImage(null);
    setProcessedImage(null);
    setIsProcessing(false);
    setOriginalFile(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Remove Background from Images and Flip it 
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Upload your image and our we will automatically remove the background for you and Flip the image horizontally. 
            Fast, accurate, and completely free.
          </p>
        </div>

        {!originalImage ? (
          <ImageUploader onImageUpload={handleImageUpload} />
        ) : (
          <div className="space-y-8">
            <ProcessedImage
              originalImage={originalImage}
              processedImage={processedImage || undefined}
              isProcessing={isProcessing}
            />
            
            <div className="flex justify-center">
              <button
                onClick={handleReset}
                className="bg-gray-600 hover:bg-gray-700 text-white font-medium px-6 py-3 rounded-lg transition-colors"
              >
                Upload New Image
              </button>
            </div>
          </div>
        )}

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">1. Upload</h3>
            <p className="text-gray-600">
              Drag and drop your image or click to browse from your device
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">2. Process</h3>
            <p className="text-gray-600">
              Our AI automatically detects and removes the background
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">3. Download</h3>
            <p className="text-gray-600">
              Download your image with transparent background in high quality
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
