import { Suspense } from 'react'
import { Users, FileText, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { getUsers, getSystemStats } from '@/lib/server-api'
import { UserProfile } from '@/types/api'

export default async function HomePage() {
  // Fetch data on the server
  const [users, stats] = await Promise.all([
    getUsers(),
    getSystemStats(),
  ])

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Data Governance Console
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Manage users, monitor system health, and maintain data governance across your organization.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Users className="h-5 w-5 text-blue-500" />
                <span className="text-sm font-medium text-gray-600">Total Users</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{users.length}</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Users className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium text-gray-600">Active Users</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {users.filter((u: UserProfile) => !u.deleted).length}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <FileText className="h-5 w-5 text-purple-500" />
                <span className="text-sm font-medium text-gray-600">Total Posts</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">0</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <div className={`h-3 w-3 rounded-full ${
                  stats.systemHealth === 'UP' ? 'bg-green-500' : 'bg-red-500'
                }`} />
                <span className="text-sm font-medium text-gray-600">System Health</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {stats.systemHealth === 'UP' ? 'Healthy' : stats.systemHealth || 'Unknown'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/users"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-300 transition-colors group"
          >
            <Users className="h-6 w-6 text-gray-400 group-hover:text-blue-500 mr-3" />
            <div>
              <h3 className="font-medium text-gray-900 group-hover:text-blue-600">Manage Users</h3>
              <p className="text-sm text-gray-600">View and manage user profiles</p>
            </div>
          </Link>

          <Link
            href="/users?showCreate=true"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-green-300 transition-colors group"
          >
            <Users className="h-6 w-6 text-gray-400 group-hover:text-green-500 mr-3" />
            <div>
              <h3 className="font-medium text-gray-900 group-hover:text-green-600">Create User</h3>
              <p className="text-sm text-gray-600">Add new user to the system</p>
            </div>
          </Link>

          <div className="flex items-center p-4 border border-gray-200 rounded-lg bg-gray-50">
            <TrendingUp className="h-6 w-6 text-gray-400 mr-3" />
            <div>
              <h3 className="font-medium text-gray-500">Analytics</h3>
              <p className="text-sm text-gray-500">Coming soon</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h2>
        <div className="space-y-4">
          {users.slice(0, 5).map((user: UserProfile) => (
            <div key={user.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50">
              <div className="flex-shrink-0">
                {user.profileImageUrl ? (
                  <img
                    src={user.profileImageUrl}
                    alt={user.fullName}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">
                  <Link href={`/users/${user.id}`} className="font-medium hover:text-blue-600">
                    {user.fullName}
                  </Link>
                  {user.updatedAt ? ' updated their profile' : ' joined the platform'}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(user.updatedAt || user.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
          {users.length === 0 && (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No users yet</h3>
              <p className="text-gray-600 mb-4">Get started by creating your first user.</p>
              <Link
                href="/users?showCreate=true"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create User
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Generate metadata for SEO
export const metadata = {
  title: 'Data Governance Console - Dashboard',
  description: 'Comprehensive data governance and user management dashboard.',
}