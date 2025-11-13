'use client'

import { UserProfile } from '@/types/api'
import { softDeleteUser } from '@/actions/userActions'
import { Edit, Trash2, Settings, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useTransition } from 'react'
import { toast } from 'react-hot-toast'

interface UserActionsBarProps {
  user: UserProfile
}

export function UserActionsBar({ user }: UserActionsBarProps) {
  const [isPending, startTransition] = useTransition()

  const handleSoftDelete = () => {
    if (confirm(`Are you sure you want to ${user.deleted ? 'reactivate' : 'soft delete'} ${user.fullName}?`)) {
      startTransition(async () => {
        const result = await softDeleteUser(user.id)
        if (result.success) {
          toast.success(result.message)
        } else {
          const errorMessage = result.message.includes('API Error')
            ? result.message.split(': ').pop() || result.message
            : result.message
          toast.error(errorMessage)
        }
      })
    }
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

      <Link
        href={`/users/${user.id}/preferences`}
        className="inline-flex items-center px-4 py-2 text-sm text-purple-700 bg-purple-100 hover:bg-purple-200 rounded-lg transition-colors"
      >
        <Settings className="h-4 w-4 mr-2" />
        Edit Preferences
      </Link>

      <button
        onClick={handleSoftDelete}
        disabled={isPending}
        className="inline-flex items-center px-4 py-2 text-sm text-red-700 bg-red-100 hover:bg-red-200 rounded-lg transition-colors disabled:opacity-50"
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Trash2 className="h-4 w-4 mr-2" />
        )}
        {user.deleted ? 'Reactivate' : 'Soft Delete'}
      </button>
    </div>
  )
}