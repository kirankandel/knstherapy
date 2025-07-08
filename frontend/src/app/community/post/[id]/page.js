"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function PostPage({ params }) {
  const router = useRouter();
  const { id } = params;

  // Get token safely from localStorage (client-only)
  const getToken = () => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("token");
  };

  const [token, setToken] = useState(getToken());
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  // States
  const [post, setPost] = useState(null);
  const [replies, setReplies] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [newReply, setNewReply] = useState("");
  const [showLogin, setShowLogin] = useState(false);

  // Format ISO date to locale string
  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(dateString));
  };

  // Fetch post and replies (paginated)
  const fetchPostAndReplies = useCallback(
    async (targetPage = 1) => {
      try {
        if (targetPage === 1) setLoading(true);
        else setLoadingMore(true);

        // Fetch post details
        const postRes = await fetch(`http://localhost:3001/v1/api/posts/${id}`, { headers });
        if (!postRes.ok) {
          router.push("/community"); // Redirect if post not found
          return;
        }
        const postJson = await postRes.json();
        setPost(postJson);

        // Fetch replies
        const repRes = await fetch(
          `http://localhost:3001/v1/api/posts/${id}/replies?page=${targetPage}&limit=5`,
          { headers }
        );
        const repJson = await repRes.json(); // { docs, totalPages }

        if (targetPage === 1) setReplies(repJson.docs);
        else setReplies((prev) => [...prev, ...repJson.docs]);

        setTotalPages(repJson.totalPages);
        setPage(targetPage);
      } catch (error) {
        console.error("Failed to fetch post or replies:", error);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [id, headers, router]
  );

  // Initial fetch & listen to token changes on client
  useEffect(() => {
    useEffect(() => {
  if (token) {
    fetchPostAndReplies(1);
  }
}, [token]);

    // Sync token if it changes in localStorage (optional)
    const handleStorage = () => {
      setToken(localStorage.getItem("token"));
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [fetchPostAndReplies]);

  // Load more replies handler
  const loadMore = () => {
    if (page < totalPages) fetchPostAndReplies(page + 1);
  };

  // Submit new reply
  const submitReply = async (e) => {
    e.preventDefault();
    if (!token) return setShowLogin(true);
    if (!newReply.trim()) return;

    try {
      const res = await fetch(`http://localhost:3001/v1/api/posts/${id}/replies`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify({ content: newReply.trim() }),
      });

      if (res.ok) {
        setNewReply("");
        fetchPostAndReplies(1); // Refresh first page of replies
      } else {
        alert("Failed to post reply");
      }
    } catch (error) {
      alert("Error posting reply");
    }
  };

  if (loading && !post) return <div className="p-8 text-center">Loading…</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Link */}
        <div className="mb-6">
          <Link href="/community" className="text-indigo-600 hover:text-indigo-700">
            ← Back to Community
          </Link>
        </div>

        {/* Post Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="mb-4">
            <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm">
              {post.category}
            </span>
          </div>
          <h1 className="text-2xl font-bold mb-4">{post.title}</h1>
          <p className="prose max-w-none mb-6 whitespace-pre-wrap">{post.content}</p>
          <div className="text-sm text-gray-500">
            by {post.user?.name || "Anonymous"} • {formatDate(post.createdAt)}
          </div>
        </div>

        {/* Replies Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-6">
            Discussion ({replies.length})
          </h2>

          {/* Reply Form */}
          <form onSubmit={submitReply} className="mb-8 space-y-4">
            <textarea
              value={newReply}
              onChange={(e) => setNewReply(e.target.value)}
              rows={3}
              placeholder="Write your reply…"
              className="w-full border rounded-md p-3 focus:ring-2 focus:ring-indigo-500"
              maxLength={1000}
              disabled={loading}
            />
            <button
              disabled={!newReply.trim() || loading}
              className="bg-indigo-600 text-white px-6 py-2 rounded-md disabled:bg-gray-400"
              type="submit"
            >
              Reply anonymously
            </button>
          </form>

          {/* Replies List */}
          <ul className="space-y-6">
            {replies.map((r) => (
              <li key={r._id} className="border-b pb-6 last:border-b-0">
                <div className="text-sm text-gray-500 mb-1">
                  {r.authorHandle || "Anonymous"} • {formatDate(r.createdAt)}
                </div>
                <p className="whitespace-pre-wrap">{r.content}</p>
              </li>
            ))}
          </ul>

          {/* Load More Button */}
          {page < totalPages && (
            <div className="text-center mt-8">
              <button
                onClick={loadMore}
                className="text-indigo-600 hover:text-indigo-700"
                disabled={loadingMore}
              >
                {loadingMore ? "Loading..." : "Load more replies"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-lg max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4">Anonymous sign-in</h3>
            <p className="mb-6 text-sm">
              Sign in (or create an anonymous account) to post replies.
            </p>
            <button
              onClick={() => setShowLogin(false)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md w-full"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
