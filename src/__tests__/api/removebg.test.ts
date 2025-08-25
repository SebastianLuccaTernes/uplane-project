import { POST, GET } from '@/app/api/removebg/route'
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

// Mock sharp
jest.mock('sharp', () => {
  const mockSharp = jest.fn(() => ({
    flop: jest.fn().mockReturnThis(),
    png: jest.fn().mockReturnThis(),
    toBuffer: jest.fn().mockResolvedValue(Buffer.from('flipped-image-data')),
  }))
  return mockSharp
})

// Mock global fetch for remove.bg API
global.fetch = jest.fn()

describe('/api/removebg route', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    delete process.env.REMOVEBG_API_KEY
  })

  describe('GET', () => {
    it('should return API information', async () => {
      const response = await GET()
      const data = await response.json()

      expect(data).toEqual({
        message: 'RemoveBG API endpoint',
        methods: ['POST'],
        description: 'Upload an image file to remove its background',
      })
    })
  })

  describe('POST', () => {
    it('should return error when no file provided', async () => {
      const mockFormData = {
        get: jest.fn().mockImplementation((key) => {
          if (key === 'image') return null
          if (key === 'flip') return 'false'
          return null
        }),
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

    it('should return error for non-image file', async () => {
      const mockFile = {
        name: 'test.txt',
        type: 'text/plain',
        size: 1024,
      } as File

      const mockFormData = {
        get: jest.fn().mockImplementation((key) => {
          if (key === 'image') return mockFile
          if (key === 'flip') return 'false'
          return null
        }),
      }

      const mockRequest = {
        formData: jest.fn().mockResolvedValue(mockFormData),
      } as unknown as NextRequest

      const response = await POST(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toEqual({
        error: 'File must be an image',
      })
    })

    it('should return error for file too large', async () => {
      const mockFile = {
        name: 'test.jpg',
        type: 'image/jpeg',
        size: 11 * 1024 * 1024, // 11MB
      } as File

      const mockFormData = {
        get: jest.fn().mockImplementation((key) => {
          if (key === 'image') return mockFile
          if (key === 'flip') return 'false'
          return null
        }),
      }

      const mockRequest = {
        formData: jest.fn().mockResolvedValue(mockFormData),
      } as unknown as NextRequest

      const response = await POST(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toEqual({
        error: 'File size too large. Maximum 10MB allowed.',
      })
    })

    it('should return error when remove.bg API key not configured', async () => {
      const mockFile = {
        name: 'test.jpg',
        type: 'image/jpeg',
        size: 1024,
        arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(1024)),
      } as unknown as File

      const mockFormData = {
        get: jest.fn().mockImplementation((key) => {
          if (key === 'image') return mockFile
          if (key === 'flip') return 'false'
          return null
        }),
      }

      const mockRequest = {
        formData: jest.fn().mockResolvedValue(mockFormData),
      } as unknown as NextRequest

      const response = await POST(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toEqual({
        error: 'Failed to process image',
      })
    })

    it('should successfully process image with remove.bg API', async () => {
      // Set API key
      process.env.REMOVEBG_API_KEY = 'test-api-key'

      const mockFile = {
        name: 'test.jpg',
        type: 'image/jpeg',
        size: 1024,
        arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(1024)),
      } as unknown as File

      const mockFormData = {
        get: jest.fn().mockImplementation((key) => {
          if (key === 'image') return mockFile
          if (key === 'flip') return 'false'
          return null
        }),
      }

      const mockRequest = {
        formData: jest.fn().mockResolvedValue(mockFormData),
      } as unknown as NextRequest

      // Mock successful remove.bg API response
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(2048)),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any)

      const response = await POST(mockRequest)

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.remove.bg/v1.0/removebg',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'X-Api-Key': 'test-api-key',
          },
        })
      )

      // Since we're returning a file response, we can't easily test the exact content
      // But we can verify the fetch was called correctly
      expect(response).toBeDefined()
    })

    it('should handle remove.bg API error', async () => {
      process.env.REMOVEBG_API_KEY = 'test-api-key'

      const mockFile = {
        name: 'test.jpg',
        type: 'image/jpeg',
        size: 1024,
        arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(1024)),
      } as unknown as File

      const mockFormData = {
        get: jest.fn().mockImplementation((key) => {
          if (key === 'image') return mockFile
          if (key === 'flip') return 'false'
          return null
        }),
      }

      const mockRequest = {
        formData: jest.fn().mockResolvedValue(mockFormData),
      } as unknown as NextRequest

      // Mock failed remove.bg API response
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        text: jest.fn().mockResolvedValue('API Error'),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any)

      const response = await POST(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toEqual({
        error: 'Failed to process image',
      })
    })

    it('should apply flip when requested', async () => {
      process.env.REMOVEBG_API_KEY = 'test-api-key'

      const mockFile = {
        name: 'test.jpg',
        type: 'image/jpeg',
        size: 1024,
        arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(1024)),
      } as unknown as File

      const mockFormData = {
        get: jest.fn().mockImplementation((key) => {
          if (key === 'image') return mockFile
          if (key === 'flip') return 'true'
          return null
        }),
      }

      const mockRequest = {
        formData: jest.fn().mockResolvedValue(mockFormData),
      } as unknown as NextRequest

      // Mock successful remove.bg API response
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(2048)),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any)

      // Import the mocked sharp module
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const sharp = require('sharp') as jest.MockedFunction<typeof import('sharp')>
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const _response = await POST(mockRequest)

      // Verify sharp was called for flipping
      expect(sharp).toHaveBeenCalled()
      const sharpInstance = sharp.mock.results[0].value
      expect(sharpInstance.flop).toHaveBeenCalled()
      expect(sharpInstance.png).toHaveBeenCalledWith({ quality: 100 })
      expect(sharpInstance.toBuffer).toHaveBeenCalled()
    })

    it('should handle general server error', async () => {
      const mockRequest = {
        formData: jest.fn().mockRejectedValue(new Error('Server error')),
      } as unknown as NextRequest

      const response = await POST(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toEqual({
        error: 'Failed to process image',
      })
    })
  })
})
