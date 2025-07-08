"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NewPostPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("General");
  const [token, setToken] = useState("");

//   useEffect(() => {
//     if (typeof window !== "undefined") {
//       const storedToken = localStorage.getItem("token");
//       if (!storedToken) {
//         alert("You must be logged in anonymously to post.");
//         router.push("/community");
//       } else {
//         setToken(storedToken);
//       }
//     }
//   }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    try {
      const res = await fetch("http://localhost:3001/v1/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        //   Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({title, content, category}),
      });
console.log("HTTP Status:", res.status);

      if (res.ok) {
        const data = await res.json();
        router.push(`/community/${data._id}`);
      } else {
        alert("Failed to post question.");
      }
    } catch (err) {
      console.error(err);
      alert("Error posting question.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Ask a Question</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Question title"
          className="w-full border p-3 rounded"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          rows={6}
          placeholder="Describe your question in detail…"
          className="w-full border p-3 rounded"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
        <select
          className="border p-3 rounded"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option>General</option>
          <option>HTML</option>
          <option>CSS</option>
          <option>JavaScript</option>
          <option>Backend</option>
          <option>React</option>
        </select>
        <button
          type="submit"
          className="bg-indigo-600 text-white px-6 py-2 rounded"
        >
          Post Question
        </button>
      </form>
    </div>
  );
}
