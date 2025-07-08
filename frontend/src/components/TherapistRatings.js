'use client';

import { useState, useEffect } from 'react';

export default function TherapistRatings({ therapistId }) {
  const [ratings, setRatings] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!therapistId) return;

    const fetchRatings = async () => {
      try {
        setLoading(true);
        
        // Fetch therapist stats
        const statsResponse = await fetch(`http://localhost:3001/v1/ratings/therapist/${therapistId}/stats`);
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats(statsData);
        }

        // Fetch recent ratings
        const ratingsResponse = await fetch(`http://localhost:3001/v1/ratings/therapist/${therapistId}?limit=5&sortBy=createdAt:desc`);
        if (ratingsResponse.ok) {
          const ratingsData = await ratingsResponse.json();
          setRatings(ratingsData.results || []);
        }
      } catch (err) {
        setError('Failed to load ratings');
        console.error('Error fetching ratings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRatings();
  }, [therapistId]);

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Ratings</h3>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Ratings</h3>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Ratings</h3>
      
      {/* Rating Stats */}
      {stats && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-gray-900">
                {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : 'N/A'}
              </span>
              <span className="text-xl text-yellow-400 ml-2">⭐</span>
            </div>
            <div className="text-sm text-gray-600">
              {stats.totalRatings} rating{stats.totalRatings !== 1 ? 's' : ''}
            </div>
          </div>
          
          {/* Rating Distribution */}
          {stats.totalRatings > 0 && (
            <div className="space-y-1">
              {[5, 4, 3, 2, 1].map((star) => (
                <div key={star} className="flex items-center text-xs">
                  <span className="w-3 text-gray-600">{star}</span>
                  <span className="text-yellow-400 mx-1">⭐</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2 mx-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full"
                      style={{
                        width: `${stats.totalRatings > 0 
                          ? (stats.ratingDistribution[star] / stats.totalRatings) * 100 
                          : 0}%`
                      }}
                    ></div>
                  </div>
                  <span className="w-8 text-gray-600">
                    {stats.ratingDistribution[star] || 0}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Recent Ratings */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3">Recent Feedback</h4>
        {ratings.length === 0 ? (
          <p className="text-gray-500 text-sm">No ratings yet</p>
        ) : (
          <div className="space-y-3">
            {ratings.map((rating) => (
              <div key={rating.id} className="border-l-4 border-blue-200 pl-3 py-2">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center">
                    <span className="text-yellow-400">
                      {'⭐'.repeat(rating.rating)}
                    </span>
                    <span className="text-gray-400 ml-1">
                      {'⭐'.repeat(5 - rating.rating)}
                    </span>
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <span className="mr-2">
                      {rating.sessionType === 'text' && '💬'}
                      {rating.sessionType === 'audio' && '🎤'}
                      {rating.sessionType === 'video' && '📹'}
                    </span>
                    <span>
                      {new Date(rating.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                {rating.comment && (
                  <p className="text-sm text-gray-700 mt-1">{rating.comment}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
