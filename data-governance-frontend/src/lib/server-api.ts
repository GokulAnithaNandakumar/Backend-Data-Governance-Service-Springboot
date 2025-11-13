import type { UserProfile, UserPost, UserPreferences } from '@/types/api'

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8080/api/v1'

// Server-side API functions for SSR
async function serverApiRequest(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`

  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    if (!response.ok) {
      console.error(`API Error ${response.status}: ${response.statusText}`)
      return null
    }

    if (response.status === 204) {
      return null
    }

    return response.json()
  } catch (error) {
    console.error(`Failed to fetch ${endpoint}:`, error)
    return null
  }
}

// Server-side data fetching functions for SSR
export async function getUsers(options: { revalidate?: number | false } = {}): Promise<UserProfile[]> {
  const users = await serverApiRequest('/users', {
    next: {
      revalidate: options.revalidate ?? 60, // Revalidate every 60 seconds by default
      tags: ['users']
    },
  })

  return users || []
}

export async function getUser(userId: string, options: { revalidate?: number | false } = {}): Promise<UserProfile | null> {
  const user = await serverApiRequest(`/users/${userId}`, {
    next: {
      revalidate: options.revalidate ?? 300, // Revalidate every 5 minutes for individual users
      tags: [`user-${userId}`]
    },
  })

  return user
}

export async function getUserPosts(userId: string, options: { revalidate?: number | false } = {}): Promise<UserPost[]> {
  const posts = await serverApiRequest(`/users/${userId}/posts`, {
    next: {
      revalidate: options.revalidate ?? 30, // Posts change more frequently
      tags: [`user-${userId}-posts`]
    },
  })

  return posts || []
}

export async function getUserPreferences(userId: string, options: { revalidate?: number | false } = {}): Promise<UserPreferences | null> {
  const preferences = await serverApiRequest(`/users/${userId}/preferences`, {
    next: {
      revalidate: options.revalidate ?? 300, // Preferences don't change often
      tags: [`user-${userId}-preferences`]
    },
  })

  return preferences
}

export async function getAllPosts(options: { revalidate?: number | false } = {}): Promise<UserPost[]> {
  const posts = await serverApiRequest('/posts', {
    next: {
      revalidate: options.revalidate ?? 30, // Posts change frequently
      tags: ['posts']
    },
  })

  return posts || []
}

export async function getAllPreferences(options: { revalidate?: number | false } = {}): Promise<UserPreferences[]> {
  const preferences = await serverApiRequest('/preferences', {
    next: {
      revalidate: options.revalidate ?? 300, // Preferences don't change often
      tags: ['preferences']
    },
  })

  return preferences || []
}

export async function getSystemStats(options: { revalidate?: number | false } = {}) {
  const stats = await serverApiRequest('/statistics', {
    next: {
      revalidate: options.revalidate ?? 60, // System stats update moderately
      tags: ['stats']
    },
  })

  return stats || {
    totalUsers: 0,
    totalPosts: 0,
    totalPreferences: 0,
    systemHealth: 'Unknown'
  }
}

// Fresh data fetchers (no-store) for real-time data
export async function getFreshUsers(): Promise<UserProfile[]> {
  return getUsers({ revalidate: false })
}

export async function getFreshUser(userId: string): Promise<UserProfile | null> {
  return getUser(userId, { revalidate: false })
}

// Cached data fetchers for stable data
export async function getCachedUsers(): Promise<UserProfile[]> {
  return getUsers({ revalidate: 3600 }) // Cache for 1 hour
}

export async function getCachedSystemStats() {
  return getSystemStats({ revalidate: 300 }) // Cache for 5 minutes
}