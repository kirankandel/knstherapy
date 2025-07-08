const mediasoup = require('mediasoup');
const config = require('../config/config');

class MediaSoupService {
  constructor() {
    this.worker = null;
    this.router = null;
    this.transports = new Map(); // transportId -> transport
    this.producers = new Map(); // producerId -> producer
    this.consumers = new Map(); // consumerId -> consumer
    this.sessions = new Map(); // sessionId -> { userType: transport, therapistType: transport, producers: [], consumers: [] }
  }

  async initialize() {
    try {
      console.log('🔧 Initializing MediaSoup worker...');
      
      // Create a MediaSoup worker
      this.worker = await mediasoup.createWorker({
        logLevel: 'warn',
        logTags: [
          'info',
          'ice',
          'dtls',
          'rtp',
          'srtp',
          'rtcp',
        ],
        rtcMinPort: 10000,
        rtcMaxPort: 10100,
      });

      this.worker.on('died', () => {
        console.error('❌ MediaSoup worker died, exiting in 2 seconds... [pid:%d]', this.worker.pid);
        setTimeout(() => process.exit(1), 2000);
      });

      // Create a router
      this.router = await this.worker.createRouter({
        mediaCodecs: [
          {
            kind: 'audio',
            mimeType: 'audio/opus',
            clockRate: 48000,
            channels: 2,
          },
          {
            kind: 'video',
            mimeType: 'video/VP8',
            clockRate: 90000,
            parameters: {
              'x-google-start-bitrate': 1000,
            },
          },
          {
            kind: 'video',
            mimeType: 'video/VP9',
            clockRate: 90000,
            parameters: {
              'profile-id': 2,
              'x-google-start-bitrate': 1000,
            },
          },
          {
            kind: 'video',
            mimeType: 'video/h264',
            clockRate: 90000,
            parameters: {
              'packetization-mode': 1,
              'profile-level-id': '4d0032',
              'level-asymmetry-allowed': 1,
              'x-google-start-bitrate': 1000,
            },
          },
          {
            kind: 'video',
            mimeType: 'video/h264',
            clockRate: 90000,
            parameters: {
              'packetization-mode': 1,
              'profile-level-id': '42e01f',
              'level-asymmetry-allowed': 1,
              'x-google-start-bitrate': 1000,
            },
          },
        ],
      });

      console.log('✅ MediaSoup worker and router initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize MediaSoup:', error);
      return false;
    }
  }

  getRouterRtpCapabilities() {
    if (!this.router) {
      throw new Error('MediaSoup router not initialized');
    }
    return this.router.rtpCapabilities;
  }

  async createWebRtcTransport(sessionId, userType, direction) {
    try {
      if (!this.router) {
        throw new Error('MediaSoup router not initialized');
      }

      console.log(`🚀 Creating WebRTC transport for session ${sessionId}, user ${userType}, direction ${direction}`);

      const transport = await this.router.createWebRtcTransport({
        listenIps: [
          {
            ip: '127.0.0.1',
            announcedIp: null, // Use null for localhost
          },
        ],
        enableUdp: true,
        enableTcp: true,
        preferUdp: true,
      });

      // Store transport
      this.transports.set(transport.id, transport);

      // Initialize session if not exists
      if (!this.sessions.has(sessionId)) {
        this.sessions.set(sessionId, {
          user: { sendTransport: null, recvTransport: null },
          therapist: { sendTransport: null, recvTransport: null },
          producers: [],
          consumers: [],
        });
      }

      // Store transport in session
      const session = this.sessions.get(sessionId);
      if (direction === 'send') {
        session[userType].sendTransport = transport;
      } else {
        session[userType].recvTransport = transport;
      }

      transport.on('dtlsstatechange', (dtlsState) => {
        if (dtlsState === 'closed') {
          transport.close();
          this.transports.delete(transport.id);
        }
      });

      transport.on('close', () => {
        console.log('🔚 Transport closed:', transport.id);
        this.transports.delete(transport.id);
      });

      return {
        id: transport.id,
        iceParameters: transport.iceParameters,
        iceCandidates: transport.iceCandidates,
        dtlsParameters: transport.dtlsParameters,
      };
    } catch (error) {
      console.error('❌ Failed to create WebRTC transport:', error);
      throw error;
    }
  }

