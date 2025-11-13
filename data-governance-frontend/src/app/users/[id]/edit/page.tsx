import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { User, ArrowLeft } from 'lucide-react'
import { getUser } from '@/lib/server-api'
import { EditUserForm } from '@/components/edit-user-form'
import Link from 'next/link'

// This is a Server Component with SSR
export default async function EditUserPage({
  params,
}: {
  params: { id: string }
}) {
  // Fetch user data on the server
  const user = await getUser(params.id)

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
          <User className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit User</h1>
            <p className="text-gray-600">Update {user.fullName}'s profile information</p>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <div className="bg-white rounded-lg border p-6">
        <Suspense fallback={<div>Loading form...</div>}>
          <EditUserForm user={user} />
        </Suspense>
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
    title: `Edit ${user.fullName} | Data Governance`,
    description: `Update ${user.fullName}'s profile information.`,
  }
}