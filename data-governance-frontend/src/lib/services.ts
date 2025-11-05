import { api } from './api'
import type {
  UserProfile,
  CreateUserRequest,
  UpdateUserRequest,
  UserPreferences,
  UpdateUserPreferencesRequest,
  UserPost,
  CreatePostRequest,
  OperationAcknowledgmentResponse,
} from '@/types/api'

// User Profile API (matching backend endpoints)
export const userProfileApi = {
  async getProfile(userId: string): Promise<UserProfile> {
    const response = await api.get<UserProfile>(`/users/${userId}`)
    return response.data
  },

  async createProfile(data: CreateUserRequest): Promise<UserProfile> {
    const response = await api.post<UserProfile>('/users', data)
    return response.data
  },

  async updateProfile(userId: string, data: UpdateUserRequest): Promise<UserProfile> {
    const response = await api.put<UserProfile>(`/users/${userId}`, data)
    return response.data
  },

  async softDeleteProfile(userId: string): Promise<OperationAcknowledgmentResponse> {
    const response = await api.delete<OperationAcknowledgmentResponse>(`/users/${userId}`)
    return response.data
  },

  async hardDeleteProfile(userId: string): Promise<OperationAcknowledgmentResponse> {
    const response = await api.post<OperationAcknowledgmentResponse>(`/users/${userId}/purge`)
    return response.data
  },

  async getAllUsers(): Promise<UserProfile[]> {
    const response = await api.get<UserProfile[]>('/users')
    return response.data
  },
}

// User Preferences API (matching backend endpoints)
export const userPreferencesApi = {
  async getPreferences(userId: string): Promise<UserPreferences> {
    const response = await api.get<UserPreferences>(`/users/${userId}/preferences`)
    return response.data
  },

  async updatePreferences(
    userId: string,
    data: UpdateUserPreferencesRequest
  ): Promise<UserPreferences> {
    const response = await api.put<UserPreferences>(`/users/${userId}/preferences`, data)
    return response.data
  },
}

// User Posts API (matching backend endpoints)
export const userPostsApi = {
  async createPost(userId: string, data: CreatePostRequest): Promise<UserPost> {
    const response = await api.post<UserPost>(`/users/${userId}/posts`, data)
    return response.data
  },

  async getUserPosts(userId: string): Promise<UserPost[]> {
    const response = await api.get<UserPost[]>(`/users/${userId}/posts`)
    return response.data
  },

  async deletePost(postId: string): Promise<OperationAcknowledgmentResponse> {
    const response = await api.delete<OperationAcknowledgmentResponse>(`/posts/${postId}`)
    return response.data
  },

  async getPostById(postId: string): Promise<UserPost> {
    const response = await api.get<UserPost>(`/posts/${postId}`)
    return response.data
  },

  async getAllPosts(): Promise<UserPost[]> {
    const response = await api.get<UserPost[]>('/posts')
    return response.data
  },
}

// Health Check API
export const healthApi = {
  async checkHealth(): Promise<{ status: string }> {
    const response = await api.get('/actuator/health')
    return response.data
  },
}

// Statistics API (for dashboard data)
export const statisticsApi = {
  async getDashboardStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    totalPosts: number;
    activePosts: number;
  }> {
    // This would need to be implemented in the backend
    // For now, we'll calculate from existing endpoints
    const [users, posts] = await Promise.all([
      userProfileApi.getAllUsers(),
      userPostsApi.getAllPosts()
    ])

    return {
      totalUsers: users.length,
      activeUsers: users.filter(user => !user.deleted).length,
      totalPosts: posts.length,
      activePosts: posts.filter(post => !post.deleted).length,
    }
  },
}