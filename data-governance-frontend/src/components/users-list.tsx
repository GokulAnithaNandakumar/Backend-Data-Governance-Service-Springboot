import { UserProfile } from '@/types/api'
import { User, Mail, Shield, Calendar, Eye, Trash2, UserX } from 'lucide-react'
import Link from 'next/link'
import { UserActionButtons } from '@/components/user-action-buttons'

interface UsersListProps {
  users: UserProfile[]
}

export function UsersList({ users }: UsersListProps) {
  if (users.length === 0) {
    return (
      <div className="p-8 text-center">
        <UserX className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
        <p className="text-gray-600">
          No users match your search criteria or no users have been created yet.
        </p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-gray-200">
      {users.map((user) => (
        <div
          key={user.id}
          className={`p-6 hover:bg-gray-50 transition-colors ${
            user.deleted ? 'opacity-60' : ''
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Avatar */}
              <div className="flex-shrink-0">
                {user.profileImageUrl ? (
                  <img
                    src={user.profileImageUrl}
                    alt={user.fullName}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                )}
              </div>

              {/* User Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <Link
                    href={`/users/${user.id}`}
                    className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                  >
                    {user.fullName}
                  </Link>

                  {user.deleted && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Inactive
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <User className="h-4 w-4" />
                    <span>{user.username}</span>
                  </div>

                  <div className="flex items-center space-x-1">
                    <Mail className="h-4 w-4" />
                    <span>{user.email}</span>
                  </div>

                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Roles */}
                <div className="flex items-center space-x-2 mt-2">
                  <Shield className="h-4 w-4 text-gray-400" />
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

                {/* Bio preview */}
                {user.bio && (
                  <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                    {user.bio}
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <Link
                href={`/users/${user.id}`}
                className="inline-flex items-center px-3 py-1 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                <Eye className="h-4 w-4 mr-1" />
                View
              </Link>

              <UserActionButtons user={user} />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}