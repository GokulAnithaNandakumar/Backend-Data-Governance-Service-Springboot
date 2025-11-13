import { UserPreferences } from '@/types/api'
import { Settings, Palette, Globe, Bell, Mail, Code } from 'lucide-react'

interface UserPreferencesCardProps {
  preferences: UserPreferences
}

export function UserPreferencesCard({ preferences }: UserPreferencesCardProps) {
  return (
    <div className="space-y-6">
      {/* Basic Preferences */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Palette className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium text-gray-900">Theme</span>
          </div>
          <p className="text-sm text-gray-600 capitalize">{preferences.theme}</p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Globe className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium text-gray-900">Language</span>
          </div>
          <p className="text-sm text-gray-600">{preferences.language}</p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Bell className="h-4 w-4 text-yellow-500" />
            <span className="text-sm font-medium text-gray-900">Notifications</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`h-2 w-2 rounded-full ${
              preferences.pushNotifications ? 'bg-green-500' : 'bg-red-500'
            }`} />
            <span className={`text-sm ${
              preferences.pushNotifications ? 'text-green-600' : 'text-red-600'
            }`}>
              {preferences.pushNotifications ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Mail className="h-4 w-4 text-purple-500" />
            <span className="text-sm font-medium text-gray-900">Email Updates</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`h-2 w-2 rounded-full ${
              preferences.emailNotifications ? 'bg-green-500' : 'bg-red-500'
            }`} />
            <span className={`text-sm ${
              preferences.emailNotifications ? 'text-green-600' : 'text-red-600'
            }`}>
              {preferences.emailNotifications ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        </div>
      </div>

      {/* Custom Settings */}
      {preferences.customSettings && Object.keys(preferences.customSettings).length > 0 && (
        <div className="border-t border-gray-200 pt-6">
          <div className="flex items-center space-x-2 mb-4">
            <Code className="h-5 w-5 text-gray-400" />
            <h4 className="text-lg font-medium text-gray-900">Custom Settings</h4>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(preferences.customSettings).map(([key, value]) => (
                <div key={key} className="space-y-1">
                  <span className="text-sm font-medium text-gray-900 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:
                  </span>
                  <div className="text-sm text-gray-600">
                    {typeof value === 'object' ? (
                      <pre className="text-xs bg-white p-2 rounded border font-mono">
                        {JSON.stringify(value, null, 2)}
                      </pre>
                    ) : typeof value === 'boolean' ? (
                      <div className="flex items-center space-x-2">
                        <div className={`h-2 w-2 rounded-full ${value ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span className={value ? 'text-green-600' : 'text-red-600'}>
                          {value ? 'True' : 'False'}
                        </span>
                      </div>
                    ) : (
                      <span>{String(value)}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Last Updated */}
      <div className="border-t border-gray-200 pt-4">
        <p className="text-xs text-gray-500">
          Last updated: {new Date(preferences.updatedAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>
    </div>
  )
}