// API Types matching Spring Boot backend

export interface UserProfile {
  userId: string
  email: string
  firstName: string
  lastName: string
  roles: UserRole[]
  createdAt: string
  updatedAt?: string
  deleted: boolean
  deletedAt?: string
}

export interface CreateUserRequest {
  userId: string
  email: string
  firstName: string
  lastName: string
  roles: UserRole[]
}

export interface UpdateUserRequest {
  firstName?: string
  lastName?: string
  roles?: UserRole[]
}

export interface UserPreferences {
  userId: string
  theme: string
  language: string
  notifications: boolean
  emailUpdates: boolean
  customSettings: Record<string, any>
  updatedAt: string
}

export interface UpdateUserPreferencesRequest {
  theme?: string
  language?: string
  notifications?: boolean
  emailUpdates?: boolean
  customSettings?: Record<string, any>
}

export interface UserPost {
  postId: string
  authorId: string
  title: string
  content: string
  createdAt: string
  updatedAt?: string
  deleted: boolean
  deletedAt?: string
}

export interface CreatePostRequest {
  authorId: string
  title: string
  content: string
}

export interface OperationAcknowledgmentResponse {
  message: string
  timestamp: string
  details: Record<string, any>
}

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR'
}

// API Response Types
export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
}

export interface ApiError {
  message: string
  status: number
  details?: Record<string, any>
}