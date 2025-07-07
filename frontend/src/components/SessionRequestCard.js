'use client';

export default function SessionRequestCard({ request, onAccept, onDecline }) {
  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = now - new Date(timestamp);
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes === 1) return '1 minute ago';
    if (minutes < 60) return `${minutes} minutes ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours === 1) return '1 hour ago';
    return `${hours} hours ago`;
  };

  const getRequestTypeIcon = (type) => {
    switch (type) {
      case 'voice':
        return (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        );
      case 'video':
        return (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        );
      default: // text/chat
        return (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.959 8.959 0 01-4.906-1.459L3 21l2.459-5.094A8.959 8.959 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
          </svg>
        );
    }
  };

  const getRequestTypeLabel = (type) => {
    switch (type) {
      case 'voice': return 'Voice Call';
      case 'video': return 'Video Call';
      default: return 'Text Chat';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="text-blue-600">
            {getRequestTypeIcon(request.sessionType || request.type)}
          </div>
          <span className="text-sm font-medium text-gray-900">
            {getRequestTypeLabel(request.sessionType || request.type)}
          </span>
          {request.priority && request.priority !== 'normal' && (
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getPriorityColor(request.priority)}`}>
              {request.priority.charAt(0).toUpperCase() + request.priority.slice(1)}
            </span>
          )}
        </div>
        <span className="text-xs text-gray-500">
          {formatTimeAgo(request.timestamp)}
        </span>
      </div>

      {/* Request Details */}
      <div className="mb-3">
        <p className="text-sm text-gray-600 mb-2">
          {request.message || 'A user is requesting a therapy session.'}
        </p>
        
        {request.preferences && (
          <div className="flex flex-wrap gap-1">
            {request.preferences.specialties && request.preferences.specialties.map((specialty) => (
              <span key={specialty} className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700">
                {specialty}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex space-x-2">
        <button
          onClick={() => onAccept(request)}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 px-3 rounded-md transition-colors"
        >
          Accept
        </button>
        <button
          onClick={() => onDecline(request)}
          className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 text-sm font-medium py-2 px-3 rounded-md transition-colors"
        >
          Decline
        </button>
      </div>
    </div>
  );
}
