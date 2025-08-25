import { POST } from '@/app/api/upload/route'
import { NextRequest } from 'next/server'

// Mock NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, options) => ({
      json: async () => data,
      status: options?.status || 200,
      ok: !options?.status || options.status < 400,
    })),
  },
}))

// Mock Supabase - use manual mock
jest.mock('@/lib/supabase')

// Mock uuid
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid-123'),
}))

describe('/api/upload route', () => {
  // Import the mocked module within the test suite
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const mockSupabaseAdmin = require('@/lib/supabase').supabaseAdmin

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST', () => {
    it('should successfully upload an image', async () => {
      // Mock file
      const mockFile = {
        name: 'test.jpg',
        type: 'image/jpeg',
        size: 1024,
        arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(1024)),
      } as unknown as File

      // Mock FormData
      const mockFormData = {
        get: jest.fn().mockReturnValue(mockFile),
      }

      // Mock request
      const mockRequest = {
        formData: jest.fn().mockResolvedValue(mockFormData),
      } as unknown as NextRequest

      // Mock Supabase responses
      mockSupabaseAdmin.storage.from.mockReturnValue({
        upload: jest.fn().mockResolvedValue({
          data: { path: 'processed/mock-uuid-123.jpg' },
          error: null,
        }),
        getPublicUrl: jest.fn().mockReturnValue({
          data: { publicUrl: 'https://example.com/image.jpg' },
        }),
        remove: jest.fn(),
      })

      mockSupabaseAdmin.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: {
                id: 1,
                filename: 'test.jpg',
                storage_path: 'processed/mock-uuid-123.jpg',
                public_url: 'https://example.com/image.jpg',
                file_size: 1024,
                mime_type: 'image/jpeg',
              },
              error: null,
            }),
          }),
        }),
      })

      const response = await POST(mockRequest)
      const data = await response.json()

      expect(data).toEqual({
        success: true,
        data: {
          id: 1,
          filename: 'test.jpg',
          storage_path: 'processed/mock-uuid-123.jpg',
          public_url: 'https://example.com/image.jpg',
          file_size: 1024,
          mime_type: 'image/jpeg',
        },
      })
    })

    it('should return error when no file provided', async () => {
      const mockFormData = {
        get: jest.fn().mockReturnValue(null),
      }

      const mockRequest = {
        formData: jest.fn().mockResolvedValue(mockFormData),
      } as unknown as NextRequest

      const response = await POST(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toEqual({
        error: 'No image file provided',
      })
    })

    it('should handle upload error', async () => {
      const mockFile = {
        name: 'test.jpg',
        type: 'image/jpeg',
        size: 1024,
        arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(1024)),
      } as unknown as File

      const mockFormData = {
        get: jest.fn().mockReturnValue(mockFile),
      }

      const mockRequest = {
        formData: jest.fn().mockResolvedValue(mockFormData),
      } as unknown as NextRequest

      // Mock upload error
      mockSupabaseAdmin.storage.from.mockReturnValue({
        upload: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Upload failed' },
        }),
      })

      const response = await POST(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toEqual({
        error: 'Failed to upload image',
      })
    })

    it('should handle database error and cleanup uploaded file', async () => {
      const mockFile = {
        name: 'test.jpg',
        type: 'image/jpeg',
        size: 1024,
        arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(1024)),
      } as unknown as File

      const mockFormData = {
        get: jest.fn().mockReturnValue(mockFile),
      }

      const mockRequest = {
        formData: jest.fn().mockResolvedValue(mockFormData),
      } as unknown as NextRequest

      const mockRemove = jest.fn()

      // Mock successful upload but database error
      mockSupabaseAdmin.storage.from.mockReturnValue({
        upload: jest.fn().mockResolvedValue({
          data: { path: 'processed/mock-uuid-123.jpg' },
          error: null,
        }),
        getPublicUrl: jest.fn().mockReturnValue({
          data: { publicUrl: 'https://example.com/image.jpg' },
        }),
        remove: mockRemove,
      })

      mockSupabaseAdmin.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Database error' },
            }),
          }),
        }),
      })

      const response = await POST(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toEqual({
        error: 'Failed to save image metadata',
      })
      expect(mockRemove).toHaveBeenCalledWith(['processed/mock-uuid-123.jpg'])
    })

    it('should handle general server error', async () => {
      const mockRequest = {
        formData: jest.fn().mockRejectedValue(new Error('Server error')),
      } as unknown as NextRequest

      const response = await POST(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toEqual({
        error: 'Internal server error',
      })
    })
  })
})
