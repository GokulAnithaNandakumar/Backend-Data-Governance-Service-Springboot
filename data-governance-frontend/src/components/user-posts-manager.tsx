'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Plus, FileText, Trash2, User, Calendar } from 'lucide-react'
import toast from 'react-hot-toast'
import { userPostsApi } from '@/lib/services'
import type { CreatePostRequest } from '@/types/api'

export function UserPostsManager() {
  const [selectedUserId, setSelectedUserId] = useState('john.doe')
  const [showCreateForm, setShowCreateForm] = useState(false)

  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreatePostRequest>()

  const { data: userPosts, isLoading: postsLoading } = useQuery({
    queryKey: ['user-posts', selectedUserId],
    queryFn: () => userPostsApi.getUserPosts(selectedUserId),
    enabled: !!selectedUserId,
  })

  const createPostMutation = useMutation({
    mutationFn: (data: CreatePostRequest) => userPostsApi.createPost(selectedUserId, data),
    onSuccess: () => {
      toast.success('Post created successfully!')
      setShowCreateForm(false)
      reset()
      queryClient.invalidateQueries({ queryKey: ['user-posts', selectedUserId] })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create post')
    },
  })

  const deletePostMutation = useMutation({
    mutationFn: userPostsApi.deletePost,
    onSuccess: () => {
      toast.success('Post deleted successfully!')
      queryClient.invalidateQueries({ queryKey: ['user-posts', selectedUserId] })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete post')
    },
  })

  const onSubmit = (data: CreatePostRequest) => {
    createPostMutation.mutate({
      ...data,
      authorId: selectedUserId,
    })
  }

  // Sample posts data - in real app, this would come from the API
  const samplePosts = [
    {
      postId: 'post-1',
      authorId: 'john.doe',
      title: 'Welcome to Data Governance',
      content: 'This is an introduction to our data governance platform. We aim to provide comprehensive tools for managing user data effectively.',
      createdAt: '2024-11-01T10:00:00',
      deleted: false,
    },
    {
      postId: 'post-2',
      authorId: 'john.doe',
      title: 'Best Practices for Data Management',
      content: 'Here are some key practices to follow when managing user data: 1. Always validate input, 2. Implement proper access controls, 3. Regular backups...',
      createdAt: '2024-11-02T15:30:00',
      deleted: false,
    },
  ]

  const displayPosts = userPosts || samplePosts

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Posts</h2>
          <p className="mt-1 text-sm text-gray-600">
            Manage user posts and content
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Post
        </button>
      </div>

      {/* User Selection */}
      <div className="bg-white shadow rounded-lg p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Author
        </label>
        <select
          value={selectedUserId}
          onChange={(e) => setSelectedUserId(e.target.value)}
          className="block w-full max-w-xs border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="john.doe">John Doe</option>
          <option value="jane.admin">Jane Admin</option>
        </select>
      </div>

      {/* Create Post Form */}
      {showCreateForm && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Create New Post</h3>
            <button
              onClick={() => {
                setShowCreateForm(false)
                reset()
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                {...register('title', { required: 'Title is required' })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter post title"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Content</label>
              <textarea
                {...register('content', { required: 'Content is required' })}
                rows={6}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Write your post content here..."
              />
              {errors.content && (
                <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false)
                  reset()
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createPostMutation.isPending}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                {createPostMutation.isPending ? 'Creating...' : 'Create Post'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Posts List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Posts by {selectedUserId} ({displayPosts.length})
          </h3>
        </div>

        {postsLoading ? (
          <div className="p-6 text-center">Loading posts...</div>
        ) : displayPosts.length === 0 ? (
          <div className="p-6 text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No posts found</h3>
            <p className="mt-1 text-sm text-gray-500">
              This user hasn't created any posts yet.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {displayPosts.map((post) => (
              <div key={post.postId} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="text-lg font-medium text-gray-900">{post.title}</h4>
                      {!post.deleted && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                      )}
                    </div>

                    <p className="text-gray-700 mb-4 line-clamp-3">{post.content}</p>

                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        {post.authorId}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(post.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-400">
                        ID: {post.postId}
                      </div>
                    </div>
                  </div>

                  <div className="ml-4 flex items-center space-x-2">
                    <button
                      onClick={() => deletePostMutation.mutate(post.postId)}
                      disabled={deletePostMutation.isPending}
                      className="text-red-400 hover:text-red-600 disabled:opacity-50"
                      title="Delete post"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Post Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Total Posts
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {displayPosts.length}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <User className="h-8 w-8 text-green-500" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Active Posts
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {displayPosts.filter(p => !p.deleted).length}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Calendar className="h-8 w-8 text-purple-500" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Latest Post
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {displayPosts.length > 0
                    ? new Date(Math.max(...displayPosts.map(p => new Date(p.createdAt).getTime()))).toLocaleDateString()
                    : 'None'
                  }
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}