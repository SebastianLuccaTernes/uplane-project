import '@testing-library/jest-dom'

// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key'
process.env.REMOVEBG_API_KEY = 'test-removebg-key'

// Mock fetch globally
global.fetch = jest.fn()

// Mock FormData
global.FormData = jest.fn(() => ({
  append: jest.fn(),
  get: jest.fn(),
}))

// Mock Blob
global.Blob = jest.fn()

// Mock Buffer.from for file operations
global.Buffer = {
  ...Buffer,
  from: jest.fn(),
}

beforeEach(() => {
  jest.clearAllMocks()
})
