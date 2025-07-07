'use client';

import { useState } from 'react';

export default function TherapistStatusCard({ 
  isOnline, 
  isConnected, 
  activeSession, 
  onGoOnline, 
  onGoOffline,
  therapistId 
}) {
  const [isLoading, setIsLoading] = useState(false);

  const handleToggleOnline = async () => {
    setIsLoading(true);
    try {
      if (isOnline) {
        await onGoOffline();
      } else {
        await onGoOnline();
      }
    } catch (error) {
      console.error('Error toggling online status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = () => {
    if (!isConnected) return 'bg-gray-500';
    if (activeSession) return 'bg-yellow-500';
    if (isOnline) return 'bg-green-500';
    return 'bg-red-500';
  };

  const getStatusText = () => {
    if (!isConnected) return 'Disconnected';
    if (activeSession) return 'In Session';
    if (isOnline) return 'Available';
    return 'Offline';
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Status</h3>
      
      {/* Status Indicator */}
      <div className="flex items-center mb-4">
        <div className={`w-3 h-3 rounded-full ${getStatusColor()} mr-3`}></div>
        <span className="text-sm font-medium text-gray-900">{getStatusText()}</span>
      </div>

      {/* Connection Status */}
      <div className="mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Connection:</span>
          <span className={isConnected ? 'text-green-600' : 'text-red-600'}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
        {therapistId && (
          <div className="flex justify-between text-sm mt-1">
            <span className="text-gray-500">Therapist ID:</span>
            <span className="text-gray-900 font-mono text-xs">
              {therapistId.substring(0, 8)}...
            </span>
          </div>
        )}
      </div>

      {/* Online/Offline Toggle */}
      <div className="mb-4">
        <button
          onClick={handleToggleOnline}
          disabled={isLoading || !isConnected}
          className={`w-full py-2 px-4 rounded-md font-medium text-sm transition-colors ${
            isOnline
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-green-600 hover:bg-green-700 text-white'
          } ${
            (isLoading || !isConnected) ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {isOnline ? 'Going Offline...' : 'Going Online...'}
            </div>
          ) : (
            <>
              {isOnline ? 'Go Offline' : 'Go Online'}
            </>
          )}
        </button>
      </div>

      {/* Session Info */}
      {activeSession && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
          <div className="flex items-center">
            <svg className="h-4 w-4 text-yellow-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm text-yellow-800">
              Session started {activeSession.startTime && new Date(activeSession.startTime).toLocaleTimeString()}
            </span>
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="mt-4 text-xs text-gray-500">
        {!isConnected && 'Please check your internet connection.'}
        {isConnected && !isOnline && 'Go online to receive session requests from users.'}
        {isConnected && isOnline && !activeSession && 'You are available for new sessions.'}
        {activeSession && 'You are currently in an active therapy session.'}
      </div>
    </div>
  );
}
