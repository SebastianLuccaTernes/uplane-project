'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ProcessedImageProps {
  originalImage: string;
  processedImage?: string;
  isProcessing: boolean;
}

interface UploadedImageData {
  id: string;
  public_url: string;
  filename: string;
}

export default function ProcessedImage({ 
  originalImage, 
  processedImage, 
  isProcessing 
}: ProcessedImageProps) {
  const [showComparison, setShowComparison] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<UploadedImageData | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDownload = () => {
    if (processedImage) {
      const link = document.createElement('a');
      link.href = processedImage;
      link.download = 'background-removed.png';
      link.click();
    }
  };

  const handleUpload = async () => {
    if (!processedImage) return;

    setIsUploading(true);
    try {
      // Convert blob URL to File
      const response = await fetch(processedImage);
      const blob = await response.blob();
      const file = new File([blob], 'processed-image.png', { type: 'image/png' });

      const formData = new FormData();
      formData.append('image', file);

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.error || 'Failed to upload image');
      }

      const result = await uploadResponse.json();
      setUploadedImage(result.data);
      alert('Image uploaded successfully! You can now share the link.');

    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!uploadedImage) return;

    if (!confirm('Are you sure you want to delete this image?')) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/delete/${uploadedImage.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete image');
      }

      setUploadedImage(null);
      alert('Image deleted successfully!');

    } catch (error) {
      console.error('Error deleting image:', error);
      alert('Failed to delete image. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const copyToClipboard = () => {
    if (uploadedImage) {
      navigator.clipboard.writeText(uploadedImage.public_url);
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
        <div className="space-y-4">
          <div className="flex justify-center space-x-4">
            <button
              onClick={handleDownload}
              className="bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-3 rounded-lg transition-colors flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Download Result</span>
            </button>

            {!uploadedImage && (
              <button
                onClick={handleUpload}
                disabled={isUploading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium px-6 py-3 rounded-lg transition-colors flex items-center space-x-2"
              >
                {isUploading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                )}
                <span>{isUploading ? 'Uploading...' : 'Get Share Link'}</span>
              </button>
            )}
          </div>

          {uploadedImage && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="text-green-800 font-medium mb-2">Image uploaded successfully!</h4>
              <div className="flex items-center space-x-2 mb-3">
                <input
                  type="text"
                  value={uploadedImage.public_url}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
                <button
                  onClick={copyToClipboard}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md text-sm transition-colors"
                >
                  Copy Link
                </button>
              </div>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-4 py-2 rounded-md text-sm transition-colors flex items-center space-x-2"
              >
                {isDeleting ? (
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                )}
                <span>{isDeleting ? 'Deleting...' : 'Delete from Cloud'}</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
