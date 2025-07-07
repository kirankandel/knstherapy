class HeartbeatService {
  constructor() {
    this.intervalId = null;
    this.isActive = false;
    this.authToken = null;
    this.userType = null;
    this.onlineUsers = new Set();
  }

  // Start sending heartbeats for authenticated users
  start(token, userType = 'community') {
    if (this.isActive) {
      this.stop(); // Stop existing heartbeat before starting new one
    }

    this.authToken = token;
    this.userType = userType;
    this.isActive = true;

    // Send initial heartbeat
    this.sendHeartbeat();

    // Send heartbeat every 2 minutes (120 seconds) to reduce server load
    this.intervalId = setInterval(() => {
      this.sendHeartbeat();
    }, 120000);

    console.log(`Heartbeat service started for ${userType} user (120s interval)`);
  }

  // Stop sending heartbeats
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isActive = false;
    this.authToken = null;
    this.userType = null;
    console.log('Heartbeat service stopped');
  }

  // Send heartbeat to server
  async sendHeartbeat() {
    if (!this.authToken || !this.isActive) {
      return;
    }

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001/v1';
      const endpoint = this.userType === 'therapist' ? '/therapists/heartbeat' : '/community/heartbeat';
      
      const response = await fetch(`${backendUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.authToken}`,
        },
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          status: 'online',
          isAvailable: true, // Signal that therapist wants to be available
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Heartbeat sent successfully:', data);
      } else {
        console.warn('Heartbeat failed:', response.status);
        
        // If unauthorized, stop heartbeat service
        if (response.status === 401) {
          this.stop();
        }
      }
    } catch (error) {
      console.error('Error sending heartbeat:', error);
    }
  }

  // Check if heartbeat service is active
  isRunning() {
    return this.isActive;
  }

  // Get current user type
  getCurrentUserType() {
    return this.userType;
  }

  // Track online users locally (for UI purposes)
  addOnlineUser(userId) {
    this.onlineUsers.add(userId);
  }

  removeOnlineUser(userId) {
    this.onlineUsers.delete(userId);
  }

  getOnlineUsers() {
    return Array.from(this.onlineUsers);
  }

  isUserOnline(userId) {
    return this.onlineUsers.has(userId);
  }
}

// Create singleton instance
const heartbeatService = new HeartbeatService();

export default heartbeatService;
