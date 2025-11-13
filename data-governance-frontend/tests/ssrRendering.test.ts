/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react'
import { getUsers, getUser, getUserPosts, getUserPreferences } from '@/lib/server-api'

// Mock the server API functions
jest.mock('@/lib/server-api', () => ({
  getUsers: jest.fn(),
  getUser: jest.fn(),
  getUserPosts: jest.fn(),
  getUserPreferences: jest.fn(),
  getSystemStats: jest.fn(),
}))

// Mock Next.js modules
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  notFound: jest.fn(),
  redirect: jest.fn(),
}))

jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  )
})

const mockGetUsers = getUsers as jest.MockedFunction<typeof getUsers>
const mockGetUser = getUser as jest.MockedFunction<typeof getUser>
const mockGetUserPosts = getUserPosts as jest.MockedFunction<typeof getUserPosts>
const mockGetUserPreferences = getUserPreferences as jest.MockedFunction<typeof getUserPreferences>

describe('SSR Rendering Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Users List Page SSR', () => {
    it('should render users list with server data', async () => {
      const mockUsers = [
        {
          id: '1',
          username: 'johndoe',
          email: 'john@example.com',
          firstName: 'John',
          lastName: 'Doe',
          fullName: 'John Doe',
          roles: ['USER'],
          createdAt: '2023-01-01T00:00:00Z',
          deleted: false,
        },
        {
          id: '2',
          username: 'janedoe',
          email: 'jane@example.com',
          firstName: 'Jane',
          lastName: 'Doe',
          fullName: 'Jane Doe',
          roles: ['ADMIN'],
          createdAt: '2023-01-02T00:00:00Z',
          deleted: false,
        },
      ]

      mockGetUsers.mockResolvedValue(mockUsers)

      // Dynamically import the page component to trigger SSR
      const UsersPage = (await import('@/app/users/page')).default

      // Test that the page can render with server data
      expect(() => {
        render(React.createElement(UsersPage, { searchParams: {} }))
      }).not.toThrow()

      expect(mockGetUsers).toHaveBeenCalled()
    })

    it('should handle empty users list', async () => {
      mockGetUsers.mockResolvedValue([])

      const UsersPage = (await import('@/app/users/page')).default

      expect(() => {
        render(React.createElement(UsersPage, { searchParams: {} }))
      }).not.toThrow()
    })

    it('should handle search params correctly', async () => {
      const mockUsers = [
        {
          id: '1',
          username: 'johndoe',
          email: 'john@example.com',
          firstName: 'John',
          lastName: 'Doe',
          fullName: 'John Doe',
          roles: ['USER'],
          createdAt: '2023-01-01T00:00:00Z',
          deleted: false,
        },
      ]

      mockGetUsers.mockResolvedValue(mockUsers)

      const UsersPage = (await import('@/app/users/page')).default

      expect(() => {
        render(React.createElement(UsersPage, {
          searchParams: { search: 'John', showCreate: 'true' }
        }))
      }).not.toThrow()
    })
  })

  describe('User Detail Page SSR', () => {
    it('should render user detail with server data', async () => {
      const mockUser = {
        id: '1',
        username: 'johndoe',
        email: 'john@example.com',
        firstName: 'John',
        lastName: 'Doe',
        fullName: 'John Doe',
        roles: ['USER'],
        bio: 'Test bio',
        createdAt: '2023-01-01T00:00:00Z',
        deleted: false,
      }

      const mockPosts = [
        {
          id: 'post-1',
          userId: '1',
          title: 'Test Post',
          content: 'Test content',
          isPublic: true,
          status: 'PUBLISHED',
          viewCount: 10,
          likeCount: 5,
          commentCount: 2,
          createdAt: '2023-01-01T00:00:00Z',
          deleted: false,
        },
      ]

      const mockPreferences = {
        userId: '1',
        theme: 'light',
        language: 'en',
        notifications: true,
        emailUpdates: false,
        customSettings: { setting1: 'value1' },
        updatedAt: '2023-01-01T00:00:00Z',
      }

      mockGetUser.mockResolvedValue(mockUser)
      mockGetUserPosts.mockResolvedValue(mockPosts)
      mockGetUserPreferences.mockResolvedValue(mockPreferences)

      const UserDetailPage = (await import('@/app/users/[id]/page')).default

      expect(() => {
        render(React.createElement(UserDetailPage, { params: { id: '1' } }))
      }).not.toThrow()

      expect(mockGetUser).toHaveBeenCalledWith('1')
      expect(mockGetUserPosts).toHaveBeenCalledWith('1')
      expect(mockGetUserPreferences).toHaveBeenCalledWith('1')
    })

    it('should handle user not found', async () => {
      mockGetUser.mockResolvedValue(null)
      mockGetUserPosts.mockResolvedValue([])
      mockGetUserPreferences.mockResolvedValue(null)

      const UserDetailPage = (await import('@/app/users/[id]/page')).default

      // Should trigger not found behavior
      expect(() => {
        render(React.createElement(UserDetailPage, { params: { id: 'nonexistent' } }))
      }).not.toThrow()

      expect(mockGetUser).toHaveBeenCalledWith('nonexistent')
    })

    it('should handle user with no posts or preferences', async () => {
      const mockUser = {
        id: '1',
        username: 'johndoe',
        email: 'john@example.com',
        firstName: 'John',
        lastName: 'Doe',
        fullName: 'John Doe',
        roles: ['USER'],
        createdAt: '2023-01-01T00:00:00Z',
        deleted: false,
      }

      mockGetUser.mockResolvedValue(mockUser)
      mockGetUserPosts.mockResolvedValue([])
      mockGetUserPreferences.mockResolvedValue(null)

      const UserDetailPage = (await import('@/app/users/[id]/page')).default

      expect(() => {
        render(React.createElement(UserDetailPage, { params: { id: '1' } }))
      }).not.toThrow()
    })
  })

  describe('Server API Functions', () => {
    beforeEach(() => {
      global.fetch = jest.fn()
    })

    afterEach(() => {
      jest.resetAllMocks()
    })

    it('should fetch users with proper caching', async () => {
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
      const mockUsers = [{ id: '1', username: 'test' }]

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockUsers,
      } as Response)

      // Test the actual server API function
      const { getUsers: actualGetUsers } = await import('@/lib/server-api')
      const result = await actualGetUsers()

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/v1/users',
        expect.objectContaining({
          next: expect.objectContaining({
            revalidate: 60,
            tags: ['users'],
          }),
        })
      )
      expect(result).toEqual(mockUsers)
    })

    it('should handle API errors gracefully', async () => {
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>

      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      } as Response)

      const { getUsers: actualGetUsers } = await import('@/lib/server-api')
      const result = await actualGetUsers()

      expect(result).toEqual([])
    })

    it('should handle network errors gracefully', async () => {
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>

      mockFetch.mockRejectedValue(new Error('Network error'))

      const { getUsers: actualGetUsers } = await import('@/lib/server-api')
      const result = await actualGetUsers()

      expect(result).toEqual([])
    })

    it('should use different cache settings for different data types', async () => {
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ id: '1' }),
      } as Response)

      const { getUser: actualGetUser, getUserPosts: actualGetUserPosts } = await import('@/lib/server-api')

      await actualGetUser('1')
      expect(mockFetch).toHaveBeenLastCalledWith(
        'http://localhost:8080/api/v1/users/1',
        expect.objectContaining({
          next: expect.objectContaining({
            revalidate: 300, // 5 minutes for individual users
          }),
        })
      )

      await actualGetUserPosts('1')
      expect(mockFetch).toHaveBeenLastCalledWith(
        'http://localhost:8080/api/v1/users/1/posts',
        expect.objectContaining({
          next: expect.objectContaining({
            revalidate: 30, // 30 seconds for posts
          }),
        })
      )
    })
  })

  describe('Metadata Generation', () => {
    it('should generate proper metadata for users page', async () => {
      mockGetUsers.mockResolvedValue([
        { id: '1', username: 'test1' },
        { id: '2', username: 'test2' },
      ] as any)

      const { generateMetadata } = await import('@/app/users/page')
      const metadata = await generateMetadata()

      expect(metadata.title).toContain('2 Users')
      expect(metadata.description).toContain('Manage user profiles')
    })

    it('should generate proper metadata for user detail page', async () => {
      const mockUser = {
        id: '1',
        fullName: 'John Doe',
      }

      mockGetUser.mockResolvedValue(mockUser as any)

      const { generateMetadata } = await import('@/app/users/[id]/page')
      const metadata = await generateMetadata({ params: { id: '1' } })

      expect(metadata.title).toContain('John Doe')
      expect(metadata.description).toContain("John Doe's profile")
    })

    it('should handle metadata for non-existent user', async () => {
      mockGetUser.mockResolvedValue(null)

      const { generateMetadata } = await import('@/app/users/[id]/page')
      const metadata = await generateMetadata({ params: { id: 'nonexistent' } })

      expect(metadata.title).toContain('User Not Found')
    })
  })
})