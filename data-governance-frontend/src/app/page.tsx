'use client'

import { useState, useEffect } from 'react'
import { Users, Settings, FileText, Home } from 'lucide-react'
import { UserProfileManager } from '@/components/user-profile-manager'
import { UserPreferencesManager } from '@/components/user-preferences-manager'
import { UserPostsManager } from '@/components/user-posts-manager'
import { DashboardOverview } from '@/components/dashboard-overview'

type TabType = 'overview' | 'profiles' | 'preferences' | 'posts'

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<TabType>('overview')

  // Listen for tab switch events from dashboard buttons
  useEffect(() => {
    const handleTabSwitch = (event: any) => {
      if (event.detail) {
        setActiveTab(event.detail as TabType)
      }
    }

    window.addEventListener('switchTab', handleTabSwitch)
    return () => window.removeEventListener('switchTab', handleTabSwitch)
  }, [])

  const tabs = [
    { id: 'overview' as TabType, name: 'Overview', icon: Home },
    { id: 'profiles' as TabType, name: 'User Profiles', icon: Users },
    { id: 'preferences' as TabType, name: 'Preferences', icon: Settings },
    { id: 'posts' as TabType, name: 'Posts', icon: FileText },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900">
          Data Governance Dashboard
        </h1>
        <p className="mt-2 text-lg text-gray-600">
          Manage user profiles, preferences, and posts
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm
                  ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <Icon className="h-5 w-5" />
                <span>{tab.name}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-8">
        {activeTab === 'overview' && <DashboardOverview />}
        {activeTab === 'profiles' && <UserProfileManager />}
        {activeTab === 'preferences' && <UserPreferencesManager />}
        {activeTab === 'posts' && <UserPostsManager />}
      </div>
    </div>
  )
}