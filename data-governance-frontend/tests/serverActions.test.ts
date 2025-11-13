/**
 * @jest-environment node
 */

import { createUser, updateUser, softDeleteUser, updateUserStatus } from '@/actions/userActions'
import { UserRole } from '@/types/api'

// Mock fetch for testing
global.fetch = jest.fn()

const mockFetch = fetch as jest.MockedFunction<typeof fetch>

describe('Server Actions', () => {
  beforeEach(() => {
    mockFetch.mockClear()
    // Mock successful API responses by default
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ id: '1', username: 'test' }),
    } as Response)
  })

  describe('createUser', () => {
    it('should validate required fields', async () => {
      const formData = new FormData()
      // Missing required fields

      const result = await createUser(formData)

      expect(result.success).toBe(false)
      expect(result.message).toContain('required')
    })

    it('should validate email format', async () => {
      const formData = new FormData()
      formData.set('username', 'testuser')
      formData.set('email', 'invalid-email')
      formData.set('firstName', 'John')
      formData.set('lastName', 'Doe')
      formData.append('roles', UserRole.USER)

      const result = await createUser(formData)

      expect(result.success).toBe(false)
      expect(result.message).toContain('Invalid email')
    })

    it('should validate username length', async () => {
      const formData = new FormData()
      formData.set('username', 'ab') // Too short
      formData.set('email', 'test@example.com')
      formData.set('firstName', 'John')
      formData.set('lastName', 'Doe')
      formData.append('roles', UserRole.USER)

      const result = await createUser(formData)

      expect(result.success).toBe(false)
      expect(result.message).toContain('at least 3 characters')
    })

    it('should require at least one role', async () => {
      const formData = new FormData()
      formData.set('username', 'testuser')
      formData.set('email', 'test@example.com')
      formData.set('firstName', 'John')
      formData.set('lastName', 'Doe')
      // No roles added

      const result = await createUser(formData)

      expect(result.success).toBe(false)
      expect(result.message).toContain('At least one role is required')
    })

    it('should create user with valid data', async () => {
      const formData = new FormData()
      formData.set('username', 'testuser')
      formData.set('email', 'test@example.com')
      formData.set('firstName', 'John')
      formData.set('lastName', 'Doe')
      formData.append('roles', UserRole.USER)
      formData.set('bio', 'Test bio')

      const result = await createUser(formData)

      expect(result.success).toBe(true)
      expect(result.message).toContain('successfully')
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/v1/users',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('testuser'),
        })
      )
    })

    it('should handle API errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: async () => 'User already exists',
      } as Response)

      const formData = new FormData()
      formData.set('username', 'testuser')
      formData.set('email', 'test@example.com')
      formData.set('firstName', 'John')
      formData.set('lastName', 'Doe')
      formData.append('roles', UserRole.USER)

      const result = await createUser(formData)

      expect(result.success).toBe(false)
      expect(result.message).toContain('API Error 400')
    })

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      const formData = new FormData()
      formData.set('username', 'testuser')
      formData.set('email', 'test@example.com')
      formData.set('firstName', 'John')
      formData.set('lastName', 'Doe')
      formData.append('roles', UserRole.USER)

      const result = await createUser(formData)

      expect(result.success).toBe(false)
      expect(result.message).toContain('Network error')
    })
  })

  describe('updateUser', () => {
    it('should update user with valid data', async () => {
      const formData = new FormData()
      formData.set('firstName', 'Jane')
      formData.set('lastName', 'Smith')

      const result = await updateUser('user-123', formData)

      expect(result.success).toBe(true)
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/v1/users/user-123',
        expect.objectContaining({
          method: 'PUT',
          body: expect.stringContaining('Jane'),
        })
      )
    })

    it('should handle empty values', async () => {
      const formData = new FormData()
      formData.set('firstName', '')
      formData.set('lastName', 'Smith')
      formData.append('roles', UserRole.ADMIN)

      const result = await updateUser('user-123', formData)

      expect(result.success).toBe(true)
      // Should not include empty firstName in request
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/v1/users/user-123',
        expect.objectContaining({
          method: 'PUT',
          body: expect.not.stringContaining('firstName'),
        })
      )
    })
  })

  describe('updateUserStatus', () => {
    it('should validate status values', async () => {
      const result = await updateUserStatus('user-123', 'invalid' as any)

      expect(result.success).toBe(false)
      expect(result.message).toContain('Invalid')
    })

    it('should update status to active', async () => {
      const result = await updateUserStatus('user-123', 'active')

      expect(result.success).toBe(true)
      expect(result.message).toContain('activated')
    })

    it('should update status to inactive', async () => {
      const result = await updateUserStatus('user-123', 'inactive')

      expect(result.success).toBe(true)
      expect(result.message).toContain('deactivated')
    })
  })

  describe('softDeleteUser', () => {
    it('should soft delete user', async () => {
      const result = await softDeleteUser('user-123')

      expect(result.success).toBe(true)
      expect(result.message).toContain('soft deleted')
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/v1/users/user-123',
        expect.objectContaining({
          method: 'DELETE',
        })
      )
    })

    it('should handle delete errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        text: async () => 'User not found',
      } as Response)

      const result = await softDeleteUser('user-123')

      expect(result.success).toBe(false)
      expect(result.message).toContain('API Error 404')
    })
  })
})

describe('Server Action Input Validation', () => {
  it('should validate profile image URLs', async () => {
    const formData = new FormData()
    formData.set('username', 'testuser')
    formData.set('email', 'test@example.com')
    formData.set('firstName', 'John')
    formData.set('lastName', 'Doe')
    formData.append('roles', UserRole.USER)
    formData.set('profileImageUrl', 'not-a-url')

    const result = await createUser(formData)

    expect(result.success).toBe(false)
    expect(result.message).toContain('Invalid')
  })

  it('should accept empty profile image URLs', async () => {
    const formData = new FormData()
    formData.set('username', 'testuser')
    formData.set('email', 'test@example.com')
    formData.set('firstName', 'John')
    formData.set('lastName', 'Doe')
    formData.append('roles', UserRole.USER)
    formData.set('profileImageUrl', '')

    const result = await createUser(formData)

    expect(result.success).toBe(true)
  })

  it('should accept valid profile image URLs', async () => {
    const formData = new FormData()
    formData.set('username', 'testuser')
    formData.set('email', 'test@example.com')
    formData.set('firstName', 'John')
    formData.set('lastName', 'Doe')
    formData.append('roles', UserRole.USER)
    formData.set('profileImageUrl', 'https://example.com/image.jpg')

    const result = await createUser(formData)

    expect(result.success).toBe(true)
  })
})