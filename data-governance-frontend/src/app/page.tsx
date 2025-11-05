import { getUsers, getPosts, getPreferences, getSystemStats } from '@/lib/server-actions'
import { ClientHomePage } from '@/components/client-home-page'

export default async function HomePage() {
  // Fetch all data on the server
  const [users, posts, preferences, stats] = await Promise.all([
    getUsers(),
    getPosts(),
    getPreferences(),
    getSystemStats()
  ])

  return (
    <ClientHomePage
      initialUsers={users}
      initialPosts={posts}
      initialPreferences={preferences}
      initialStats={stats}
    />
  )
}