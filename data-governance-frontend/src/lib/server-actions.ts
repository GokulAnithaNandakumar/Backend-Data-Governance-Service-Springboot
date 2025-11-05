import { UserProfile, UserPost, UserPreferences } from '@/types/api'

// Use absolute URL for server-side fetching
const API_BASE_URL = 'http://localhost:8080/api/v1'

// Server-side data fetching functions
export async function getUsers(): Promise<UserProfile[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/users`, {
      cache: 'no-store', // Ensure fresh data on each request
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch users: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching users:', error)
    return []
  }
}

export async function getPosts(): Promise<UserPost[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/posts`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch posts: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching posts:', error)
    return []
  }
}

export async function getPreferences(): Promise<UserPreferences[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/preferences`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      // If endpoint doesn't exist, return empty array
      console.warn('Preferences endpoint not available, returning empty array')
      return []
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching preferences:', error)
    return []
  }
}

export async function getSystemStats() {
  try {
    const response = await fetch(`${API_BASE_URL}/statistics`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      // If endpoint doesn't exist, return default stats
      console.warn('Statistics endpoint not available, returning default stats')
      return {
        totalUsers: 0,
        totalPosts: 0,
        totalPreferences: 0,
        systemHealth: 'Unknown'
      }
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching statistics:', error)
    return {
      totalUsers: 0,
      totalPosts: 0,
      totalPreferences: 0,
      systemHealth: 'Unknown'
    }
  }
}