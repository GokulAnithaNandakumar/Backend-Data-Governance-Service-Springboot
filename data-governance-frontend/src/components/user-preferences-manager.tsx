'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Settings, Save, RotateCcw } from 'lucide-react'
import toast from 'react-hot-toast'
import { userPreferencesApi, userProfileApi } from '@/lib/services'
import type { UserProfile, UserPreferences } from '@/types/api'

interface UserPreferencesManagerProps {
  initialUsers?: UserProfile[]
  initialPreferences?: UserPreferences[]
}

export function UserPreferencesManager({ initialUsers = [], initialPreferences = [] }: UserPreferencesManagerProps) {
  const [selectedUserId, setSelectedUserId] = useState('')
  const [preferences, setPreferences] = useState({
    theme: 'light',
    language: 'en',
    notifications: true,
    emailUpdates: false,
    customSettings: {
      pageSize: 10,
      defaultView: 'grid',
    },
  })

  const queryClient = useQueryClient()

  // Get all users from API
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => userProfileApi.getAllUsers(),
    initialData: initialUsers,
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

  const { data: userPreferences, isLoading } = useQuery({
    queryKey: ['user-preferences', selectedUserId],
    queryFn: () => userPreferencesApi.getPreferences(selectedUserId),
    enabled: !!selectedUserId,
  })

  const updatePreferencesMutation = useMutation({
    mutationFn: (data: any) => userPreferencesApi.updatePreferences(selectedUserId, data),
    onSuccess: () => {
      toast.success('Preferences updated successfully!')
      queryClient.invalidateQueries({ queryKey: ['user-preferences', selectedUserId] })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update preferences')
    },
  })

  const handleSave = () => {
    updatePreferencesMutation.mutate(preferences)
  }

  const handleReset = () => {
    setPreferences({
      theme: 'light',
      language: 'en',
      notifications: true,
      emailUpdates: false,
      customSettings: {
        pageSize: 10,
        defaultView: 'grid',
      },
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Preferences</h2>
          <p className="mt-1 text-sm text-gray-600">
            Manage user settings and preferences
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleReset}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </button>
          <button
            onClick={handleSave}
            disabled={updatePreferencesMutation.isPending}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            <Save className="h-4 w-4 mr-2" />
            {updatePreferencesMutation.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* User Selection */}
      <div className="bg-white shadow rounded-lg p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select User
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Preferences */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              General Settings
            </h3>
          </div>
          <div className="p-6 space-y-6">
            {/* Theme */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Theme
              </label>
              <div className="space-y-2">
                {['light', 'dark', 'auto'].map((theme) => (
                  <label key={theme} className="flex items-center">
                    <input
                      type="radio"
                      name="theme"
                      value={theme}
                      checked={preferences.theme === theme}
                      onChange={(e) => setPreferences(prev => ({ ...prev, theme: e.target.value }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700 capitalize">{theme}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Language */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Language
              </label>
              <select
                value={preferences.language}
                onChange={(e) => setPreferences(prev => ({ ...prev, language: e.target.value }))}
                className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
              </select>
            </div>

            {/* Notifications */}
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={preferences.notifications}
                  onChange={(e) => setPreferences(prev => ({ ...prev, notifications: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-700">
                  Enable notifications
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={preferences.emailUpdates}
                  onChange={(e) => setPreferences(prev => ({ ...prev, emailUpdates: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-700">
                  Receive email updates
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Custom Settings */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Custom Settings</h3>
          </div>
          <div className="p-6 space-y-6">
            {/* Page Size */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Items per page
              </label>
              <select
                value={preferences.customSettings.pageSize}
                onChange={(e) => setPreferences(prev => ({
                  ...prev,
                  customSettings: { ...prev.customSettings, pageSize: parseInt(e.target.value) }
                }))}
                className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>

            {/* Default View */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default view
              </label>
              <div className="space-y-2">
                {['grid', 'list', 'table'].map((view) => (
                  <label key={view} className="flex items-center">
                    <input
                      type="radio"
                      name="defaultView"
                      value={view}
                      checked={preferences.customSettings.defaultView === view}
                      onChange={(e) => setPreferences(prev => ({
                        ...prev,
                        customSettings: { ...prev.customSettings, defaultView: e.target.value }
                      }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700 capitalize">{view}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Additional Custom Settings */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Settings (JSON)
              </label>
              <textarea
                value={JSON.stringify(preferences.customSettings, null, 2)}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value)
                    setPreferences(prev => ({ ...prev, customSettings: parsed }))
                  } catch (error) {
                    // Invalid JSON, don't update
                  }
                }}
                rows={6}
                className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                placeholder="Custom settings as JSON"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Current Preferences Display */}
      {isLoading ? (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-center">Loading current preferences...</div>
        </div>
      ) : userPreferences ? (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Current Preferences</h3>
          </div>
          <div className="p-6">
            <pre className="bg-gray-50 rounded-md p-4 text-sm overflow-auto">
              {JSON.stringify(userPreferences, null, 2)}
            </pre>
          </div>
        </div>
      ) : null}
    </div>
  )
}