'use client'

import { UserProfile } from '@/types/api'
import { softDeleteUser, updateUserStatus } from '@/actions/userActions'
import { Trash2, ToggleLeft, ToggleRight, Loader2 } from 'lucide-react'
import { useTransition } from 'react'
import { toast } from 'react-hot-toast'

interface UserActionButtonsProps {
  user: UserProfile
}

export function UserActionButtons({ user }: UserActionButtonsProps) {
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
    <div className="flex items-center space-x-1">
      <button
        onClick={handleStatusToggle}
        disabled={isPending}
        className={`inline-flex items-center px-2 py-1 text-sm rounded-md transition-colors ${
          user.deleted
            ? 'text-green-700 bg-green-100 hover:bg-green-200'
            : 'text-yellow-700 bg-yellow-100 hover:bg-yellow-200'
        } disabled:opacity-50`}
        title={user.deleted ? 'Activate user' : 'Deactivate user'}
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : user.deleted ? (
          <ToggleRight className="h-4 w-4" />
        ) : (
          <ToggleLeft className="h-4 w-4" />
        )}
      </button>

      <button
        onClick={handleSoftDelete}
        disabled={isPending}
        className="inline-flex items-center px-2 py-1 text-sm text-red-700 bg-red-100 hover:bg-red-200 rounded-md transition-colors disabled:opacity-50"
        title="Soft delete user"
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Trash2 className="h-4 w-4" />
        )}
      </button>
    </div>
  )
}