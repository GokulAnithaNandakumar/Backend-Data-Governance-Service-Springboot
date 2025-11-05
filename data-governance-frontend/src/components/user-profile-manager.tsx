'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Search, Trash2, Edit, User, UserX } from 'lucide-react'
import toast from 'react-hot-toast'
import { userProfileApi } from '@/lib/services'
import type { CreateUserRequest, UpdateUserRequest, UserRole, UserProfile } from '@/types/api'

const createUserSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  roles: z.array(z.enum(['USER', 'ADMIN', 'MODERATOR'])).min(1, 'At least one role is required'),
})

interface UserProfileManagerProps {
  initialUsers?: UserProfile[]
}

export function UserProfileManager({ initialUsers = [] }: UserProfileManagerProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)

  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateUserRequest>({
    resolver: zodResolver(createUserSchema),
  })

  // Get all users from API
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => userProfileApi.getAllUsers(),
    initialData: initialUsers,
  })

  const { data: selectedUser, isLoading: userLoading } = useQuery({
    queryKey: ['user-profile', selectedUserId],
    queryFn: () => userProfileApi.getProfile(selectedUserId!),
    enabled: !!selectedUserId,
  })

  const createUserMutation = useMutation({
    mutationFn: userProfileApi.createProfile,
    onSuccess: () => {
      toast.success('User profile created successfully!')
      setShowCreateForm(false)
      reset()
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create user profile')
    },
  })

  const deleteUserMutation = useMutation({
    mutationFn: userProfileApi.softDeleteProfile,
    onSuccess: () => {
      toast.success('User profile soft deleted successfully!')
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete user profile')
    },
  })

  const hardDeleteUserMutation = useMutation({
    mutationFn: userProfileApi.hardDeleteProfile,
    onSuccess: () => {
      toast.success('User profile permanently deleted!')
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to permanently delete user profile')
    },
  })

  const onSubmit = (data: CreateUserRequest) => {
    createUserMutation.mutate(data)
  }

  const filteredUsers = users?.filter(
    (user) =>
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Profiles</h2>
          <p className="mt-1 text-sm text-gray-600">
            Manage user profiles and account information
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create User
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Search users..."
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users List */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Users ({filteredUsers.length})
            </h3>
          </div>
          {usersLoading ? (
            <div className="p-6 text-center">
              <div className="text-sm text-gray-500">Loading users...</div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-6 text-center">
              <User className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? 'Try adjusting your search criteria.' : 'No users have been created yet.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
              <div
                key={user.id}
                className={`p-6 border-l-4 ${
                  selectedUserId === user.id ? 'bg-blue-50 border-l-blue-500' :
                  user.deleted ? 'bg-gray-100 border-l-gray-400 opacity-75 cursor-not-allowed' : 'hover:bg-gray-50 cursor-pointer border-l-transparent'
                }`}
                onClick={() => {
                  if (!user.deleted) {
                    setSelectedUserId(user.id)
                  }
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                        user.deleted ? 'bg-gray-300' : 'bg-gray-300'
                      }`}>
                        {user.deleted ? (
                          <UserX className="h-6 w-6 text-gray-600" />
                        ) : (
                          <User className="h-6 w-6 text-gray-600" />
                        )}
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className={`text-sm font-medium ${user.deleted ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                        {user.firstName} {user.lastName}
                        {user.deleted && <span className="ml-2 text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">DELETED</span>}
                      </div>
                      <div className={`text-sm ${user.deleted ? 'text-gray-400' : 'text-gray-500'}`}>{user.email}</div>
                      <div className={`text-xs ${user.deleted ? 'text-gray-400' : 'text-gray-400'}`}>Username: {user.username}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.deleted ? 'bg-gray-100 text-gray-500' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {user.roles.join(', ')}
                    </span>
                    {!user.deleted ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          if (confirm('Are you sure you want to soft delete this user? This action can be reversed.')) {
                            deleteUserMutation.mutate(user.id)
                          }
                        }}
                        disabled={deleteUserMutation.isPending}
                        className="text-yellow-500 hover:text-yellow-700 disabled:opacity-50"
                        title="Soft Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          if (confirm('Are you sure you want to permanently delete this user? This action CANNOT be reversed!')) {
                            hardDeleteUserMutation.mutate(user.id)
                          }
                        }}
                        disabled={hardDeleteUserMutation.isPending}
                        className="text-red-600 hover:text-red-800 disabled:opacity-50"
                        title="Hard Delete (Permanent)"
                      >
                        <UserX className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            </div>
          )}
        </div>

        {/* User Details or Create Form */}
        <div className="bg-white shadow rounded-lg">
          {showCreateForm ? (
            <div>
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Create New User</h3>
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
                  <label className="block text-sm font-medium text-gray-700">Username</label>
                  <input
                    {...register('username')}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., john.doe"
                  />
                  {errors.username && (
                    <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    {...register('email')}
                    type="email"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="john@example.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">First Name</label>
                    <input
                      {...register('firstName')}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="John"
                    />
                    {errors.firstName && (
                      <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Last Name</label>
                    <input
                      {...register('lastName')}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Doe"
                    />
                    {errors.lastName && (
                      <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Roles</label>
                  <div className="mt-2 space-y-2">
                    {['USER', 'ADMIN', 'MODERATOR'].map((role) => (
                      <label key={role} className="inline-flex items-center mr-4">
                        <input
                          type="checkbox"
                          {...register('roles')}
                          value={role}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">{role}</span>
                      </label>
                    ))}
                  </div>
                  {errors.roles && (
                    <p className="mt-1 text-sm text-red-600">{errors.roles.message}</p>
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
                    disabled={createUserMutation.isPending}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                  >
                    {createUserMutation.isPending ? 'Creating...' : 'Create User'}
                  </button>
                </div>
              </form>
            </div>
          ) : selectedUserId ? (
            <div>
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">User Details</h3>
              </div>
              <div className="p-6">
                {userLoading ? (
                  <div className="text-center">Loading user details...</div>
                ) : selectedUser ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500">User ID</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedUser.username}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Email</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedUser.email}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500">First Name</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedUser.firstName}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Last Name</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedUser.lastName}</p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Roles</label>
                      <div className="mt-1 flex space-x-2">
                        {selectedUser.roles.map((role) => (
                          <span
                            key={role}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {role}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Created At</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {new Date(selectedUser.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500">Failed to load user details</div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <User className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No user selected</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Select a user from the list to view details
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}