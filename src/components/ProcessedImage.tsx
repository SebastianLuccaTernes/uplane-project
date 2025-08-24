'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ProcessedImageProps {
  originalImage: string;
  processedImage?: string;
  isProcessing: boolean;
}

export default function ProcessedImage({ 
  originalImage, 
  processedImage, 
  isProcessing 
}: ProcessedImageProps) {
  const [showComparison, setShowComparison] = useState(false);

  const handleDownload = () => {
    if (processedImage) {
      const link = document.createElement('a');
      link.href = processedImage;
      link.download = 'background-removed.png';
      link.click();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div className="flex justify-center space-x-4">
        <button
          onClick={() => setShowComparison(false)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            !showComparison
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Result
        </button>
        <button
          onClick={() => setShowComparison(true)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            showComparison
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Compare
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {showComparison ? (
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="p-6 border-r">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Original</h3>
              <div className="relative aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden">
                <Image
                  src={originalImage}
                  alt="Original"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Background Removed
              </h3>
              <div className="relative aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden">
                {isProcessing ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  </div>
                ) : processedImage ? (
                  <Image
                    src={processedImage}
                    alt="Processed"
                    fill
                    className="object-contain"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    No processed image
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6">
            <div className="relative aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden">
              {isProcessing ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Processing your image...</p>
                  </div>
                </div>
              ) : processedImage ? (
                <Image
                  src={processedImage}
                  alt="Processed"
                  fill
                  className="object-contain"
                />
              ) : (
                <Image
                  src={originalImage}
                  alt="Original"
                  fill
                  className="object-contain"
                />
              )}
            </div>
          </div>
        )}
      </div>

      {processedImage && !isProcessing && (
        <div className="flex justify-center">
          <button
            onClick={handleDownload}
            className="bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-3 rounded-lg transition-colors flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Download Result</span>
          </button>
        </div>
      )}
    </div>
  );
}