  async connectWebRtcTransport(transportId, dtlsParameters) {
    try {
      const transport = this.transports.get(transportId);
      if (!transport) {
        throw new Error(`Transport ${transportId} not found`);
      }

      await transport.connect({ dtlsParameters });
      console.log('✅ Transport connected:', transportId);
    } catch (error) {
      console.error('❌ Failed to connect transport:', error);
      throw error;
    }
  }

  async produce(sessionId, transportId, kind, rtpParameters, userType) {
    try {
      const transport = this.transports.get(transportId);
      if (!transport) {
        throw new Error(`Transport ${transportId} not found`);
      }

      const producer = await transport.produce({
        kind,
        rtpParameters,
      });

      // Store producer
      this.producers.set(producer.id, producer);

      // Add to session
      const session = this.sessions.get(sessionId);
      if (session) {
        session.producers.push({
          id: producer.id,
          kind,
          userType,
        });
      }

      producer.on('transportclose', () => {
        console.log('🔚 Producer transport closed:', producer.id);
        this.producers.delete(producer.id);
      });

      console.log(`✅ Producer created: ${producer.id} (${kind}) for ${userType}`);
      return { id: producer.id };
    } catch (error) {
      console.error('❌ Failed to create producer:', error);
      throw error;
    }
  }

  async consume(sessionId, transportId, producerId, rtpCapabilities, userType) {
    try {
      const transport = this.transports.get(transportId);
      if (!transport) {
        throw new Error(`Transport ${transportId} not found`);
      }

      const producer = this.producers.get(producerId);
      if (!producer) {
        throw new Error(`Producer ${producerId} not found`);
      }

      if (!this.router.canConsume({
        producerId,
        rtpCapabilities,
      })) {
        throw new Error('Cannot consume producer');
      }

      const consumer = await transport.consume({
        producerId,
        rtpCapabilities,
        paused: true, // Start paused
      });

      // Store consumer
      this.consumers.set(consumer.id, consumer);

      // Add to session
      const session = this.sessions.get(sessionId);
      if (session) {
        session.consumers.push({
          id: consumer.id,
          producerId,
          userType,
        });
      }

      consumer.on('transportclose', () => {
        console.log('🔚 Consumer transport closed:', consumer.id);
        this.consumers.delete(consumer.id);
      });

      consumer.on('producerclose', () => {
        console.log('🔚 Consumer producer closed:', consumer.id);
        this.consumers.delete(consumer.id);
      });

      console.log(`✅ Consumer created: ${consumer.id} for producer ${producerId}`);
      return {
        id: consumer.id,
        producerId,
        kind: consumer.kind,
        rtpParameters: consumer.rtpParameters,
      };
    } catch (error) {
      console.error('❌ Failed to create consumer:', error);
      throw error;
    }
  }

  async resumeConsumer(consumerId) {
    try {
      const consumer = this.consumers.get(consumerId);
      if (!consumer) {
        throw new Error(`Consumer ${consumerId} not found`);
      }

      await consumer.resume();
      console.log('✅ Consumer resumed:', consumerId);
    } catch (error) {
      console.error('❌ Failed to resume consumer:', error);
      throw error;
    }
  }

  getProducersForSession(sessionId, requestingUserType) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return [];
    }

    // Return producers from the other user type
    return session.producers.filter(producer => producer.userType !== requestingUserType);
  }

  cleanup() {
    if (this.worker) {
      this.worker.close();
    }
  }
}

// Create singleton instance
const mediaSoupService = new MediaSoupService();

module.exports = mediaSoupService;
