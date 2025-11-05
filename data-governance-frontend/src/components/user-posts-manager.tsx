'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Plus, FileText, Trash2, User, Calendar } from 'lucide-react'
import toast from 'react-hot-toast'
import { userPostsApi, userProfileApi } from '@/lib/services'
import type { CreatePostRequest, UserPost } from '@/types/api'

interface UserPostsManagerProps {
  initialPosts?: UserPost[]
}

export function UserPostsManager({ initialPosts = [] }: UserPostsManagerProps) {
  const [selectedUserId, setSelectedUserId] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)

  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreatePostRequest>()

  // Get all users from API
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => userProfileApi.getAllUsers(),
  })

  // Reset selectedUserId if the selected user is no longer available (soft-deleted)
  useEffect(() => {
    if (selectedUserId && users) {
      const activeUsers = users.filter(user => !user.deleted)
      const isSelectedUserActive = activeUsers.some(user => user.id === selectedUserId)
      if (!isSelectedUserActive) {
        setSelectedUserId('')
      }
    }
  }, [users, selectedUserId])

  const { data: allPosts, isLoading: allPostsLoading } = useQuery({
    queryKey: ['posts'],
    queryFn: () => userPostsApi.getAllPosts(),
    initialData: initialPosts,
  })

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
    createPostMutation.mutate(data)
  }

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
        {usersLoading ? (
          <div className="text-sm text-gray-500">Loading users...</div>
        ) : (
          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="block w-full max-w-xs border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select a user</option>
            {users?.filter(user => !user.deleted).map((user) => (
              <option key={user.id} value={user.id}>
                {user.firstName} {user.lastName} ({user.username})
              </option>
            ))}
          </select>
        )}
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
            Posts by {selectedUserId} ({userPosts?.length || 0})
          </h3>
        </div>

        {postsLoading ? (
          <div className="p-6 text-center">Loading posts...</div>
        ) : !userPosts || userPosts.length === 0 ? (
          <div className="p-6 text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No posts found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {selectedUserId ? "This user hasn't created any posts yet." : "Select a user to view their posts."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {userPosts.map((post) => (
              <div key={post.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="text-lg font-medium text-gray-900">{post.title}</h4>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {post.status}
                      </span>
                    </div>

                    <p className="text-gray-700 mb-4 line-clamp-3">{post.content}</p>

                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        {post.userId}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(post.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-400">
                        ID: {post.id}
                      </div>
                    </div>
                  </div>

                  <div className="ml-4 flex items-center space-x-2">
                    <button
                      onClick={() => deletePostMutation.mutate(post.id)}
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
                  {userPosts?.length || 0}
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
                  {userPosts?.filter(p => p.status === 'PUBLISHED').length || 0}
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
                  {userPosts && userPosts.length > 0
                    ? new Date(Math.max(...userPosts.map(p => new Date(p.createdAt).getTime()))).toLocaleDateString()
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