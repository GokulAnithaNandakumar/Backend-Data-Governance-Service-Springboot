import { UserProfile } from '@/types/api'
import { User, Mail, Shield, Calendar, Edit } from 'lucide-react'
import Link from 'next/link'

interface UserProfileCardProps {
  user: UserProfile
}

export function UserProfileCard({ user }: UserProfileCardProps) {
  return (
    <div className="bg-white rounded-lg border p-6">
      <div className="flex items-start justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
        <Link
          href={`/users/${user.id}/edit`}
          className="inline-flex items-center px-3 py-1 text-sm text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-md transition-colors"
        >
          <Edit className="h-4 w-4 mr-1" />
          Edit
        </Link>
      </div>

      <div className="flex items-start space-x-6">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {user.profileImageUrl ? (
            <img
              src={user.profileImageUrl}
              alt={user.fullName}
              className="h-24 w-24 rounded-full object-cover border-4 border-gray-100"
            />
          ) : (
            <div className="h-24 w-24 rounded-full bg-blue-100 flex items-center justify-center border-4 border-gray-100">
              <User className="h-12 w-12 text-blue-600" />
            </div>
          )}
        </div>

        {/* User Details */}
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">{user.fullName}</h3>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">Username:</span>
              <span className="text-sm font-medium text-gray-900">{user.username}</span>
            </div>

            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">Email:</span>
              <span className="text-sm font-medium text-gray-900">{user.email}</span>
            </div>

            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">Member since:</span>
              <span className="text-sm font-medium text-gray-900">
                {new Date(user.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>

            {user.updatedAt && (
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">Last updated:</span>
                <span className="text-sm font-medium text-gray-900">
                  {new Date(user.updatedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">Roles:</span>
              <div className="flex space-x-1">
                {user.roles.map((role) => (
                  <span
                    key={role}
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      role === 'ADMIN'
                        ? 'bg-red-100 text-red-800'
                        : role === 'MODERATOR'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {role}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bio */}
      {user.bio && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Bio</h4>
          <p className="text-sm text-gray-600 leading-relaxed">{user.bio}</p>
        </div>
      )}

      {/* Status */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-900">Status:</span>
            <div className="flex items-center space-x-2">
              <div className={`h-3 w-3 rounded-full ${user.deleted ? 'bg-red-500' : 'bg-green-500'}`} />
              <span className={`text-sm font-medium ${user.deleted ? 'text-red-600' : 'text-green-600'}`}>
                {user.deleted ? 'Inactive' : 'Active'}
              </span>
            </div>
          </div>

          {user.deletedAt && (
            <span className="text-xs text-gray-500">
              Deactivated on {new Date(user.deletedAt).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}