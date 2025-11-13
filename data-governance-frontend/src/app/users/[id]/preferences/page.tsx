import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { Settings, ArrowLeft } from 'lucide-react'
import { getUser, getUserPreferences } from '@/lib/server-api'
import { EditPreferencesForm } from '@/components/edit-preferences-form'
import Link from 'next/link'

// This is a Server Component with SSR
export default async function UserPreferencesPage({
  params,
}: {
  params: { id: string }
}) {
  // Fetch both user and preferences data on the server
  const [user, preferences] = await Promise.all([
    getUser(params.id),
    getUserPreferences(params.id),
  ])

  // Handle not found case
  if (!user) {
    notFound()
  }

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-center space-x-4">
        <Link
          href={`/users/${user.id}`}
          className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Profile
        </Link>
        <div className="h-6 border-l border-gray-300" />
        <div className="flex items-center space-x-3">
          <Settings className="h-8 w-8 text-purple-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">User Preferences</h1>
            <p className="text-gray-600">Manage {user.fullName}'s preferences</p>
          </div>
        </div>
      </div>

      {/* Preferences Form */}
      <div className="bg-white rounded-lg border p-6">
        <Suspense fallback={<div>Loading preferences...</div>}>
          <EditPreferencesForm user={user} preferences={preferences} />
        </Suspense>
      </div>
    </div>
  )
}