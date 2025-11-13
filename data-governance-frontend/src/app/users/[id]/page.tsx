import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { User, Mail, Calendar, Shield, FileText, Settings, ArrowLeft } from 'lucide-react'
import { getUser, getUserPosts, getUserPreferences } from '@/lib/server-api'
import { UserProfileCard } from '@/components/user-profile-card'
import { UserPostsList } from '@/components/user-posts-list'
import { UserPreferencesCard } from '@/components/user-preferences-card'
import { UserActionsBar } from '@/components/user-actions-bar'
import Link from 'next/link'

// This is a Server Component with SSR
export default async function UserDetailPage({
  params,
}: {
  params: { id: string }
}) {
  // Fetch user data on the server - parallel requests for performance
  const [user, posts, preferences] = await Promise.all([
    getUser(params.id),
    getUserPosts(params.id),
    getUserPreferences(params.id),
  ])

  // Handle not found case
  if (!user) {
    notFound()
  }

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/users"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Users
          </Link>
          <div className="h-6 border-l border-gray-300" />
          <div className="flex items-center space-x-3">
            <User className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{user.fullName}</h1>
              <p className="text-gray-600">User Profile Details</p>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <Suspense fallback={<div>Loading actions...</div>}>
          <UserActionsBar user={user} />
        </Suspense>
      </div>

      {/* User Profile Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Profile Card */}
        <div className="lg:col-span-2">
          <Suspense fallback={<div className="bg-white rounded-lg border p-6">Loading profile...</div>}>
            <UserProfileCard user={user} />
          </Suspense>
        </div>

        {/* Quick Stats */}
        <div className="space-y-6">
          {/* Stats Card */}
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-blue-500" />
                  <span className="text-sm text-gray-600">Posts</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{posts.length}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-gray-600">Roles</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{user.roles.length}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-purple-500" />
                  <span className="text-sm text-gray-600">Member Since</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Status Card */}
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Status</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className={`h-3 w-3 rounded-full ${
                  user.deleted ? 'bg-red-500' : 'bg-green-500'
                }`} />
                <span className="text-sm font-medium">
                  {user.deleted ? 'Inactive' : 'Active'}
                </span>
              </div>

              {user.deletedAt && (
                <p className="text-xs text-gray-500">
                  Deactivated on {new Date(user.deletedAt).toLocaleDateString()}
                </p>
              )}

              {user.updatedAt && (
                <p className="text-xs text-gray-500">
                  Last updated {new Date(user.updatedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* User Preferences */}
      {preferences && (
        <div className="bg-white rounded-lg border">
          <div className="p-6 border-b">
            <div className="flex items-center space-x-2">
              <Settings className="h-5 w-5 text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-900">User Preferences</h2>
            </div>
          </div>
          <div className="p-6">
            <Suspense fallback={<div>Loading preferences...</div>}>
              <UserPreferencesCard preferences={preferences} />
            </Suspense>
          </div>
        </div>
      )}

      {/* User Posts */}
      <div className="bg-white rounded-lg border">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-900">
                User Posts ({posts.length})
              </h2>
            </div>
          </div>
        </div>

        <div className="p-6">
          <Suspense fallback={<div>Loading posts...</div>}>
            <UserPostsList posts={posts} userId={user.id} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: { id: string } }) {
  const user = await getUser(params.id)

  if (!user) {
    return {
      title: 'User Not Found | Data Governance',
    }
  }

  return {
    title: `${user.fullName} - User Profile | Data Governance`,
    description: `View and manage ${user.fullName}'s profile, posts, and preferences.`,
  }
}

// Generate static params for better performance (optional)
export async function generateStaticParams() {
  // In production, you might want to pre-generate some common user pages
  // For now, we'll use dynamic rendering
  return []
}