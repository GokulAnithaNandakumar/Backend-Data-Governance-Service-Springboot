'use client'

import { UserPost } from '@/types/api'
import { FileText, Eye, Heart, MessageCircle, Calendar, Tag, Trash2, Plus } from 'lucide-react'
import { CreatePostForm } from '@/components/create-post-form'
import { deletePost } from '@/actions/postActions'
import { useState, useTransition } from 'react'
import { toast } from 'react-hot-toast'

interface UserPostsListProps {
  posts: UserPost[]
  userId: string
}

export function UserPostsList({ posts, userId }: UserPostsListProps) {
  const [showCreateForm, setShowCreateForm] = useState(false)

  return (
    <div className="space-y-6">
      {/* Create Post Section */}
      <div className="border-b border-gray-200 pb-4">
        {!showCreateForm ? (
          <button
            onClick={() => setShowCreateForm(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Post
          </button>
        ) : (
          <CreatePostForm 
            userId={userId} 
            onClose={() => setShowCreateForm(false)} 
          />
        )}
      </div>

      {/* Posts List */}
      {posts.length === 0 ? (
        <div className="text-center py-8">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
          <p className="text-gray-600">
            This user hasn't created any posts yet.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostItem key={post.id} post={post} userId={userId} />
          ))}
        </div>
      )}
    </div>
  )
}

interface PostItemProps {
  post: UserPost
  userId: string
}

function PostItem({ post, userId }: PostItemProps) {
  const [isPending, startTransition] = useTransition()

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      startTransition(async () => {
        const result = await deletePost(userId, post.id)
        if (result.success) {
          toast.success(result.message)
        } else {
          toast.error(result.message)
        }
      })
    }
  }

  return (
    <div
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

        {/* Delete Button */}
        {!post.deleted && (
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="inline-flex items-center px-2 py-1 text-sm text-red-700 bg-red-100 hover:bg-red-200 rounded-md transition-colors disabled:opacity-50"
            title="Delete post"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
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
          <span>{post.viewCount || 0} views</span>
        </div>

        <div className="flex items-center space-x-1">
          <Heart className="h-4 w-4" />
          <span>{post.likeCount || 0} likes</span>
        </div>

        <div className="flex items-center space-x-1">
          <MessageCircle className="h-4 w-4" />
          <span>{post.commentCount || 0} comments</span>
        </div>
      </div>
    </div>
  )
}