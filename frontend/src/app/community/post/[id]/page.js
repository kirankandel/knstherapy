"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function PostPage({ params }) {
  const router = useRouter();
  const [newComment, setNewComment] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false); // This would come from your auth context
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // Mock post data - in real app, this would be fetched based on params.id
  const post = {
    id: params.id,
    title: "Feeling overwhelmed with work stress",
    content: "I've been struggling with work stress lately and it's affecting my sleep and relationships. The constant pressure to meet deadlines and the fear of making mistakes is consuming my thoughts. Has anyone else experienced this? How did you cope?",
    category: "General Support",
    author: "User#4A9B",
    timeAgo: "3 minutes ago",
    replies: 12,
    views: 45
  };

  // Mock comments data
  const [comments, setComments] = useState([
    {
      id: 1,
      author: "User#7F2E",
      content: "I completely understand what you're going through. Work stress consumed my life for months until I learned to set boundaries. Have you tried talking to your supervisor about workload management?",
      timeAgo: "2 minutes ago",
      replies: [
        {
          id: 2,
          author: "User#4A9B",
          content: "Thank you for sharing. I haven't talked to my supervisor yet - I'm worried it might reflect poorly on my performance. How did you approach that conversation?",
          timeAgo: "1 minute ago"
        }
      ]
    },
    {
      id: 3,
      author: "User#9K1L",
      content: "Meditation and deep breathing exercises helped me a lot. Even 5 minutes a day can make a difference. There are some great apps for guided meditation that focus specifically on work stress.",
      timeAgo: "5 minutes ago",
      replies: []
    },
    {
      id: 4,
      author: "User#3B8C",
      content: "Setting boundaries between work and personal time was crucial for me. I stopped checking emails after 6 PM and it made a huge difference in my sleep quality.",
      timeAgo: "8 minutes ago",
      replies: []
    }
  ]);

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      setShowLoginPrompt(true);
      return;
    }
    
    if (!newComment.trim()) return;

    const comment = {
      id: comments.length + 1,
      author: `User#${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
      content: newComment,
      timeAgo: "Just now",
      replies: []
    };

    setComments([...comments, comment]);
    setNewComment("");
  };

  const handleLogin = () => {
    // Mock login - in real app, this would be your auth flow
    setIsLoggedIn(true);
    setShowLoginPrompt(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link href="/community" className="text-indigo-600 hover:text-indigo-700">
            ← Back to Community
          </Link>
        </div>

        {/* Post Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="mb-4">
            <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">
              {post.category}
            </span>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{post.title}</h1>
          
          <div className="flex items-center justify-between text-sm text-gray-500 mb-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white text-sm mr-2">
                  ?
                </div>
                <span>by {post.author}</span>
              </div>
              <span>{post.timeAgo}</span>
              <span>{post.views} views</span>
              <span>{post.replies} replies</span>
            </div>
            <div className="flex items-center text-green-600">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
              Anonymous Discussion
            </div>
          </div>

          <div className="prose max-w-none">
            <p className="text-gray-700 leading-relaxed">{post.content}</p>
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            Discussion ({comments.length} {comments.length === 1 ? 'reply' : 'replies'})
          </h2>

          {/* Comment Form */}
          <div className="mb-8">
            {isLoggedIn ? (
              <form onSubmit={handleCommentSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Add your anonymous reply
                  </label>
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Share your thoughts, experiences, or support..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    maxLength={1000}
                  />
                  <div className="text-right text-xs text-gray-500 mt-1">
                    {newComment.length}/1000 characters
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                    Your reply will be anonymous
                  </div>
                  <button
                    type="submit"
                    disabled={!newComment.trim()}
                    className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Reply Anonymously
                  </button>
                </div>
              </form>
            ) : (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">Join the Conversation</h3>
                <p className="text-blue-700 mb-4">
                  Sign in anonymously to reply to this post and support the community.
                </p>
                <button
                  onClick={() => setShowLoginPrompt(true)}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Sign In Anonymously
                </button>
              </div>
            )}
          </div>

          {/* Comments List */}
          <div className="space-y-6">
            {comments.map((comment) => (
              <div key={comment.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm">
                    ?
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="font-medium text-gray-800">{comment.author}</span>
                      <span className="text-gray-500 text-sm">{comment.timeAgo}</span>
                    </div>
                    <p className="text-gray-700 leading-relaxed mb-3">{comment.content}</p>
                    
                    {/* Reply button */}
                    <button className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                      Reply
                    </button>

                    {/* Nested replies */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="mt-4 ml-6 space-y-4">
                        {comment.replies.map((reply) => (
                          <div key={reply.id} className="flex items-start space-x-3">
                            <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs">
                              ?
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="font-medium text-gray-800">{reply.author}</span>
                                <span className="text-gray-500 text-sm">{reply.timeAgo}</span>
                              </div>
                              <p className="text-gray-700 text-sm leading-relaxed">{reply.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Load More Comments */}
          <div className="text-center mt-8">
            <button className="text-indigo-600 hover:text-indigo-700 font-medium">
              Load more replies
            </button>
          </div>
        </div>

        {/* Related Posts */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Related Discussions</h3>
          <div className="space-y-3">
            <Link href="/community/post/2" className="block hover:bg-gray-50 p-3 rounded-lg transition-colors">
              <h4 className="font-medium text-gray-800">Techniques that help with panic attacks</h4>
              <p className="text-gray-500 text-sm">28 replies • Anxiety & Depression</p>
            </Link>
            <Link href="/community/post/3" className="block hover:bg-gray-50 p-3 rounded-lg transition-colors">
              <h4 className="font-medium text-gray-800">Work-life balance strategies</h4>
              <p className="text-gray-500 text-sm">15 replies • General Support</p>
            </Link>
          </div>
        </div>
      </div>

      {/* Login Modal */}
      {showLoginPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Anonymous Sign In</h2>
            <p className="text-gray-600 mb-6">
              Join the conversation while keeping your identity completely private. 
              No personal information required.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowLoginPrompt(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLogin}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                Sign In Anonymously
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
