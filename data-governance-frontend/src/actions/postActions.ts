'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8080/api/v1'

// Validation schemas
const createPostSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  content: z.string().min(1, 'Content is required').max(5000, 'Content too long'),
  isPublic: z.boolean().default(true),
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
export async function createPost(userId: string, formData: FormData) {
  try {
    const rawData = {
      title: formData.get('title') as string,
      content: formData.get('content') as string,
      isPublic: formData.get('isPublic') === 'true',
    }

    // Server-side validation
    const validatedData = createPostSchema.parse(rawData)

    await apiRequest(`/users/${userId}/posts`, {
      method: 'POST',
      body: JSON.stringify(validatedData),
    })

    // Revalidate the user page and posts
    revalidatePath(`/users/${userId}`)
    revalidatePath('/users')

    return { success: true, message: 'Post created successfully!' }
  } catch (error) {
    console.error('Create post error:', error)
    return {
      success: false,
      message: error instanceof z.ZodError
        ? error.errors.map(e => e.message).join(', ')
        : error instanceof Error
        ? error.message
        : 'Failed to create post'
    }
  }
}

export async function deletePost(userId: string, postId: string) {
  try {
    await apiRequest(`/users/${userId}/posts/${postId}`, {
      method: 'DELETE',
    })

    // Revalidate the user page and posts
    revalidatePath(`/users/${userId}`)
    revalidatePath('/users')

    return { success: true, message: 'Post deleted successfully!' }
  } catch (error) {
    console.error('Delete post error:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to delete post'
    }
  }
}

export async function updatePost(userId: string, postId: string, formData: FormData) {
  try {
    const rawData = {
      title: formData.get('title') as string,
      content: formData.get('content') as string,
      isPublic: formData.get('isPublic') === 'true',
    }

    // Server-side validation
    const validatedData = createPostSchema.parse(rawData)

    await apiRequest(`/users/${userId}/posts/${postId}`, {
      method: 'PUT',
      body: JSON.stringify(validatedData),
    })

    // Revalidate the user page and posts
    revalidatePath(`/users/${userId}`)
    revalidatePath('/users')

    return { success: true, message: 'Post updated successfully!' }
  } catch (error) {
    console.error('Update post error:', error)
    return {
      success: false,
      message: error instanceof z.ZodError
        ? error.errors.map(e => e.message).join(', ')
        : error instanceof Error
        ? error.message
        : 'Failed to update post'
    }
  }
}