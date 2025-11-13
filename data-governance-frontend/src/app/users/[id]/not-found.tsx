import { UserX, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg border p-8 text-center">
        <div className="flex justify-center mb-4">
          <UserX className="h-12 w-12 text-gray-400" />
        </div>

        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          User Not Found
        </h2>

        <p className="text-gray-600 mb-6">
          The user you're looking for doesn't exist or may have been deleted.
        </p>

        <div className="space-y-3">
          <Link
            href="/users"
            className="block w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 inline mr-2" />
            Back to Users
          </Link>

          <Link
            href="/"
            className="block w-full px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  )
}