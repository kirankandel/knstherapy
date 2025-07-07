"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function PostPage({ params }) {
  const router = useRouter();
  const [newComment, setNewComment] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const post = {
    id: params.id,
    title: "Feeling overwhelmed with work stress",
    content: "I've been struggling with work stress lately and it's affecting my sleep and relationships...",
    category: "General Support",
    author: "User#4A9B",
    timeAgo: "3 minutes ago",
    replies: 12,
    views: 45
  };

  const [comments, setComments] = useState([
    {
      id: 1,
      author: "User#7F2E",
      content: "I completely understand what you're going through...",
      timeAgo: "2 minutes ago",
      replies: [
        {
          id: 2,
          author: "User#4A9B",
          content: "Thank you for sharing. I haven't talked to my supervisor yet...",
          timeAgo: "1 minute ago"
        }
      ]
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
    setIsLoggedIn(true);
    setShowLoginPrompt(false);
  };

  return (
    <div className="min-h-screen bg-[#f9fafb]">
      <div className="max-w-4xl mx-auto px-4 py-10">

        {/* Breadcrumb */}
        <div className="mb-4">
          <Link href="/community" className="text-[#6172A3] hover:underline font-medium text-sm">
            ← Back to Community
          </Link>
        </div>

        {/* Post */}
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <div className="mb-3">
            <span className="inline-block bg-[#D4E1F2] text-[#6172A3] px-3 py-1 text-xs font-medium rounded-full">
              {post.category}
            </span>
          </div>
          <h1 className="text-2xl font-semibold text-gray-800 mb-4">{post.title}</h1>

          <div className="flex flex-wrap justify-between items-center text-sm text-gray-500 mb-6">
            <div className="flex gap-4 flex-wrap items-center">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#739794] text-white text-xs flex items-center justify-center">
                  ?
                </div>
                <span>by {post.author}</span>
              </div>
              <span>{post.timeAgo}</span>
              <span>{post.views} views</span>
              <span>{post.replies} replies</span>
            </div>
            <div className="flex items-center gap-2 text-green-600 font-medium">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              Anonymous
            </div>
          </div>

          <p className="text-gray-700 leading-relaxed whitespace-pre-line">{post.content}</p>
        </div>

        {/* Comments */}
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Discussion ({comments.length} {comments.length === 1 ? "reply" : "replies"})
          </h2>

          {/* Comment Form */}
          {isLoggedIn ? (
            <form onSubmit={handleCommentSubmit} className="mb-8 space-y-4">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write your anonymous reply..."
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#739794]"
                rows={4}
                maxLength={1000}
              />
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">{newComment.length}/1000 characters</span>
                <button
                  type="submit"
                  disabled={!newComment.trim()}
                  className="bg-[#6172A3] text-white px-5 py-2 rounded-md hover:bg-[#4e5a86] transition disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Reply Anonymously
                </button>
              </div>
            </form>
          ) : (
            <div className="bg-[#F2E3D5] border border-[#e4d1b6] text-[#5a4c3a] rounded-lg p-6 mb-6">
              <h3 className="text-md font-semibold mb-2">Join the Conversation</h3>
              <p className="text-sm mb-4">
                Sign in anonymously to reply to this post and support the community.
              </p>
              <button
                onClick={() => setShowLoginPrompt(true)}
                className="bg-[#6172A3] text-white px-5 py-2 rounded-md hover:bg-[#4e5a86] transition"
              >
                Sign In Anonymously
              </button>
            </div>
          )}

          {/* Comment List */}
          <div className="space-y-6">
            {comments.map((comment) => (
              <div key={comment.id} className="border-b border-gray-200 pb-4">
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-[#C8DCD6] text-[#385d56] rounded-full flex items-center justify-center text-sm font-semibold">
                    ?
                  </div>
                  <div className="flex-1">
                    <div className="flex gap-2 items-center mb-1 text-sm text-gray-500">
                      <span className="font-semibold text-gray-800">{comment.author}</span>
                      <span>{comment.timeAgo}</span>
                    </div>
                    <p className="text-gray-700 mb-2">{comment.content}</p>
                    <button className="text-[#6172A3] hover:underline text-sm">Reply</button>

                    {/* Replies */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="mt-4 pl-6 border-l border-gray-200 space-y-3">
                        {comment.replies.map((reply) => (
                          <div key={reply.id} className="flex gap-3">
                            <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-white text-xs">
                              ?
                            </div>
                            <div className="flex-1 text-sm">
                              <div className="flex gap-2 items-center text-gray-500 mb-1">
                                <span className="font-semibold text-gray-800">{reply.author}</span>
                                <span>{reply.timeAgo}</span>
                              </div>
                              <p className="text-gray-700">{reply.content}</p>
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
        </div>

        {/* Login Prompt */}
        {showLoginPrompt && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Anonymous Sign In</h2>
              <p className="text-sm text-gray-600 mb-6">
                Join anonymously to contribute to the discussion. No identity or data is collected.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowLoginPrompt(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogin}
                  className="bg-[#6172A3] text-white px-4 py-2 rounded-md hover:bg-[#4e5a86]"
                >
                  Sign In Anonymously
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
