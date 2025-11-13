import { Suspense } from 'react'
import { Users, Plus, Search, ArrowLeft } from 'lucide-react'
import { getUsers, getSystemStats } from '@/lib/server-api'
import { UsersList } from '@/components/users-list'
import { CreateUserForm } from '@/components/create-user-form'
import { UsersSearchClient } from '@/components/users-search-client'
import Link from 'next/link'

// This is a Server Component with SSR
export default async function UsersPage({
  searchParams,
}: {
  searchParams: { search?: string; showCreate?: string }
}) {
  // Fetch data on the server
  const [users, stats] = await Promise.all([
    getUsers(), // Uses caching with 60s revalidation
    getSystemStats(),
  ])

  const searchTerm = searchParams.search || ''
  const showCreate = searchParams.showCreate === 'true'

  // Filter users on the server if search term is provided
  const filteredUsers = searchTerm
    ? users.filter(user =>
        user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : users

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          <div className="h-6 border-l border-gray-300" />
          <div className="flex items-center space-x-3">
            <Users className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
              <p className="text-gray-600">
                Manage user profiles, roles, and permissions
              </p>
            </div>
          </div>
        </div>

        <div className="flex space-x-3">
          <Link
            href="/users?showCreate=true"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create User
          </Link>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center">
            <Users className="h-5 w-5 text-blue-500" />
            <span className="ml-2 text-sm font-medium text-gray-600">Total Users</span>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-gray-900">{stats.totalUsers}</span>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center">
            <Users className="h-5 w-5 text-green-500" />
            <span className="ml-2 text-sm font-medium text-gray-600">Active Users</span>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-gray-900">
              {users.filter(u => !u.deleted).length}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center">
            <Users className="h-5 w-5 text-orange-500" />
            <span className="ml-2 text-sm font-medium text-gray-600">Inactive Users</span>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-gray-900">
              {users.filter(u => u.deleted).length}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center">
            <div className={`h-3 w-3 rounded-full ${
              stats.systemHealth === 'UP' ? 'bg-green-500' : 'bg-red-500'
            }`} />
            <span className="ml-2 text-sm font-medium text-gray-600">System Health</span>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-gray-900">{stats.systemHealth}</span>
          </div>
        </div>
      </div>

      {/* Create User Form */}
      {showCreate && (
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Create New User</h2>
          <Suspense fallback={<div>Loading form...</div>}>
            <CreateUserForm />
          </Suspense>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <UsersSearchClient initialSearch={searchTerm} />
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className="bg-white rounded-lg border">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            Users ({filteredUsers.length})
          </h2>
        </div>

        <Suspense fallback={<div className="p-6">Loading users...</div>}>
          <UsersList users={filteredUsers} />
        </Suspense>
      </div>
    </div>
  )
}

// Generate metadata for SEO
export async function generateMetadata() {
  const users = await getUsers()

  return {
    title: `User Management - ${users.length} Users | Data Governance`,
    description: 'Manage user profiles, roles, and permissions in the Data Governance console.',
  }
}