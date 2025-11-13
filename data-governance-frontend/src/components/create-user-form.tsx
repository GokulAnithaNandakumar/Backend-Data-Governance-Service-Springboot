'use client'

import { useFormState } from 'react-dom'
import { useState } from 'react'
import { createUserWithState } from '@/actions/userActions'
import { UserRole } from '@/types/api'
import { X } from 'lucide-react'
import Link from 'next/link'

export function CreateUserForm() {
  const [state, formAction] = useFormState(createUserWithState, null)
  const [selectedRoles, setSelectedRoles] = useState<UserRole[]>([UserRole.USER])

  const handleRoleChange = (role: UserRole, checked: boolean) => {
    if (checked) {
      setSelectedRoles(prev => [...prev, role])
    } else {
      setSelectedRoles(prev => prev.filter(r => r !== role))
    }
  }

  return (
    <div>
      <form action={formAction} className="space-y-6">
        {/* Username */}
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700">
            Username *
          </label>
          <input
            type="text"
            name="username"
            id="username"
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter username"
          />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email *
          </label>
          <input
            type="email"
            name="email"
            id="email"
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter email address"
          />
        </div>

        {/* Name fields */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
              First Name *
            </label>
            <input
              type="text"
              name="firstName"
              id="firstName"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="First name"
            />
          </div>

          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
              Last Name *
            </label>
            <input
              type="text"
              name="lastName"
              id="lastName"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="Last name"
            />
          </div>
        </div>

        {/* Roles */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Roles *
          </label>
          <div className="space-y-2">
            {Object.values(UserRole).map((role) => (
              <label key={role} className="flex items-center">
                <input
                  type="checkbox"
                  name="roles"
                  value={role}
                  checked={selectedRoles.includes(role)}
                  onChange={(e) => handleRoleChange(role, e.target.checked)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">{role}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Bio */}
        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
            Bio
          </label>
          <textarea
            name="bio"
            id="bio"
            rows={3}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter bio (optional)"
          />
        </div>

        {/* Profile Image URL */}
        <div>
          <label htmlFor="profileImageUrl" className="block text-sm font-medium text-gray-700">
            Profile Image URL
          </label>
          <input
            type="url"
            name="profileImageUrl"
            id="profileImageUrl"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            placeholder="https://example.com/image.jpg"
          />
        </div>

        {/* Error/Success Messages */}
        {state && !state.success && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-sm">{state.message}</p>
          </div>
        )}

        {state && state.success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800 text-sm">{state.message}</p>
          </div>
        )}

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-3">
          <Link
            href="/users"
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            Create User
          </button>
        </div>
      </form>
    </div>
  )
}