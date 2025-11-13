'use client'

import { UserProfile, UserPreferences } from '@/types/api'
import { updateUserPreferences } from '@/actions/userActions'
import { useState, useTransition } from 'react'
import { toast } from 'react-hot-toast'
import { Save, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface EditPreferencesFormProps {
  user: UserProfile
  preferences: UserPreferences | null
}

export function EditPreferencesForm({ user, preferences }: EditPreferencesFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [formData, setFormData] = useState({
    theme: preferences?.theme || 'light',
    language: preferences?.language || 'en',
    emailNotifications: preferences?.emailNotifications ?? true,
    pushNotifications: preferences?.pushNotifications ?? true,
    smsNotifications: preferences?.smsNotifications ?? false,
    profileVisible: preferences?.profileVisible ?? true,
    showEmail: preferences?.showEmail ?? false,
    showLastSeen: preferences?.showLastSeen ?? true,
    contentFilter: preferences?.contentFilter || 'moderate',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    console.log('Submitting preferences:', formData)

    startTransition(async () => {
      const result = await updateUserPreferences(user.id, formData)
      if (result.success) {
        toast.success(result.message)
        router.push(`/users/${user.id}`)
      } else {
        // Extract clean error message
        const errorMessage = result.message.includes('API Error')
          ? result.message.split(': ').pop() || result.message
          : result.message
        toast.error(errorMessage)
        console.error('Preferences update error:', result.message)
      }
    })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked

    console.log('Input change:', { name, value, type, checked })

    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }
      console.log('Updated formData:', newData)
      return newData
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Theme */}
        <div>
          <label htmlFor="theme" className="block text-sm font-medium text-gray-700 mb-2">
            Theme Preference
          </label>
          <select
            id="theme"
            name="theme"
            value={formData.theme}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="auto">Auto</option>
          </select>
        </div>

        {/* Language */}
        <div>
          <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-2">
            Language
          </label>
          <select
            id="language"
            name="language"
            value={formData.language}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
          </select>
        </div>

        {/* Content Filter */}
        <div>
          <label htmlFor="contentFilter" className="block text-sm font-medium text-gray-700 mb-2">
            Content Filter
          </label>
          <select
            id="contentFilter"
            name="contentFilter"
            value={formData.contentFilter}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="strict">Strict</option>
            <option value="moderate">Moderate</option>
            <option value="none">None</option>
          </select>
        </div>
      </div>

      {/* Notification Settings */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              id="emailNotifications"
              name="emailNotifications"
              type="checkbox"
              checked={formData.emailNotifications}
              onChange={handleInputChange}
              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
            />
            <label htmlFor="emailNotifications" className="ml-3 text-sm text-gray-700">
              Enable email notifications
            </label>
          </div>

          <div className="flex items-center">
            <input
              id="pushNotifications"
              name="pushNotifications"
              type="checkbox"
              checked={formData.pushNotifications}
              onChange={handleInputChange}
              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
            />
            <label htmlFor="pushNotifications" className="ml-3 text-sm text-gray-700">
              Enable push notifications
            </label>
          </div>

          <div className="flex items-center">
            <input
              id="smsNotifications"
              name="smsNotifications"
              type="checkbox"
              checked={formData.smsNotifications}
              onChange={handleInputChange}
              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
            />
            <label htmlFor="smsNotifications" className="ml-3 text-sm text-gray-700">
              Enable SMS notifications
            </label>
          </div>
        </div>
      </div>

      {/* Privacy Settings */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Privacy Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              id="profileVisible"
              name="profileVisible"
              type="checkbox"
              checked={formData.profileVisible}
              onChange={handleInputChange}
              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
            />
            <label htmlFor="profileVisible" className="ml-3 text-sm text-gray-700">
              Make profile visible to other users
            </label>
          </div>

          <div className="flex items-center">
            <input
              id="showEmail"
              name="showEmail"
              type="checkbox"
              checked={formData.showEmail}
              onChange={handleInputChange}
              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
            />
            <label htmlFor="showEmail" className="ml-3 text-sm text-gray-700">
              Show email address on profile
            </label>
          </div>

          <div className="flex items-center">
            <input
              id="showLastSeen"
              name="showLastSeen"
              type="checkbox"
              checked={formData.showLastSeen}
              onChange={handleInputChange}
              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
            />
            <label htmlFor="showLastSeen" className="ml-3 text-sm text-gray-700">
              Show last seen status
            </label>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Updating...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Update Preferences
            </>
          )}
        </button>
      </div>
    </form>
  )
}