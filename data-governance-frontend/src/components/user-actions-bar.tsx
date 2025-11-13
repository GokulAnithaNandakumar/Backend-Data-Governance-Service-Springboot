'use client'

import { UserProfile } from '@/types/api'
import { softDeleteUser, hardDeleteUser, updateUserStatus } from '@/actions/userActions'
import { Edit, Trash2, UserX, ToggleLeft, ToggleRight, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useTransition } from 'react'
import { toast } from 'react-hot-toast'

interface UserActionsBarProps {
  user: UserProfile
}

export function UserActionsBar({ user }: UserActionsBarProps) {
  const [isPending, startTransition] = useTransition()

  const handleSoftDelete = () => {
    if (confirm(`Are you sure you want to ${user.deleted ? 'reactivate' : 'deactivate'} ${user.fullName}?`)) {
      startTransition(async () => {
        const result = await softDeleteUser(user.id)
        if (result.success) {
          toast.success(result.message)
        } else {
          toast.error(result.message)
        }
      })
    }
  }

  const handleHardDelete = () => {
    if (confirm(`Are you sure you want to permanently delete ${user.fullName}? This action cannot be undone.`)) {
      if (confirm('This will permanently delete all user data. Are you absolutely sure?')) {
        startTransition(async () => {
          const result = await hardDeleteUser(user.id)
          if (result.success) {
            toast.success(result.message)
            // Redirect to users list after permanent deletion
            window.location.href = '/users'
          } else {
            toast.error(result.message)
          }
        })
      }
    }
  }

  const handleStatusToggle = () => {
    const newStatus = user.deleted ? 'active' : 'inactive'
    startTransition(async () => {
      const result = await updateUserStatus(user.id, newStatus)
      if (result.success) {
        toast.success(result.message)
      } else {
        toast.error(result.message)
      }
    })
  }

  return (
    <div className="flex items-center space-x-3">
      <Link
        href={`/users/${user.id}/edit`}
        className="inline-flex items-center px-4 py-2 text-sm text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors"
      >
        <Edit className="h-4 w-4 mr-2" />
        Edit Profile
      </Link>

      <button
        onClick={handleStatusToggle}
        disabled={isPending}
        className={`inline-flex items-center px-4 py-2 text-sm rounded-lg transition-colors disabled:opacity-50 ${
          user.deleted
            ? 'text-green-700 bg-green-100 hover:bg-green-200'
            : 'text-yellow-700 bg-yellow-100 hover:bg-yellow-200'
        }`}
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : user.deleted ? (
          <ToggleRight className="h-4 w-4 mr-2" />
        ) : (
          <ToggleLeft className="h-4 w-4 mr-2" />
        )}
        {user.deleted ? 'Activate' : 'Deactivate'}
      </button>

      <button
        onClick={handleSoftDelete}
        disabled={isPending}
        className="inline-flex items-center px-4 py-2 text-sm text-orange-700 bg-orange-100 hover:bg-orange-200 rounded-lg transition-colors disabled:opacity-50"
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <UserX className="h-4 w-4 mr-2" />
        )}
        {user.deleted ? 'Restore' : 'Soft Delete'}
      </button>

      <button
        onClick={handleHardDelete}
        disabled={isPending}
        className="inline-flex items-center px-4 py-2 text-sm text-red-700 bg-red-100 hover:bg-red-200 rounded-lg transition-colors disabled:opacity-50"
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Trash2 className="h-4 w-4 mr-2" />
        )}
        Delete Permanently
      </button>
    </div>
  )
}