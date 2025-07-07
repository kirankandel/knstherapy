"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "../../contexts/AuthContext";

export default function Community() {
  /* -------------------- state & data -------------------- */
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [postForm, setPostForm] = useState({
    title: "",
    content: "",
    category: "",
    isAnonymous: true,
  });
  const { isAuthenticated } = useAuth();

  const forumCategories = [
    {
      title: "General Support",
      description: "Share your experiences and find peer support.",
      posts: 245,
      lastPost: "2 m ago",
      hue: "#6172A3",
    },
    {
      title: "Anxiety & Depression",
      description: "Discuss coping strategies and share resources.",
      posts: 189,
      lastPost: "5 m ago",
      hue: "#739794",
    },
    {
      title: "Relationship Issues",
      description: "Anonymous discussions about relationship challenges.",
      posts: 156,
      lastPost: "12 m ago",
      hue: "#C8DCD6",
    },
    {
      title: "Crisis Support",
      description: "Immediate peer support for difficult moments.",
      posts: 67,
      lastPost: "8 m ago",
      hue: "#E11D48", // soft red
    },
  ];

  const recentPosts = [
    {
      id: 1,
      title: "Feeling overwhelmed with work stress",
      category: "General Support",
      replies: 12,
      timeAgo: "3 m ago",
      anon: "User #4A9B",
    },
    {
      id: 2,
      title: "Techniques that help with panic attacks",
      category: "Anxiety & Depression",
      replies: 28,
      timeAgo: "7 m ago",
      anon: "User #8C2D",
    },
    {
      id: 3,
      title: "How to communicate better with my partner",
      category: "Relationship Issues",
      replies: 15,
      timeAgo: "15 m ago",
      anon: "User #1F7E",
    },
  ];

  /* -------------------- helpers -------------------- */
  const handleSearch = (e) => setSearchQuery(e.target.value);

  const filtered = recentPosts.filter(
    (p) =>
      (!selectedCategory || p.category === selectedCategory) &&
      (!searchQuery ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handlePostSubmit = (e) => {
    e.preventDefault();
    alert("Anonymous post created!");
    setPostForm({ title: "", content: "", category: "", isAnonymous: true });
    setShowCreatePost(false);
  };

  /* -------------------- ui -------------------- */
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="mx-auto max-w-7xl px-4 py-12">
        {/* anonymous notice */}
        {!isAuthenticated && (
          <div className="mb-6 rounded-lg border border-[#F2E3D5] bg-[#FDF8F3] p-4">
            <p className="text-sm text-[#944E28]">
              You’re browsing anonymously.{" "}
              <Link
                href="/signup/community"
                className="font-semibold underline hover:text-[#944E28]/80"
              >
                Join&nbsp;now
              </Link>{" "}
              to post &amp; comment.
            </p>
          </div>
        )}

        {/* header */}
        <header className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-[#6172A3]">
            Anonymous Community
          </h1>
          <p className="mt-2 text-lg text-[#739794]">
            Share experiences, find support, heal together — safely &amp;
            anonymously.
          </p>

          {/* privacy badge */}
          <span className="mt-6 inline-flex items-center rounded-full bg-[#D4E1F2] px-4 py-2 text-sm text-[#6172A3]">
            <span className="mr-2 h-2 w-2 rounded-full bg-[#6172A3]"></span>
            No personal data • Ever
          </span>

          {/* search */}
          <div className="mx-auto mt-6 max-w-md">
            <div className="relative">
              <input
                value={searchQuery}
                onChange={handleSearch}
                placeholder="Search posts or categories…"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 pl-11 text-sm focus:ring-2 focus:ring-[#6172A3]"
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                🔍
              </span>
            </div>
          </div>

          {/* category pills */}
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => setSelectedCategory("")}
              className={`rounded-full px-4 py-2 text-sm font-medium ${
                !selectedCategory
                  ? "bg-[#6172A3] text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              All
            </button>
            {forumCategories.map((c) => (
              <button
                key={c.title}
                onClick={() => setSelectedCategory(c.title)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  selectedCategory === c.title
                    ? "bg-[#6172A3] text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {c.title}
              </button>
            ))}
          </div>
        </header>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* -------- main column -------- */}
          <main className="space-y-8 lg:col-span-2">
            {/* categories list */}
            <section className="rounded-xl bg-white p-6 shadow-md">
              <h2 className="mb-6 text-2xl font-semibold text-[#6172A3]">
                Forum Categories
              </h2>
              <div className="space-y-4">
                {forumCategories.map((cat) => (
                  <div
                    key={cat.title}
                    style={{
                      borderLeftColor: cat.hue,
                      backgroundColor: `${cat.hue}20`,
                    }}
                    className="cursor-pointer rounded-r-lg border-l-4 p-4 hover:bg-opacity-40"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-[#172554]">
                          {cat.title}
                        </h3>
                        <p className="mt-1 text-sm text-[#475569]">
                          {cat.description}
                        </p>
                        <p className="mt-2 text-xs text-[#94A3B8]">
                          {cat.posts} posts • last {cat.lastPost}
                        </p>
                      </div>
                      <span className="text-2xl opacity-40">💬</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* recent posts */}
            <section className="rounded-xl bg-white p-6 shadow-md">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-[#6172A3]">
                  Recent Posts
                </h2>
                <span className="text-sm text-gray-500">
                  {filtered.length} found
                </span>
              </div>

              {filtered.length ? (
                filtered.map((p) => (
                  <Link
                    href={`/community/post/${p.id}`}
                    key={p.id}
                    className="mb-4 block rounded-lg p-4 hover:bg-gray-50 last:mb-0"
                  >
                    <h3 className="font-medium text-[#172554] hover:text-[#6172A3]">
                      {p.title}
                    </h3>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-[#64748B]">
                      <span className="rounded bg-gray-100 px-2 py-1">
                        {p.category}
                      </span>
                      <span>by {p.anon}</span>
                      <span>{p.replies} replies</span>
                      <span>{p.timeAgo}</span>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-center py-10 text-gray-500">
                  No posts match your search.
                </div>
              )}
            </section>
          </main>

          {/* -------- sidebar -------- */}
          <aside className="space-y-8">
            {/* create post */}
            <div className="rounded-xl bg-white p-6 shadow-md">
              {isAuthenticated ? (
                <>
                  <button
                    onClick={() => setShowCreatePost(true)}
                    className="mb-4 w-full rounded-md bg-[#6172A3] py-3 text-white shadow hover:bg-[#546597]"
                  >
                    Create Anonymous Post
                  </button>
                  <p className="text-sm text-[#475569]">
                    Share thoughts, ask questions, or offer support. Your
                    identity remains hidden.
                  </p>
                </>
              ) : (
                <>
                  <div className="text-center">
                    <div className="text-4xl">🔒</div>
                    <p className="mt-2 text-sm text-[#475569]">
                      Join to create &amp; reply.
                    </p>
                  </div>
                  <div className="mt-4 space-y-2">
                    <Link
                      href="/signup/community"
                      className="block w-full rounded-md bg-[#6172A3] py-3 text-center text-white shadow hover:bg-[#546597]"
                    >
                      Join Community
                    </Link>
                    <Link
                      href="/login"
                      className="block w-full rounded-md bg-gray-100 py-3 text-center text-gray-700 shadow-sm hover:bg-gray-200"
                    >
                      Sign In
                    </Link>
                  </div>
                </>
              )}
            </div>

            {/* guidelines */}
            <div className="rounded-xl bg-white p-6 shadow-md">
              <h3 className="mb-4 text-lg font-semibold text-[#172554]">
                Guidelines
              </h3>
              <ul className="space-y-2 text-sm text-[#475569]">
                <li>✓ Be respectful &amp; supportive</li>
                <li>✓ No personal info</li>
                <li>✓ Report harmful content</li>
                <li>✓ Protect anonymity</li>
              </ul>
            </div>

            {/* stats / quick help */}
            <div className="rounded-xl bg-[#C8DCD6] p-6 text-center shadow-md">
              <h3 className="font-semibold text-[#172554]">
                Need Support Now?
              </h3>
              <p className="mt-1 text-sm text-[#0F172A]">
                Connect with a therapist instantly.
              </p>
              <button className="mt-4 rounded-md bg-[#6172A3] px-4 py-2 text-white shadow hover:bg-[#546597]">
                Connect
              </button>
            </div>
          </aside>
        </div>
      </div>

      {/* ------------- create-post modal ------------- */}
      {showCreatePost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-xl overflow-auto rounded-xl bg-white p-6 shadow-2xl">
            <header className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#6172A3]">
                Create Post
              </h2>
              <button
                onClick={() => setShowCreatePost(false)}
                className="text-2xl text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </header>

            <form onSubmit={handlePostSubmit} className="space-y-6">
              <select
                value={postForm.category}
                required
                onChange={(e) =>
                  setPostForm({ ...postForm, category: e.target.value })
                }
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-[#6172A3]"
              >
                <option value="">Category…</option>
                {forumCategories.map((c) => (
                  <option key={c.title}>{c.title}</option>
                ))}
              </select>

              <input
                value={postForm.title}
                required
                maxLength={150}
                onChange={(e) =>
                  setPostForm({ ...postForm, title: e.target.value })
                }
                placeholder="Title"
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-[#6172A3]"
              />

              <textarea
                value={postForm.content}
                required
                rows={6}
                maxLength={2000}
                onChange={(e) =>
                  setPostForm({ ...postForm, content: e.target.value })
                }
                placeholder="Your message…"
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-[#6172A3]"
              />

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreatePost(false)}
                  className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-[#6172A3] px-4 py-2 text-white shadow hover:bg-[#546597]"
                >
                  Post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
