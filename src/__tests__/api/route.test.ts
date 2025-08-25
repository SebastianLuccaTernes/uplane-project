import { GET, POST } from '@/app/api/route'
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

describe('/api route', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET', () => {
    it('should return hello world message', async () => {
      const response = await GET()
      const data = await response.json()

      expect(data).toEqual({
        hello: 'world'
      })
    })
  })

  describe('POST', () => {
    it('should return the posted data', async () => {
      const testData = { name: 'test', value: 123 }
      
      // Mock request with json method
      const mockRequest = {
        json: jest.fn().mockResolvedValue(testData)
      } as unknown as Request

      const response = await POST(mockRequest)
      const responseData = await response.json()

      expect(mockRequest.json).toHaveBeenCalledTimes(1)
      expect(responseData).toEqual({
        data: testData
      })
    })

    it('should handle empty request body', async () => {
      const mockRequest = {
        json: jest.fn().mockResolvedValue({})
      } as unknown as Request

      const response = await POST(mockRequest)
      const responseData = await response.json()

      expect(responseData).toEqual({
        data: {}
      })
    })

    it('should handle malformed JSON', async () => {
      const mockRequest = {
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON'))
      } as unknown as Request

      await expect(POST(mockRequest)).rejects.toThrow('Invalid JSON')
    })
  })
})
