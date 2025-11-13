// API Types matching Spring Boot backend

export interface UserProfile {
  id: string
  username: string
  email: string
  firstName: string
  lastName: string
  fullName: string
  roles: UserRole[]
  bio?: string
  profileImageUrl?: string
  createdAt: string
  updatedAt?: string
  deleted?: boolean
  deletedAt?: string
}

export interface CreateUserRequest {
  username: string
  email: string
  firstName: string
  lastName: string
  roles: UserRole[]
  bio?: string
  profileImageUrl?: string
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
  emailNotifications: boolean
  pushNotifications: boolean
  smsNotifications: boolean
  profileVisible: boolean
  showEmail: boolean
  showLastSeen: boolean
  contentFilter: string
  customSettings: Record<string, any>
  createdAt: string
  updatedAt: string
  deleted: boolean
}

export interface UpdateUserPreferencesRequest {
  theme?: string
  language?: string
  notifications?: boolean
  emailUpdates?: boolean
  customSettings?: Record<string, any>
}

export interface UserPost {
  id: string
  userId: string
  title: string
  content: string
  imageUrls?: string[]
  tags?: string[]
  isPublic: boolean
  status: string
  viewCount: number
  likeCount: number
  commentCount: number
  createdAt: string
  updatedAt?: string
  deleted?: boolean
  deletedAt?: string
}

export interface CreatePostRequest {
  title: string
  content: string
  imageUrls?: string[]
  tags?: string[]
  isPublic?: boolean
  status?: string
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