'use client'

import { UserProfile } from '@/types/api'
import { hardDeleteUser } from '@/actions/userActions'
import { Trash2, Loader2, Eye } from 'lucide-react'
import { useTransition } from 'react'
import { toast } from 'react-hot-toast'
import Link from 'next/link'

interface UserActionButtonsProps {
  user: UserProfile
}

export function UserActionButtons({ user }: UserActionButtonsProps) {
  const [isPending, startTransition] = useTransition()

  const handleHardDelete = () => {
    if (confirm(`Are you sure you want to permanently delete ${user.fullName}? This action cannot be undone.`)) {
      if (confirm('This will permanently delete all user data. Are you absolutely sure?')) {
        startTransition(async () => {
          const result = await hardDeleteUser(user.id)
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
  }

  // For soft deleted users, show only hard delete button and view button
  if (user.deleted) {
    return (
      <div className="flex items-center space-x-1">
        <Link
          href={`/users/${user.id}`}
          className="inline-flex items-center px-2 py-1 text-sm text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-md transition-colors"
          title="View user"
        >
          <Eye className="h-4 w-4" />
        </Link>

        <button
          onClick={handleHardDelete}
          disabled={isPending}
          className="inline-flex items-center px-2 py-1 text-sm text-red-700 bg-red-100 hover:bg-red-200 rounded-md transition-colors disabled:opacity-50"
          title="Permanently delete user"
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

  // For active users, show view button only
  return (
    <div className="flex items-center space-x-1">
      <Link
        href={`/users/${user.id}`}
        className="inline-flex items-center px-2 py-1 text-sm text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-md transition-colors"
        title="View user"
      >
        <Eye className="h-4 w-4" />
      </Link>
    </div>
  )
}