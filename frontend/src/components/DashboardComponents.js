'use client';

export const MetricCard = ({ 
  title, 
  value, 
  subtitle, 
  icon, 
  trend, 
  trendValue, 
  color = 'blue' 
}) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    red: 'bg-red-50 text-red-600 border-red-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
  };

  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-gray-600',
  };

  return (
    <div className={`rounded-lg border-2 p-6 ${colorClasses[color]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-70">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
          {subtitle && (
            <p className="text-sm opacity-60 mt-1">{subtitle}</p>
          )}
        </div>
        {icon && (
          <div className="text-4xl opacity-70">
            {icon}
          </div>
        )}
      </div>
      {trend && (
        <div className={`flex items-center mt-3 text-sm ${trendColors[trend]}`}>
          <span className="mr-1">
            {trend === 'up' && '↗️'}
            {trend === 'down' && '↘️'}
            {trend === 'neutral' && '➡️'}
          </span>
          <span>{trendValue}</span>
        </div>
      )}
    </div>
  );
};

export const RecentFeedbackCard = ({ feedback }) => {
  const getRatingStars = (rating) => {
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  const getSessionTypeIcon = (type) => {
    switch (type) {
      case 'text': return '💬';
      case 'audio': return '🎤';
      case 'video': return '📹';
      default: return '💭';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Recent Feedback</h3>
        <span className="text-sm text-gray-500">Latest reviews</span>
      </div>
      
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {feedback && feedback.length > 0 ? (
          feedback.map((item, index) => (
            <div key={index} className="border-l-4 border-blue-200 pl-4 py-2">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-sm">
                    {getSessionTypeIcon(item.sessionType)} {item.sessionType}
                  </span>
                  <span className="text-lg">{getRatingStars(item.rating)}</span>
                </div>
                <span className="text-xs text-gray-500">
                  {formatDate(item.createdAt)}
                </span>
              </div>
              {item.comment && (
                <p className="text-sm text-gray-700 italic">
                  &ldquo;{item.comment}&rdquo;
                </p>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">💭</div>
            <p>No feedback available yet</p>
            <p className="text-xs">Complete sessions to receive ratings</p>
          </div>
        )}
      </div>
    </div>
  );
};

export const StatsOverview = ({ analytics }) => {
  if (!analytics) return null;

  const { performanceMetrics, sessionTypeStats } = analytics;
  
  const totalVideoSessions = sessionTypeStats?.video?.count || 0;
  const totalAudioSessions = sessionTypeStats?.audio?.count || 0;
  const totalTextSessions = sessionTypeStats?.text?.count || 0;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <MetricCard
        title="Total Sessions"
        value={performanceMetrics.totalSessions}
        subtitle="All time"
        icon="📊"
        color="blue"
      />
      
      <MetricCard
        title="Average Rating"
        value={`${performanceMetrics.averageRating}/5`}
        subtitle={`${performanceMetrics.satisfactionRate}% satisfaction`}
        icon="⭐"
        color="yellow"
        trend={performanceMetrics.averageRating >= 4 ? 'up' : performanceMetrics.averageRating >= 3 ? 'neutral' : 'down'}
        trendValue={`${performanceMetrics.averageRating >= 4 ? 'Excellent' : performanceMetrics.averageRating >= 3 ? 'Good' : 'Needs improvement'}`}
      />
      
      <MetricCard
        title="Recent Sessions"
        value={performanceMetrics.recentSessions}
        subtitle="Last 30 days"
        icon="📈"
        color="green"
      />
      
      <MetricCard
        title="Response Rate"
        value={`${performanceMetrics.responseRate}%`}
        subtitle="Client feedback"
        icon="💬"
        color="purple"
        trend="up"
        trendValue="Active engagement"
      />
    </div>
  );
};

export const SessionTypeBreakdown = ({ sessionTypeStats }) => {
  const totalSessions = Object.values(sessionTypeStats || {}).reduce((sum, stat) => sum + (stat.count || 0), 0);
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Session Type Breakdown</h3>
      
      <div className="space-y-4">
        {Object.entries(sessionTypeStats || {}).map(([type, stats]) => {
          const percentage = totalSessions > 0 ? Math.round((stats.count / totalSessions) * 100) : 0;
          const icon = type === 'text' ? '💬' : type === 'audio' ? '🎤' : '📹';
          const color = type === 'text' ? 'blue' : type === 'audio' ? 'green' : 'purple';
          
          return (
            <div key={type} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{icon}</span>
                <div>
                  <p className="font-medium capitalize">{type} Sessions</p>
                  <p className="text-sm text-gray-500">
                    Avg. rating: {stats.averageRating}/5
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold">{stats.count}</p>
                <p className="text-sm text-gray-500">{percentage}%</p>
              </div>
            </div>
          );
        })}
        
        {totalSessions === 0 && (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">📋</div>
            <p>No sessions completed yet</p>
            <p className="text-xs">Start accepting sessions to see breakdown</p>
          </div>
        )}
      </div>
    </div>
  );
};

export const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

export const ErrorMessage = ({ message, onRetry }) => (
  <div className="text-center p-8">
    <div className="text-4xl mb-4">⚠️</div>
    <p className="text-red-600 mb-4">{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        Try Again
      </button>
    )}
  </div>
);
