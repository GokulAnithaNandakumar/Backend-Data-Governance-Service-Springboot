'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import type {
  UserProfile,
  CreateUserRequest,
  UpdateUserRequest,
  UserRole,
  OperationAcknowledgmentResponse
} from '@/types/api'

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8080/api/v1'

// Validation schemas
const createUserSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  roles: z.array(z.enum(['USER', 'ADMIN', 'MODERATOR'])).min(1, 'At least one role is required'),
  bio: z.string().optional(),
  profileImageUrl: z.string().url().optional().or(z.literal('')),
})

const updateUserSchema = z.object({
  firstName: z.string().min(1, 'First name is required').optional(),
  lastName: z.string().min(1, 'Last name is required').optional(),
  roles: z.array(z.enum(['USER', 'ADMIN', 'MODERATOR'])).min(1, 'At least one role is required').optional(),
  bio: z.string().optional(),
  profileImageUrl: z.string().url().optional().or(z.literal('')),
})

const updateStatusSchema = z.object({
  status: z.enum(['active', 'inactive']),
})

// Server-side API functions
async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`API Error ${response.status}: ${error}`)
  }

  if (response.status === 204) {
    return null
  }

  return response.json()
}

// Server Actions
export async function createUser(formData: FormData) {
  try {
    const rawData = {
      username: formData.get('username') as string,
      email: formData.get('email') as string,
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      roles: formData.getAll('roles') as UserRole[],
      bio: formData.get('bio') as string,
      profileImageUrl: formData.get('profileImageUrl') as string,
    }

    // Server-side validation
    const validatedData = createUserSchema.parse(rawData)

    await apiRequest('/users', {
      method: 'POST',
      body: JSON.stringify(validatedData),
    })

    // Revalidate the users list cache
    revalidatePath('/users')

    return { success: true, message: 'User created successfully!' }
  } catch (error) {
    console.error('Create user error:', error)
    return {
      success: false,
      message: error instanceof z.ZodError
        ? error.errors.map(e => e.message).join(', ')
        : error instanceof Error
        ? error.message
        : 'Failed to create user'
    }
  }
}

export async function updateUser(userId: string, formData: FormData) {
  try {
    const rawData = {
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      roles: formData.getAll('roles') as UserRole[],
      bio: formData.get('bio') as string,
      profileImageUrl: formData.get('profileImageUrl') as string,
    }

    // Remove empty values
    const cleanData = Object.fromEntries(
      Object.entries(rawData).filter(([_, value]) =>
        value !== null && value !== undefined && value !== ''
      )
    )

    // Server-side validation
    const validatedData = updateUserSchema.parse(cleanData)

    await apiRequest(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(validatedData),
    })

    // Revalidate both users list and specific user page
    revalidatePath('/users')
    revalidatePath(`/users/${userId}`)

    return { success: true, message: 'User updated successfully!' }
  } catch (error) {
    console.error('Update user error:', error)
    return {
      success: false,
      message: error instanceof z.ZodError
        ? error.errors.map(e => e.message).join(', ')
        : error instanceof Error
        ? error.message
        : 'Failed to update user'
    }
  }
}

export async function updateUserStatus(userId: string, status: 'active' | 'inactive') {
  try {
    // Server-side validation
    const validatedData = updateStatusSchema.parse({ status })

    // For this action, we'll update user status by setting appropriate fields
    // This depends on your backend implementation
    await apiRequest(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify({
        // Assuming status maps to some field in your backend
        // Adjust based on your actual backend implementation
        active: status === 'active',
      }),
    })

    // Revalidate both users list and specific user page
    revalidatePath('/users')
    revalidatePath(`/users/${userId}`)

    return { success: true, message: `User ${status === 'active' ? 'activated' : 'deactivated'} successfully!` }
  } catch (error) {
    console.error('Update user status error:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to update user status'
    }
  }
}

export async function softDeleteUser(userId: string) {
  try {
    await apiRequest(`/users/${userId}`, {
      method: 'DELETE',
    })

    // Revalidate the users list cache
    revalidatePath('/users')

    return { success: true, message: 'User soft deleted successfully!' }
  } catch (error) {
    console.error('Soft delete user error:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to delete user'
    }
  }
}

export async function hardDeleteUser(userId: string) {
  try {
    await apiRequest(`/users/${userId}/purge`, {
      method: 'POST',
    })

    // Revalidate the users list cache
    revalidatePath('/users')

    return { success: true, message: 'User permanently deleted!' }
  } catch (error) {
    console.error('Hard delete user error:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to permanently delete user'
    }
  }
}

// Server Actions for form state management
export async function createUserWithState(
  prevState: { success: boolean; message: string } | null,
  formData: FormData
) {
  const result = await createUser(formData)

  if (result.success) {
    redirect('/users')
  }

  return result
}

export async function updateUserWithState(
  userId: string,
  prevState: { success: boolean; message: string } | null,
  formData: FormData
) {
  const result = await updateUser(userId, formData)

  if (result.success) {
    redirect(`/users/${userId}`)
  }

  return result
}

// Server Actions for redirecting after form submission
export async function createUserAndRedirect(formData: FormData) {
  const result = await createUser(formData)

  if (result.success) {
    redirect('/users')
  }

  return result
}

export async function updateUserAndRedirect(userId: string, formData: FormData) {
  const result = await updateUser(userId, formData)

  if (result.success) {
    redirect(`/users/${userId}`)
  }

  return result
}