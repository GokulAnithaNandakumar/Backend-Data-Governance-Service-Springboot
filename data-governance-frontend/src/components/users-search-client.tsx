'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'

interface UsersSearchClientProps {
  initialSearch: string
}

export function UsersSearchClient({ initialSearch }: UsersSearchClientProps) {
  const [search, setSearch] = useState(initialSearch)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleSearch = (value: string) => {
    setSearch(value)

    // Use transition for better UX
    startTransition(() => {
      const params = new URLSearchParams()
      if (value) {
        params.set('search', value)
      }

      router.push(`/users?${params.toString()}`)
    })
  }

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-gray-400" />
      </div>

      <input
        type="text"
        value={search}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Search users by name, email, or username..."
        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
        disabled={isPending}
      />

      {isPending && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
        </div>
      )}
    </div>
  )
}