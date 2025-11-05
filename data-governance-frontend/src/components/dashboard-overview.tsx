'use client'

import { useQuery } from '@tanstack/react-query'
import { UserCircle, Activity, Users, FileText, Plus, Download, Settings } from 'lucide-react'
import { healthApi, statisticsApi } from '@/lib/services'

export function DashboardOverview() {
  const { data: healthData, isLoading: healthLoading } = useQuery({
    queryKey: ['health'],
    queryFn: healthApi.checkHealth,
    refetchInterval: 30000, // Check every 30 seconds
  })

  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: statisticsApi.getDashboardStats,
    refetchInterval: 60000, // Check every minute
  })

  const cards = [
    {
      title: 'Total Users',
      value: statsLoading ? 'Loading...' : (stats?.totalUsers?.toLocaleString() || '0'),
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      title: 'Active Users',
      value: statsLoading ? 'Loading...' : (stats?.activeUsers?.toLocaleString() || '0'),
      icon: UserCircle,
      color: 'bg-green-500',
    },
    {
      title: 'Total Posts',
      value: statsLoading ? 'Loading...' : (stats?.totalPosts?.toLocaleString() || '0'),
      icon: FileText,
      color: 'bg-purple-500',
    },
    {
      title: 'System Health',
      value: healthLoading ? 'Checking...' : (healthData?.status || 'Unknown'),
      icon: Activity,
      color: healthData?.status === 'UP' ? 'bg-green-500' : 'bg-red-500',
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
        <p className="mt-1 text-sm text-gray-600">
          System statistics and health monitoring
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <div
              key={card.title}
              className="bg-white overflow-hidden shadow rounded-lg"
            >
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className={`${card.color} p-3 rounded-md`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {card.title}
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {card.value}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Error Display */}
      {statsError && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error loading statistics
              </h3>
              <div className="mt-2 text-sm text-red-700">
                Unable to connect to backend. Please ensure the backend server is running.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* All 10 Features Quick Access */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Quick Access to All Features</h3>
          <p className="mt-1 text-sm text-gray-600">Access all 10 data governance features</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {/* FR1: Create User */}
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('switchTab', { detail: 'profiles' }))}
              className="inline-flex flex-col items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="h-5 w-5 mb-1" />
              FR1: Create User
            </button>

            {/* FR2: Read User */}
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('switchTab', { detail: 'profiles' }))}
              className="inline-flex flex-col items-center justify-center px-4 py-3 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Users className="h-5 w-5 mb-1" />
              FR2: Read User
            </button>

            {/* FR3: Update User */}
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('switchTab', { detail: 'profiles' }))}
              className="inline-flex flex-col items-center justify-center px-4 py-3 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Settings className="h-5 w-5 mb-1" />
              FR3: Update User
            </button>

            {/* FR4: Soft Delete User */}
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('switchTab', { detail: 'profiles' }))}
              className="inline-flex flex-col items-center justify-center px-4 py-3 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Activity className="h-5 w-5 mb-1" />
              FR4: Soft Delete
            </button>

            {/* FR5: Hard Delete User */}
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('switchTab', { detail: 'profiles' }))}
              className="inline-flex flex-col items-center justify-center px-4 py-3 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Download className="h-5 w-5 mb-1" />
              FR5: Hard Delete
            </button>

            {/* FR6: Update Preferences */}
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('switchTab', { detail: 'preferences' }))}
              className="inline-flex flex-col items-center justify-center px-4 py-3 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Settings className="h-5 w-5 mb-1" />
              FR6: Update Prefs
            </button>

            {/* FR7: Read Preferences */}
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('switchTab', { detail: 'preferences' }))}
              className="inline-flex flex-col items-center justify-center px-4 py-3 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <UserCircle className="h-5 w-5 mb-1" />
              FR7: Read Prefs
            </button>

            {/* FR8: Create Post */}
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('switchTab', { detail: 'posts' }))}
              className="inline-flex flex-col items-center justify-center px-4 py-3 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="h-5 w-5 mb-1" />
              FR8: Create Post
            </button>

            {/* FR9: Read Posts */}
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('switchTab', { detail: 'posts' }))}
              className="inline-flex flex-col items-center justify-center px-4 py-3 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FileText className="h-5 w-5 mb-1" />
              FR9: Read Posts
            </button>

            {/* FR10: Delete Post */}
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('switchTab', { detail: 'posts' }))}
              className="inline-flex flex-col items-center justify-center px-4 py-3 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Activity className="h-5 w-5 mb-1" />
              FR10: Delete Post
            </button>
          </div>
        </div>
      </div>

      {/* System Information */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">System Information</h3>
        </div>
        <div className="p-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-3">
            <div>
              <dt className="text-sm font-medium text-gray-500">Backend Status</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {healthLoading ? 'Checking...' : (healthData?.status || 'Unknown')}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">API Version</dt>
              <dd className="mt-1 text-sm text-gray-900">v1</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Active Posts</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {statsLoading ? 'Loading...' : (stats?.activePosts?.toLocaleString() || '0')}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  )
}