const logger = require('../config/logger');

class TherapistStatusManager {
  constructor() {
    this.therapistQueue = new Map();
    this.activeSessions = new Map();
    this.userQueue = new Map();
  }

  // Set references to the maps from socket.io
  setQueues(therapistQueue, activeSessions, userQueue) {
    this.therapistQueue = therapistQueue;
    this.activeSessions = activeSessions;
    this.userQueue = userQueue;
  }

  // Get currently connected therapists
  getConnectedTherapists() {
    const therapists = [];
    
    for (const [therapistId, therapistData] of this.therapistQueue.entries()) {
      therapists.push({
        therapistId,
        socketId: therapistData.socketId,
        specialties: therapistData.specialties,
        isAvailable: therapistData.isAvailable,
        connectedAt: therapistData.timestamp,
        currentSessionId: this.getTherapistCurrentSession(therapistId),
      });
    }

    return therapists;
  }

  // Get therapist's current session if any
  getTherapistCurrentSession(therapistId) {
    for (const [sessionId, session] of this.activeSessions.entries()) {
      if (session.therapistId === therapistId) {
        return sessionId;
      }
    }
    return null;
  }

  // Get real-time statistics
  getRealTimeStats() {
    const connectedTherapists = this.getConnectedTherapists();
    const availableTherapists = connectedTherapists.filter(t => t.isAvailable);
    const busyTherapists = connectedTherapists.filter(t => !t.isAvailable);
    const waitingUsers = this.userQueue.size;

    return {
      totalOnline: connectedTherapists.length,
      availableForNewSessions: availableTherapists.length,
      busyInSessions: busyTherapists.length,
      waitingUsers,
      activeSessions: this.activeSessions.size,
      connectedTherapists: connectedTherapists.map(t => ({
        id: t.therapistId,
        specialties: t.specialties,
        status: t.isAvailable ? 'available' : 'busy',
        connectedAt: t.connectedAt,
      })),
    };
  }

  // Get available therapists with specific specialties
  getAvailableBySpecialty(specialty) {
    const available = [];
    
    for (const [therapistId, therapistData] of this.therapistQueue.entries()) {
      if (therapistData.isAvailable && 
          (!specialty || therapistData.specialties.includes(specialty))) {
        available.push({
          therapistId,
          specialties: therapistData.specialties,
          connectedAt: therapistData.timestamp,
        });
      }
    }

    return available;
  }
}

// Create singleton instance
const therapistStatusManager = new TherapistStatusManager();

module.exports = therapistStatusManager;
