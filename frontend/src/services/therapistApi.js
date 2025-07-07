const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001/v1';

export class TherapistAPI {
  constructor(token) {
    this.token = token;
    this.lastHeartbeat = 0;
    this.heartbeatThrottle = 10000; // Minimum 10 seconds between heartbeats
  }

  async getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.token}`,
    };
  }

  // Get current therapist status
  async getStatus() {
    try {
      const response = await fetch(`${API_BASE_URL}/therapists/status`, {
        headers: await this.getHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to get therapist status:', error);
      throw error;
    }
  }

  // Update therapist availability
  async updateAvailability(isAvailable) {
    try {
      const response = await fetch(`${API_BASE_URL}/therapists/availability`, {
        method: 'PUT',
        headers: await this.getHeaders(),
        body: JSON.stringify({ isAvailable }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to update availability:', error);
      throw error;
    }
  }

  // Send heartbeat
  async sendHeartbeat(isAvailable = true) {
    // Throttle heartbeat requests
    const now = Date.now();
    if (now - this.lastHeartbeat < this.heartbeatThrottle) {
      console.log('Heartbeat throttled, too recent');
      return { message: 'Heartbeat throttled' };
    }

    try {
      this.lastHeartbeat = now;
      console.log('Sending API heartbeat...');
      
      const response = await fetch(`${API_BASE_URL}/therapists/heartbeat`, {
        method: 'POST',
        headers: await this.getHeaders(),
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          isAvailable,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Heartbeat successful:', result);
      return result;
    } catch (error) {
      console.error('Failed to send heartbeat:', error);
      throw error;
    }
  }

  // Get session requests (for future implementation)
  async getSessionRequests() {
    try {
      const response = await fetch(`${API_BASE_URL}/therapists/session-requests`, {
        headers: await this.getHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to get session requests:', error);
      // Return empty array for now
      return { requests: [] };
    }
  }

  // Accept a session request
  async acceptSessionRequest(requestId) {
    try {
      const response = await fetch(`${API_BASE_URL}/therapists/session-requests/${requestId}/accept`, {
        method: 'POST',
        headers: await this.getHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to accept session request:', error);
      throw error;
    }
  }

  // Decline a session request
  async declineSessionRequest(requestId, reason = '') {
    try {
      const response = await fetch(`${API_BASE_URL}/therapists/session-requests/${requestId}/decline`, {
        method: 'POST',
        headers: await this.getHeaders(),
        body: JSON.stringify({ reason }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to decline session request:', error);
      throw error;
    }
  }

  // Get active sessions
  async getActiveSessions() {
    try {
      const response = await fetch(`${API_BASE_URL}/therapists/active-sessions`, {
        headers: await this.getHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to get active sessions:', error);
      // Return empty array for now
      return { sessions: [] };
    }
  }
}

export default TherapistAPI;
