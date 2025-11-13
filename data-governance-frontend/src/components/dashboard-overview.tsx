// Server Component - Dashboard Overview (SSR only, no client-side code)
import { UserCircle, Activity, Users, FileText, Plus, Download, Settings } from 'lucide-react'
import { getSystemStats, getHealthStatus } from '@/lib/server-api'
import Link from 'next/link'

// This is a Server Component - completely SSR as per PRD requirements
export async function DashboardOverview() {
  // Fetch data on the server
  const [stats, health] = await Promise.all([
    getSystemStats({ revalidate: 60 }), // Cache for 1 minute
    getHealthStatus({ revalidate: 30 }), // Cache for 30 seconds
  ])

  // Debug logging
  console.log('Health Status Response:', health)

  // Determine system status
  const systemStatus = health?.status === 'UP' ? 'Healthy' : health?.status || 'Unknown'
  const statusColor = health?.status === 'UP' ? 'text-green-600' : 'text-red-600'
  const statusBgColor = health?.status === 'UP' ? 'bg-green-100' : 'bg-red-100'

  return (
    <div className="space-y-6">
      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users */}
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalUsers || 0}</p>
            </div>
          </div>
        </div>

        {/* Total Posts */}
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <FileText className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Posts</h3>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalPosts || 0}</p>
            </div>
          </div>
        </div>

        {/* User Preferences */}
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Settings className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Preferences</h3>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalPreferences || 0}</p>
            </div>
          </div>
        </div>

        {/* System Health */}
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center">
            <div className={`p-2 ${statusBgColor} rounded-lg`}>
              <Activity className={`h-6 w-6 ${statusColor}`} />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">System Health</h3>
              <p className={`text-2xl font-bold ${statusColor}`}>{systemStatus}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/users/new"
            className="inline-flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create New User
          </Link>

          <Link
            href="/users"
            className="inline-flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <UserCircle className="h-5 w-5 mr-2" />
            View All Users
          </Link>

          <button className="inline-flex items-center justify-center px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
            <Download className="h-5 w-5 mr-2" />
            Export Data
          </button>
        </div>
      </div>

      {/* System Health Details (if unhealthy) */}
      {health?.status !== 'UP' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-red-800 mb-2">System Health Alert</h3>
          <p className="text-red-700">
            The system is experiencing issues. Please check the backend services.
          </p>
        </div>
      )}
    </div>
  )
}