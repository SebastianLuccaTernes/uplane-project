import { DELETE } from '@/app/api/delete/[id]/route'
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

describe('/api/delete/[id] route', () => {
  const mockSupabaseAdmin = require('@/lib/supabase').supabaseAdmin

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('DELETE', () => {
    it('should successfully delete an image', async () => {
      const mockParams = Promise.resolve({ id: '123' })
      const mockRequest = {} as NextRequest

      // Mock database responses
      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { storage_path: 'processed/test-image.jpg' },
            error: null,
          }),
        }),
      })

      const mockDelete = jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      })

      mockSupabaseAdmin.from.mockImplementation((table: string) => {
        if (table === 'processed_images') {
          return {
            select: mockSelect,
            delete: mockDelete,
          }
        }
      })

      mockSupabaseAdmin.storage.from.mockReturnValue({
        remove: jest.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      })

      const response = await DELETE(mockRequest, { params: mockParams })
      const data = await response.json()

      expect(data).toEqual({
        success: true,
        message: 'Image deleted successfully',
      })

      // Verify the correct sequence of operations
      expect(mockSupabaseAdmin.from).toHaveBeenCalledWith('processed_images')
      expect(mockSelect().eq).toHaveBeenCalledWith('id', '123')
      expect(mockSupabaseAdmin.storage.from).toHaveBeenCalledWith('processed-images')
      expect(mockDelete().eq).toHaveBeenCalledWith('id', '123')
    })

    it('should return 404 when image not found', async () => {
      const mockParams = Promise.resolve({ id: '999' })
      const mockRequest = {} as NextRequest

      mockSupabaseAdmin.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'No rows found' },
            }),
          }),
        }),
      })

      const response = await DELETE(mockRequest, { params: mockParams })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data).toEqual({
        error: 'Image not found',
      })
    })

    it('should handle database deletion error', async () => {
      const mockParams = Promise.resolve({ id: '123' })
      const mockRequest = {} as NextRequest

      // Mock successful fetch but failed deletion
      mockSupabaseAdmin.from.mockImplementation((table: string) => {
        if (table === 'processed_images') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: { storage_path: 'processed/test-image.jpg' },
                  error: null,
                }),
              }),
            }),
            delete: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({
                data: null,
                error: { message: 'Delete failed' },
              }),
            }),
          }
        }
      })

      mockSupabaseAdmin.storage.from.mockReturnValue({
        remove: jest.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      })

      const response = await DELETE(mockRequest, { params: mockParams })
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toEqual({
        error: 'Failed to delete image metadata',
      })
    })

    it('should continue with database deletion even if storage deletion fails', async () => {
      const mockParams = Promise.resolve({ id: '123' })
      const mockRequest = {} as NextRequest

      mockSupabaseAdmin.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { storage_path: 'processed/test-image.jpg' },
              error: null,
            }),
          }),
        }),
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: null,
            error: null,
          }),
        }),
      })

      // Mock storage deletion error
      mockSupabaseAdmin.storage.from.mockReturnValue({
        remove: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Storage deletion failed' },
        }),
      })

      const response = await DELETE(mockRequest, { params: mockParams })
      const data = await response.json()

      // Should still succeed as storage error is logged but not thrown
      expect(data).toEqual({
        success: true,
        message: 'Image deleted successfully',
      })
    })

    it('should handle general server error', async () => {
      const mockParams = Promise.resolve({ id: '123' })
      const mockRequest = {} as NextRequest

      // Mock params rejection to trigger catch block
      const mockFailingParams = Promise.reject(new Error('Server error'))

      const response = await DELETE(mockRequest, { params: mockFailingParams })
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toEqual({
        error: 'Internal server error',
      })
    })

    it('should handle missing or invalid params', async () => {
      const mockParams = Promise.resolve({ id: '' }) // Empty id
      const mockRequest = {} as NextRequest

      mockSupabaseAdmin.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'No rows found' },
            }),
          }),
        }),
      })

      const response = await DELETE(mockRequest, { params: mockParams })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data).toEqual({
        error: 'Image not found',
      })
    })
  })
})
