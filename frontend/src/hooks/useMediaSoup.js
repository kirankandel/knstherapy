import { useRef, useState, useCallback, useEffect } from 'react';
import * as mediasoupClient from 'mediasoup-client';

export const useMediaSoup = ({ 
  sessionId, 
  sessionType, 
  userType,
  onConnectionStateChange 
}) => {
  // MediaSoup refs
  const deviceRef = useRef(null);
  const sendTransportRef = useRef(null);
  const recvTransportRef = useRef(null);
  const producerRef = useRef(null);
  const videoProducerRef = useRef(null);
  const audioProducerRef = useRef(null);
  const consumerRef = useRef(null);
  const videoConsumerRef = useRef(null);
  const audioConsumerRef = useRef(null);

  // Video elements
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const remoteAudioRef = useRef(null);

  // State
  const [isConnected, setIsConnected] = useState(false);
  const [isProducing, setIsProducing] = useState(false);
  const [isConsuming, setIsConsuming] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(sessionType === 'video');
  const [connectionState, setConnectionState] = useState('disconnected');
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState(new Map());
  const [isCallActive, setIsCallActive] = useState(false);
  const [isEnding, setIsEnding] = useState(false);

  // MediaSoup server API base URL
  const MEDIASOUP_API_BASE = 'http://localhost:3001/v1/mediasoup';

  // Update video enabled state when session type changes
  useEffect(() => {
    setIsVideoEnabled(sessionType === 'video');
  }, [sessionType]);

  // Initialize MediaSoup device
  const initializeDevice = useCallback(async () => {
    try {
      console.log('🔧 Initializing MediaSoup device...');
      
      if (!deviceRef.current) {
        deviceRef.current = new mediasoupClient.Device();
      }

      // Check if device is already loaded
      if (deviceRef.current.loaded) {
        console.log('✅ MediaSoup device already loaded');
        return true;
      }

      // Get router RTP capabilities from server
      console.log('📡 Fetching router capabilities from', `${MEDIASOUP_API_BASE}/router-capabilities`);
      
      let response;
      try {
        response = await fetch(`${MEDIASOUP_API_BASE}/router-capabilities`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (fetchError) {
        console.error('⚠️ Network error while contacting MediaSoup server:', fetchError);
        throw new Error(`Cannot connect to MediaSoup server: ${fetchError.message}`);
      }

      if (!response.ok) {
        if (response.status === 404) {
          console.error('⚠️ MediaSoup API endpoint not found (404)');
          throw new Error('MediaSoup service is not available on the server');
        }
        throw new Error(`Failed to get router capabilities: ${response.status} ${response.statusText}`);
      }

      const routerRtpCapabilities = await response.json();
      console.log('📡 Router RTP capabilities:', routerRtpCapabilities);

      // Load device with router capabilities
      await deviceRef.current.load({ routerRtpCapabilities });
      console.log('✅ MediaSoup device loaded successfully');
      
      setConnectionState('initialized');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize MediaSoup device:', error);
      setConnectionState('failed');
      // Propagate the error message up
      throw error;
    }
  }, []);

  // Create send transport
  const createSendTransport = useCallback(async () => {
    try {
      console.log('📤 Creating send transport...');

      const response = await fetch(`${MEDIASOUP_API_BASE}/create-transport`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          direction: 'send',
          userType
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to create send transport: ${response.statusText}`);
      }

      const transportParams = await response.json();
      console.log('📤 Send transport params:', transportParams);

      // Create WebRTC send transport
      sendTransportRef.current = deviceRef.current.createSendTransport({
        id: transportParams.id,
        iceParameters: transportParams.iceParameters,
        iceCandidates: transportParams.iceCandidates,
        dtlsParameters: transportParams.dtlsParameters,
        sctpParameters: transportParams.sctpParameters,
        iceServers: [],
      });

      // Handle transport connect
      sendTransportRef.current.on('connect', async ({ dtlsParameters }, callback, errback) => {
        try {
          console.log('📤 Send transport connecting...');
          
          const connectResponse = await fetch(`${MEDIASOUP_API_BASE}/connect-transport`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sessionId,
              transportId: sendTransportRef.current.id,
              dtlsParameters,
              userType
            })
          });

          if (!connectResponse.ok) {
            throw new Error(`Failed to connect send transport: ${connectResponse.statusText}`);
          }

          console.log('✅ Send transport connected');
          callback();
        } catch (error) {
          console.error('❌ Send transport connect error:', error);
          errback(error);
        }
      });

      // Handle produce
      sendTransportRef.current.on('produce', async ({ kind, rtpParameters, appData }, callback, errback) => {
        try {
          console.log(`📤 Producing ${kind}...`);
          
          const produceResponse = await fetch(`${MEDIASOUP_API_BASE}/produce`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sessionId,
              transportId: sendTransportRef.current.id,
              kind,
              rtpParameters,
              userType,
              appData
            })
          });

          if (!produceResponse.ok) {
            throw new Error(`Failed to produce ${kind}: ${produceResponse.statusText}`);
          }

          const { producerId } = await produceResponse.json();
          console.log(`✅ ${kind} producer created:`, producerId);
          
          callback({ id: producerId });
        } catch (error) {
          console.error(`❌ ${kind} produce error:`, error);
          errback(error);
        }
      });

      return sendTransportRef.current;
    } catch (error) {
      console.error('❌ Failed to create send transport:', error);
      throw error;
    }
  }, [sessionId, userType]);

  // Create receive transport
  const createRecvTransport = useCallback(async () => {
    try {
      console.log('📥 Creating receive transport...');

      const response = await fetch(`${MEDIASOUP_API_BASE}/create-transport`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          direction: 'recv',
          userType
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to create receive transport: ${response.statusText}`);
      }

      const transportParams = await response.json();
      console.log('📥 Receive transport params:', transportParams);

      // Create WebRTC receive transport
      recvTransportRef.current = deviceRef.current.createRecvTransport({
        id: transportParams.id,
        iceParameters: transportParams.iceParameters,
        iceCandidates: transportParams.iceCandidates,
        dtlsParameters: transportParams.dtlsParameters,
        sctpParameters: transportParams.sctpParameters,
        iceServers: [],
      });

      // Handle transport connect
      recvTransportRef.current.on('connect', async ({ dtlsParameters }, callback, errback) => {
        try {
          console.log('📥 Receive transport connecting...');
          
          const connectResponse = await fetch(`${MEDIASOUP_API_BASE}/connect-transport`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sessionId,
              transportId: recvTransportRef.current.id,
              dtlsParameters,
              userType
            })
          });

          if (!connectResponse.ok) {
            throw new Error(`Failed to connect receive transport: ${connectResponse.statusText}`);
          }

          console.log('✅ Receive transport connected');
          callback();
        } catch (error) {
          console.error('❌ Receive transport connect error:', error);
          errback(error);
        }
      });

      return recvTransportRef.current;
    } catch (error) {
      console.error('❌ Failed to create receive transport:', error);
      throw error;
    }
  }, [sessionId, userType]);

  // Start producing media
  const startProducing = useCallback(async () => {
    try {
      // Check if we should abort early
      if (isEnding) {
        console.log('⚠️ Aborting startProducing: call is ending');
        return;
      }

      console.log(`🎬 Starting to produce ${sessionType} media...`);

      // Get user media
      const constraints = {
        audio: sessionType === 'audio' || sessionType === 'video',
        video: sessionType === 'video' ? {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 },
          facingMode: 'user'
        } : false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setLocalStream(stream);

      // Set local video
      if (localVideoRef.current && sessionType === 'video') {
        localVideoRef.current.srcObject = stream;
      }

      // Create send transport if not exists
      if (!sendTransportRef.current) {
        await createSendTransport();
      }

      // Check if transport is still valid and not closed
      if (!sendTransportRef.current || sendTransportRef.current.closed) {
        throw new Error('Send transport is closed or unavailable');
      }

      // Produce audio
      if (stream.getAudioTracks().length > 0) {
        const audioTrack = stream.getAudioTracks()[0];
        audioProducerRef.current = await sendTransportRef.current.produce({
          track: audioTrack,
          codecOptions: {
            opusStereo: true,
            opusDtx: true,
          }
        });
        console.log('🎤 Audio producer created:', audioProducerRef.current.id);
      }

      // Produce video (if video session)
      if (sessionType === 'video' && stream.getVideoTracks().length > 0) {
        const videoTrack = stream.getVideoTracks()[0];
        videoProducerRef.current = await sendTransportRef.current.produce({
          track: videoTrack,
          codecOptions: {
            videoGoogleStartBitrate: 1000
          }
        });
        console.log('📹 Video producer created:', videoProducerRef.current.id);
      }

      setIsProducing(true);
      setConnectionState('producing');
      console.log('✅ Started producing media successfully');

    } catch (error) {
      console.error('❌ Failed to start producing:', error);
      throw error;
    }
  }, [sessionType, createSendTransport, isEnding]);

  // Start consuming media
  const startConsuming = useCallback(async () => {
    try {
      console.log('🎧 Starting to consume remote media...');

      // Create receive transport if not exists
      if (!recvTransportRef.current) {
        await createRecvTransport();
      }

      // Get available producers from server
      const response = await fetch(`${MEDIASOUP_API_BASE}/get-producers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, userType })
      });

      if (!response.ok) {
        throw new Error(`Failed to get producers: ${response.statusText}`);
      }

      const { producers } = await response.json();
      console.log('📋 Available producers:', producers);

      // Consume each producer
      for (const producer of producers) {
        await consumeProducerRef.current(producer.id, producer.kind);
      }

      setIsConsuming(true);
      setConnectionState('consuming');
      console.log('✅ Started consuming media successfully');

    } catch (error) {
      console.error('❌ Failed to start consuming:', error);
      throw error;
    }
  }, [sessionId, userType, createRecvTransport]);

  // Create references for functions to break circular dependencies
  const consumeProducerRef = useRef(null);

  // Consume a specific producer
  const consumeProducer = useCallback(async (producerId, kind) => {
    try {
      console.log(`🎧 Consuming ${kind} producer:`, producerId);

      // Get consumer parameters
      const response = await fetch(`${MEDIASOUP_API_BASE}/consume`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          transportId: recvTransportRef.current.id,
          producerId,
          rtpCapabilities: deviceRef.current.rtpCapabilities,
          userType
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to consume ${kind}: ${response.statusText}`);
      }

      const consumerParams = await response.json();
      console.log(`📥 ${kind} consumer params:`, consumerParams);

      // Create consumer
      const consumer = await recvTransportRef.current.consume({
        id: consumerParams.id,
        producerId: consumerParams.producerId,
        kind: consumerParams.kind,
        rtpParameters: consumerParams.rtpParameters,
      });

      // Store consumer reference
      if (kind === 'video') {
        videoConsumerRef.current = consumer;
        // Set remote video
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = new MediaStream([consumer.track]);
        }
      } else if (kind === 'audio') {
        audioConsumerRef.current = consumer;
        // Set remote audio
        if (remoteAudioRef.current) {
          remoteAudioRef.current.srcObject = new MediaStream([consumer.track]);
        }
      }

      // Resume consumer
      await fetch(`${MEDIASOUP_API_BASE}/resume-consumer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          consumerId: consumer.id,
          userType
        })
      });

      console.log(`✅ ${kind} consumer created and resumed:`, consumer.id);
      return consumer;

    } catch (error) {
      console.error(`❌ Failed to consume ${kind} producer:`, error);
      throw error;
    }
  }, [sessionId, userType]);

  // Assign the consumeProducer function to the ref to break circular dependencies
  useEffect(() => {
    consumeProducerRef.current = consumeProducer;
  }, [consumeProducer]);  // Connect to MediaSoup
  const connect = useCallback(async () => {
    try {
      // Don't reconnect if already connected
      if (isConnected) {
        console.log('✅ Already connected to MediaSoup');
        return;
      }

      console.log('🔗 Connecting to MediaSoup...');
      setConnectionState('connecting');

      // Initialize device
      const deviceInitialized = await initializeDevice();
      if (!deviceInitialized) {
        throw new Error('Failed to initialize MediaSoup device');
      }

      setIsConnected(true);
      setConnectionState('connected');
      console.log('✅ Connected to MediaSoup successfully');

      // Notify parent component
      if (onConnectionStateChange) {
        onConnectionStateChange('connected');
      }

    } catch (error) {
      console.error('❌ Failed to connect to MediaSoup:', error);
      setConnectionState('failed');
      
      if (onConnectionStateChange) {
        onConnectionStateChange('failed');
      }

      throw error;
    }
  }, [isConnected, initializeDevice, onConnectionStateChange]);

  // Start call
  const startCall = useCallback(async () => {
    try {
      // Prevent multiple simultaneous calls or starting a call that's being ended
      if (isCallActive || isEnding) {
        console.log('⚠️ Call already active or ending, skipping startCall');
        return;
      }

      console.log(`🚀 Starting ${sessionType} call with MediaSoup...`);
      setIsCallActive(true);

      try {
        // First check if backend is available
        await fetch(`${MEDIASOUP_API_BASE}/router-capabilities`, {
          method: 'GET',
        });
      } catch (backendError) {
        console.error('⚠️ MediaSoup backend not available:', backendError);
        throw new Error(`MediaSoup service is not available. Please try again later or contact support.`);
      }

      if (!isConnected) {
        await connect();
      }

      // Check if we're still supposed to be active before proceeding
      if (isEnding) {
        console.log('⚠️ Call was ended while connecting, aborting');
        return;
      }

      // Start producing our media
      await startProducing();

      // Check again before consuming
      if (isEnding) {
        console.log('⚠️ Call was ended while producing, aborting');
        return;
      }

      // Start consuming remote media
      await startConsuming();

      // Final check before marking as active
      if (!isEnding) {
        setConnectionState('active');
        console.log('✅ MediaSoup call started successfully');
      }

    } catch (error) {
      console.error('❌ Failed to start MediaSoup call:', error);
      setConnectionState('failed');
      setIsCallActive(false);
      throw error;
    }
  }, [sessionType, isConnected, isCallActive, isEnding, connect, startProducing, startConsuming]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    if (audioProducerRef.current) {
      if (isMuted) {
        audioProducerRef.current.resume();
        console.log('🎤 Audio unmuted');
      } else {
        audioProducerRef.current.pause();
        console.log('🔇 Audio muted');
      }
      setIsMuted(!isMuted);
    }
  }, [isMuted]);

  // Toggle video
  const toggleVideo = useCallback(() => {
    if (videoProducerRef.current && sessionType === 'video') {
      if (isVideoEnabled) {
        videoProducerRef.current.pause();
        console.log('📹 Video disabled');
      } else {
        videoProducerRef.current.resume();
        console.log('📹 Video enabled');
      }
      setIsVideoEnabled(!isVideoEnabled);
    }
  }, [isVideoEnabled, sessionType]);  // End call
  const endCall = useCallback(async () => {
    try {
      console.log('🔚 Ending MediaSoup call...');
      setIsEnding(true);
      
      // Stop local stream
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        setLocalStream(null);
      }

      // Close producers with error handling
      if (audioProducerRef.current) {
        try {
          if (!audioProducerRef.current.closed) {
            audioProducerRef.current.close();
          }
        } catch (error) {
          console.warn('⚠️ Error closing audio producer (already stopped):', error.message);
        }
        audioProducerRef.current = null;
      }
      if (videoProducerRef.current) {
        try {
          if (!videoProducerRef.current.closed) {
            videoProducerRef.current.close();
          }
        } catch (error) {
          console.warn('⚠️ Error closing video producer (already stopped):', error.message);
        }
        videoProducerRef.current = null;
      }

      // Close consumers with error handling
      if (audioConsumerRef.current) {
        try {
          if (!audioConsumerRef.current.closed) {
            audioConsumerRef.current.close();
          }
        } catch (error) {
          console.warn('⚠️ Error closing audio consumer (already stopped):', error.message);
        }
        audioConsumerRef.current = null;
      }
      if (videoConsumerRef.current) {
        try {
          if (!videoConsumerRef.current.closed) {
            videoConsumerRef.current.close();
          }
        } catch (error) {
          console.warn('⚠️ Error closing video consumer (already stopped):', error.message);
        }
        videoConsumerRef.current = null;
      }

      // Close transports with error handling
      if (sendTransportRef.current) {
        try {
          if (!sendTransportRef.current.closed) {
            sendTransportRef.current.close();
          }
        } catch (error) {
          console.warn('⚠️ Error closing send transport (already stopped):', error.message);
        }
        sendTransportRef.current = null;
      }
      if (recvTransportRef.current) {
        try {
          if (!recvTransportRef.current.closed) {
            recvTransportRef.current.close();
          }
        } catch (error) {
          console.warn('⚠️ Error closing receive transport (already stopped):', error.message);
        }
        recvTransportRef.current = null;
      }

      // Clear video elements
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null;
      }
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }
      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = null;
      }

      // Reset state
      setIsConnected(false);
      setIsProducing(false);
      setIsConsuming(false);
      setIsMuted(false);
      setIsVideoEnabled(sessionType === 'video');
      setConnectionState('disconnected');
      setRemoteStreams(new Map());
      setIsCallActive(false);
      setIsEnding(false);

      console.log('✅ MediaSoup call ended');

    } catch (error) {
      console.error('❌ Error ending MediaSoup call:', error);
      // Always reset flags even if there's an error
      setIsCallActive(false);
      setIsEnding(false);
    }
  }, [localStream, sessionType]);

  // Track if we should cleanup on unmount
  const shouldCleanupRef = useRef(false);

  // Update cleanup flag when call becomes active
  useEffect(() => {
    shouldCleanupRef.current = isCallActive;
  }, [isCallActive]);

  // Cleanup on unmount or session/sessionType changes
  useEffect(() => {
    return () => {
      // Use a timeout to avoid cleanup during React's rapid mount/unmount cycles in development
      const cleanup = setTimeout(() => {
        // Only end call if it was active when component unmounted
        if (shouldCleanupRef.current && !isEnding) {
          console.log('🧹 Cleaning up MediaSoup call on unmount...');
          endCall();
        }
      }, 100); // Small delay to avoid cleanup during React's development mode re-mounts

      // Return a cleanup function that clears the timeout if component re-mounts quickly
      return () => clearTimeout(cleanup);
    };
  }, [sessionId, sessionType, endCall, isEnding]);

  return {
    // Refs
    localVideoRef,
    remoteVideoRef,
    remoteAudioRef,
    
    // State
    isConnected,
    isProducing,
    isConsuming,
    isMuted,
    isVideoEnabled,
    connectionState,
    localStream,
    remoteStreams,
    isCallActive,
    isEnding,
    
    // Methods
    connect,
    startCall,
    endCall,
    toggleMute,
    toggleVideo,
    consumeProducer,
  };
};
