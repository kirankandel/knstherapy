"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "../../contexts/AuthContext";

export default function Community() {
  /* ───────────────────────── STATE ───────────────────────── */
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [postForm, setPostForm] = useState({
    title: "",
    content: "",
    category: "",
    isAnonymous: true,
  });

  // comment state (all JS, no TS generics)
  const [comments, setComments] = useState({});
  const [commentInputs, setCommentInputs] = useState({});

  const { isAuthenticated } = useAuth();

  /* ───────────────────── SAMPLE DATA ─────────────────────── */
  const forumCategories = [
    {
      title: "General Support",
      description: "Share your experiences and find peer support",
      posts: 245,
      lastPost: "2 minutes ago",
      color: "blue",
    },
    {
      title: "Anxiety & Depression",
      description: "Discuss coping strategies and share resources",
      posts: 189,
      lastPost: "5 minutes ago",
      color: "green",
    },
    {
      title: "Relationship Issues",
      description: "Anonymous discussions about relationship challenges",
      posts: 156,
      lastPost: "12 minutes ago",
      color: "purple",
    },
    {
      title: "Crisis Support",
      description: "Immediate peer support for difficult moments",
      posts: 67,
      lastPost: "8 minutes ago",
      color: "red",
    },
  ];

  const recentPosts = [
    {
      id: 1,
      title: "Feeling overwhelmed with work stress",
      category: "General Support",
      replies: 12,
      timeAgo: "3 minutes ago",
      anonymous: "User#4A9B",
    },
    {
      id: 2,
      title: "Techniques that help with panic attacks",
      category: "Anxiety & Depression",
      replies: 28,
      timeAgo: "7 minutes ago",
      anonymous: "User#8C2D",
    },
    {
      id: 3,
      title: "How to communicate better with my partner",
      category: "Relationship Issues",
      replies: 15,
      timeAgo: "15 minutes ago",
      anonymous: "User#1F7E",
    },
  ];

  /* ─────────────────── EVENT HANDLERS ────────────────────── */
  const handlePostSubmit = (e) => {
    e.preventDefault();
    console.log("Creating anonymous post:", postForm);
    setPostForm({ title: "", content: "", category: "", isAnonymous: true });
    setShowCreatePost(false);
    alert("Your anonymous post has been created successfully!");
  };

  const handleSearch = (e) => setSearchQuery(e.target.value);

  const handleCommentChange = (postId, value) => {
    setCommentInputs({ ...commentInputs, [postId]: value });
  };

  const handleCommentSubmit = (postId) => {
    const text = (commentInputs[postId] || "").trim();
    if (!text) return;
    const newComment = { text, date: new Date().toLocaleString() };
    setComments({
      ...comments,
      [postId]: [...(comments[postId] || []), newComment],
    });
    setCommentInputs({ ...commentInputs, [postId]: "" });
  };

  /* ─────────────────── POST FILTERING ────────────────────── */
  const filteredPosts = recentPosts.filter(
    (p) =>
      (selectedCategory === "" || p.category === selectedCategory) &&
      (searchQuery === "" ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  /* ───────────────────────── VIEW ────────────────────────── */
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* —— Banner for anonymous users —— */}
        {!isAuthenticated && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-700">
              You&apos;re viewing posts anonymously.
              <Link
                href="/signup/community"
                className="ml-1 font-medium underline hover:text-yellow-800"
              >
                Join our community
              </Link>{" "}
              to participate.
            </p>
          </div>
        )}

        {/* —— Header —— */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Anonymous Community</h1>
          <p className="text-xl text-gray-600 mb-6">
            Share experiences, find support, heal together.
          </p>

          {/* Search bar */}
          <div className="max-w-2xl mx-auto mb-6 relative">
            <input
              type="text"
              placeholder="Search posts..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              🔍
            </div>
          </div>

          {/* Category filter */}
          <div className="flex flex-wrap justify-center gap-2">
            <button
              onClick={() => setSelectedCategory("")}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                selectedCategory === ""
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              All
            </button>
            {forumCategories.map((c) => (
              <button
                key={c.title}
                onClick={() => setSelectedCategory(c.title)}
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  selectedCategory === c.title
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {c.title}
              </button>
            ))}
          </div>
        </div>

        {/* —— Main grid —— */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* ====== MAIN COLUMN ====== */}
          <div className="lg:col-span-2 space-y-6">
            {/* —— Recent Posts —— */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">Recent Posts</h2>
                <span className="text-sm text-gray-500">
                  {filteredPosts.length}{" "}
                  {filteredPosts.length === 1 ? "post" : "posts"} found
                </span>
              </div>

              {filteredPosts.length === 0 ? (
                <p className="text-center text-gray-500">
                  No posts match your search.
                </p>
              ) : (
                <div className="space-y-6">
                  {filteredPosts.map((post) => (
                    <div
                      key={post.id}
                      className="border-b border-gray-200 pb-4 last:border-b-0"
                    >
                      {/* Title links to full thread */}
                      <Link href={`/community/post/${post.id}`}>
                        <h3 className="font-medium text-gray-800 mb-2 hover:text-indigo-600">
                          {post.title}
                        </h3>
                      </Link>

                      {/* Meta */}
                      <div className="flex justify-between text-sm text-gray-500">
                        <div className="flex items-center space-x-4">
                          <span className="bg-gray-100 px-2 py-1 rounded">
                            {post.category}
                          </span>
                          <span>by {post.anonymous}</span>
                          <span>{post.replies} replies</span>
                        </div>
                        <span>{post.timeAgo}</span>
                      </div>

                      {/* Existing comments */}
                      {(comments[post.id] || []).map((c, i) => (
                        <div
                          key={i}
                          className="mt-2 text-sm text-gray-700 flex items-center"
                        >
                          <span className="font-medium mr-1">You:</span>
                          <span>{c.text}</span>
                          <span className="ml-2 text-xs text-gray-400">
                            {c.date}
                          </span>
                        </div>
                      ))}

                      {/* ONE comment bar per post */}
                      <div className="mt-3 flex items-center space-x-2">
                        <input
                          type="text"
                          placeholder="Write a comment..."
                          value={commentInputs[post.id] || ""}
                          onChange={(e) =>
                            handleCommentChange(post.id, e.target.value)
                          }
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <button
                          onClick={() => handleCommentSubmit(post.id)}
                          disabled={!commentInputs[post.id]?.trim()}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400"
                        >
                          Send
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ====== SIDEBAR ====== (unchanged) */}
          <div className="space-y-6">
            {/* … keep your existing sidebar code here … */}
          </div>
        </div>
      </div>

      {/* ===== Create-post modal (unchanged) ===== */}
      {showCreatePost && (
        /* ... the same modal code you had earlier ... */
        <></>
      )}
    </div>
  );
}
