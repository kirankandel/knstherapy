export default function Community() {
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
      title: "Feeling overwhelmed with work stress",
      category: "General Support",
      replies: 12,
      timeAgo: "3 minutes ago",
      anonymous: "User#4A9B"
    },
    {
      title: "Techniques that help with panic attacks",
      category: "Anxiety & Depression",
      replies: 28,
      timeAgo: "7 minutes ago",
      anonymous: "User#8C2D"
    },
    {
      title: "How to communicate better with my partner",
      category: "Relationship Issues",
      replies: 15,
      timeAgo: "15 minutes ago",
      anonymous: "User#1F7E"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Anonymous Community</h1>
          <p className="text-xl text-gray-600 mb-6">
            Connect with others who understand. Share experiences, find support, and heal together.
          </p>
          
          {/* Privacy Badge */}
          <div className="inline-flex items-center bg-indigo-100 text-indigo-800 px-4 py-2 rounded-full">
            <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
            All posts are anonymous • No personal data collected
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
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">Recent Posts</h2>
              <div className="space-y-4">
                {recentPosts.map((post, index) => (
                  <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0 hover:bg-gray-50 p-3 rounded-lg transition-colors cursor-pointer">
                    <h3 className="font-medium text-gray-800 mb-2">{post.title}</h3>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-4">
                        <span className="bg-gray-100 px-2 py-1 rounded">{post.category}</span>
                        <span>by {post.anonymous}</span>
                        <span>{post.replies} replies</span>
                      </div>
                      <span>{post.timeAgo}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* New Post */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <button className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 transition-colors text-lg font-medium mb-4">
                Create Anonymous Post
              </button>
              <p className="text-gray-600 text-sm">
                Share your thoughts, ask questions, or offer support to the community. 
                Your identity remains completely protected.
              </p>
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
    </div>
  );
}
