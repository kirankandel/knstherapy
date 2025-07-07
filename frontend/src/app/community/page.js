"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "../../contexts/AuthContext";

export default function Community() {
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [postForm, setPostForm] = useState({
    title: "",
    content: "",
    category: "",
    isAnonymous: true
  });

  const { isAuthenticated, user } = useAuth();

  const forumCategories = [
    {
      title: "General Support",
      description: "Share your experiences and find peer support",
      posts: 245,
      lastPost: "2 minutes ago",
      color: "blue"
    },
    {
      title: "Anxiety & Depression",
      description: "Discuss coping strategies and share resources",
      posts: 189,
      lastPost: "5 minutes ago",
      color: "green"
    },
    {
      title: "Relationship Issues",
      description: "Anonymous discussions about relationship challenges",
      posts: 156,
      lastPost: "12 minutes ago",
      color: "purple"
    },
    {
      title: "Crisis Support",
      description: "Immediate peer support for difficult moments",
      posts: 67,
      lastPost: "8 minutes ago",
      color: "red"
    }
  ];

  const recentPosts = [
    {
      id: 1,
      title: "Feeling overwhelmed with work stress",
      category: "General Support",
      replies: 12,
      timeAgo: "3 minutes ago",
      anonymous: "User#4A9B"
    },
    {
      id: 2,
      title: "Techniques that help with panic attacks",
      category: "Anxiety & Depression",
      replies: 28,
      timeAgo: "7 minutes ago",
      anonymous: "User#8C2D"
    },
    {
      id: 3,
      title: "How to communicate better with my partner",
      category: "Relationship Issues",
      replies: 15,
      timeAgo: "15 minutes ago",
      anonymous: "User#1F7E"
    }
  ];

  const handlePostSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the post to your backend
    console.log("Creating anonymous post:", postForm);
    
    // Reset form and close modal
    setPostForm({ title: "", content: "", category: "", isAnonymous: true });
    setShowCreatePost(false);
    
    // Show success message (you could use a toast library)
    alert("Your anonymous post has been created successfully!");
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    // Here you would filter posts based on search query
  };

  const filteredPosts = recentPosts.filter(post => 
    (selectedCategory === "" || post.category === selectedCategory) &&
    (searchQuery === "" || 
     post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
     post.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Anonymous Browsing Notice */}
        {!isAuthenticated && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Browsing Anonymously
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    You&apos;re viewing community posts anonymously. 
                    <Link href="/signup/community" className="font-medium underline hover:text-yellow-800 ml-1">
                      Join our community
                    </Link> to post, comment, and connect with others.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Anonymous Community</h1>
          <p className="text-xl text-gray-600 mb-6">
            Connect with others who understand. Share experiences, find support, and heal together.
          </p>
          
          {/* Privacy Badge */}
          <div className="inline-flex items-center bg-indigo-100 text-indigo-800 px-4 py-2 rounded-full mb-6">
            <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
            All posts are anonymous • No personal data collected
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search posts, topics, or categories..."
                value={searchQuery}
                onChange={handleSearch}
                className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                🔍
              </div>
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            <button
              onClick={() => setSelectedCategory("")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === "" 
                  ? "bg-indigo-600 text-white" 
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              All Categories
            </button>
            {forumCategories.map((category, index) => (
              <button
                key={index}
                onClick={() => setSelectedCategory(category.title)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category.title 
                    ? "bg-indigo-600 text-white" 
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {category.title}
              </button>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Forum Categories */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">Forum Categories</h2>
              <div className="space-y-4">
                {forumCategories.map((category, index) => (
                  <div key={index} className={`border-l-4 border-${category.color}-500 bg-${category.color}-50 p-4 rounded-r-lg hover:bg-${category.color}-100 transition-colors cursor-pointer`}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-800 mb-1">{category.title}</h3>
                        <p className="text-gray-600 text-sm mb-2">{category.description}</p>
                        <div className="flex items-center text-xs text-gray-500">
                          <span className="mr-4">{category.posts} posts</span>
                          <span>Last post: {category.lastPost}</span>
                        </div>
                      </div>
                      <div className="text-2xl opacity-60">💭</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Posts */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">Recent Posts</h2>
                <div className="text-sm text-gray-500">
                  {filteredPosts.length} {filteredPosts.length === 1 ? 'post' : 'posts'} found
                </div>
              </div>
              
              {filteredPosts.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">🔍</div>
                  <p className="text-gray-500">No posts found matching your search criteria.</p>
                  <button
                    onClick={() => {setSearchQuery(""); setSelectedCategory("");}}
                    className="mt-2 text-indigo-600 hover:text-indigo-700"
                  >
                    Clear filters
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredPosts.map((post, index) => (
                    <Link 
                      key={index} 
                      href={`/community/post/${post.id}`}
                      className="block border-b border-gray-200 pb-4 last:border-b-0 hover:bg-gray-50 p-3 rounded-lg transition-colors cursor-pointer"
                    >
                      <h3 className="font-medium text-gray-800 mb-2 hover:text-indigo-600">{post.title}</h3>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center space-x-4">
                          <span className="bg-gray-100 px-2 py-1 rounded">{post.category}</span>
                          <span>by {post.anonymous}</span>
                          <span>{post.replies} replies</span>
                        </div>
                        <span>{post.timeAgo}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* New Post */}
            <div className="bg-white rounded-lg shadow-md p-6">
              {isAuthenticated ? (
                <>
                  <button 
                    onClick={() => setShowCreatePost(true)}
                    className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 transition-colors text-lg font-medium mb-4"
                  >
                    Create Anonymous Post
                  </button>
                  <p className="text-gray-600 text-sm">
                    Share your thoughts, ask questions, or offer support to the community. 
                    Your identity remains completely protected.
                  </p>
                </>
              ) : (
                <>
                  <div className="text-center mb-4">
                    <div className="text-4xl mb-2">🔒</div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Join to Participate</h3>
                    <p className="text-gray-600 text-sm mb-4">
                      Create an account to post and engage with the community. Your anonymity is always protected.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Link
                      href="/signup/community"
                      className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 transition-colors text-center block font-medium"
                    >
                      Join Community
                    </Link>
                    <Link
                      href="/login"
                      className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-200 transition-colors text-center block font-medium"
                    >
                      Sign In
                    </Link>
                  </div>
                </>
              )}
            </div>

            {/* Community Guidelines */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Community Guidelines</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Be respectful and supportive</span>
                </div>
                <div className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>No personal information sharing</span>
                </div>
                <div className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Report harmful content</span>
                </div>
                <div className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Respect others&apos; anonymity</span>
                </div>
              </div>
            </div>

            {/* Online Support */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-800 mb-2">Need Immediate Support?</h3>
              <p className="text-green-700 text-sm mb-4">
                If you&apos;re in crisis or need immediate help, connect with a professional right away.
              </p>
              <button className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors">
                Connect to Therapist
              </button>
            </div>

            {/* Active Users */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Community Stats</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Anonymous users online:</span>
                  <span className="font-medium text-green-600">127</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total posts today:</span>
                  <span className="font-medium">45</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Active conversations:</span>
                  <span className="font-medium">12</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Post Modal */}
      {showCreatePost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">Create Anonymous Post</h2>
                <button
                  onClick={() => setShowCreatePost(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              {/* Privacy Notice */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <div className="text-green-500 text-lg mr-3">🔒</div>
                  <div>
                    <h3 className="font-semibold text-green-800 mb-1">Your Privacy is Protected</h3>
                    <p className="text-green-700 text-sm">
                      This post will be completely anonymous. No personal information, IP addresses, 
                      or identifying data will be stored or displayed.
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handlePostSubmit} className="space-y-6">
                {/* Category Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={postForm.category}
                    onChange={(e) => setPostForm({...postForm, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  >
                    <option value="">Select a category</option>
                    {forumCategories.map((category, index) => (
                      <option key={index} value={category.title}>{category.title}</option>
                    ))}
                  </select>
                </div>

                {/* Post Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Post Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={postForm.title}
                    onChange={(e) => setPostForm({...postForm, title: e.target.value})}
                    placeholder="What would you like to discuss?"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    maxLength={150}
                    required
                  />
                  <div className="text-right text-xs text-gray-500 mt-1">
                    {postForm.title.length}/150 characters
                  </div>
                </div>

                {/* Post Content */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={postForm.content}
                    onChange={(e) => setPostForm({...postForm, content: e.target.value})}
                    placeholder="Share your thoughts, experiences, or questions. Remember, this is a safe space for honest, supportive discussion."
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    maxLength={2000}
                    required
                  />
                  <div className="text-right text-xs text-gray-500 mt-1">
                    {postForm.content.length}/2000 characters
                  </div>
                </div>

                {/* Guidelines Reminder */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">Community Guidelines Reminder</h4>
                  <ul className="text-blue-700 text-sm space-y-1">
                    <li>• Be respectful and supportive of others</li>
                    <li>• Do not share personal identifying information</li>
                    <li>• Avoid giving medical advice - share experiences only</li>
                    <li>• Report any concerning content to moderators</li>
                  </ul>
                </div>

                {/* Anonymous ID Preview */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-2">Your Anonymous Identity</h4>
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white text-sm mr-3">
                      ?
                    </div>
                    <div>
                      <p className="text-gray-700 text-sm">
                        You&apos;ll appear as: <strong>User#{Math.random().toString(36).substr(2, 4).toUpperCase()}</strong>
                      </p>
                      <p className="text-gray-500 text-xs">This ID is generated randomly for each post</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreatePost(false)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!postForm.title || !postForm.content || !postForm.category}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Post Anonymously
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
