import { UserPost } from '@/types/api'
import { FileText, Eye, Heart, MessageCircle, Calendar, Tag } from 'lucide-react'

interface UserPostsListProps {
  posts: UserPost[]
  userId: string
}

export function UserPostsList({ posts, userId }: UserPostsListProps) {
  if (posts.length === 0) {
    return (
      <div className="text-center py-8">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
        <p className="text-gray-600">
          This user hasn't created any posts yet.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <div
          key={post.id}
          className={`border rounded-lg p-4 hover:shadow-sm transition-shadow ${
            post.deleted ? 'opacity-60' : ''
          }`}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h4 className="text-lg font-semibold text-gray-900">{post.title}</h4>

                {post.deleted && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    Deleted
                  </span>
                )}

                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  post.isPublic
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {post.isPublic ? 'Public' : 'Private'}
                </span>

                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  post.status === 'PUBLISHED'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {post.status}
                </span>
              </div>

              <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-3 w-3" />
                  <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                </div>

                {post.updatedAt && (
                  <div className="flex items-center space-x-1">
                    <span>Updated {new Date(post.updatedAt).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Content Preview */}
          <div className="mb-3">
            <p className="text-gray-700 line-clamp-3">{post.content}</p>
          </div>

          {/* Images */}
          {post.imageUrls && post.imageUrls.length > 0 && (
            <div className="mb-3">
              <div className="flex space-x-2 overflow-x-auto">
                {post.imageUrls.slice(0, 3).map((url, index) => (
                  <img
                    key={index}
                    src={url}
                    alt={`Post image ${index + 1}`}
                    className="h-20 w-20 object-cover rounded-lg flex-shrink-0"
                  />
                ))}
                {post.imageUrls.length > 3 && (
                  <div className="h-20 w-20 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-sm text-gray-600">+{post.imageUrls.length - 3}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mb-3">
              <div className="flex items-center space-x-2">
                <Tag className="h-4 w-4 text-gray-400" />
                <div className="flex flex-wrap gap-1">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Engagement Stats */}
          <div className="flex items-center space-x-6 text-sm text-gray-500 border-t border-gray-100 pt-3">
            <div className="flex items-center space-x-1">
              <Eye className="h-4 w-4" />
              <span>{post.viewCount} views</span>
            </div>

            <div className="flex items-center space-x-1">
              <Heart className="h-4 w-4" />
              <span>{post.likeCount} likes</span>
            </div>

            <div className="flex items-center space-x-1">
              <MessageCircle className="h-4 w-4" />
              <span>{post.commentCount} comments</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}