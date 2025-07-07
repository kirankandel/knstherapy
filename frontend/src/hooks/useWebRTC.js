import { useRef, useState, useCallback, useEffect } from 'react';

export const useWebRTC = ({ 
  sessionId, 
  sessionType, 
  userType, 
  onOffer, 
  onAnswer, 
  onICECandidate 
}) => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const remoteAudioRef = useRef(null); // Dedicated audio element for remote audio
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(sessionType === 'video');
  const [connectionState, setConnectionState] = useState('disconnected');
  const [audioAutoplayBlocked, setAudioAutoplayBlocked] = useState(false);

  // Don't initialize WebRTC for text sessions
  const isWebRTCSession = sessionType === 'audio' || sessionType === 'video';

  // Update video enabled state when session type changes
  useEffect(() => {
    setIsVideoEnabled(sessionType === 'video');
  }, [sessionType]);

  // No audio masking - use original stream
  const applyVoiceMasking = useCallback((stream) => {
    // Return original stream without any modifications
    console.log('✅ Using original audio stream (no masking)');
    return stream;
  }, []);

  // No video anonymization - show original video
  const applyVideoAnonymization = useCallback((videoElement) => {
    // No anonymization applied - show clear video
    console.log('✅ Using original video (no anonymization)');
  }, []);

  // Initialize peer connection
  const initializePeerConnection = useCallback(() => {
    if (peerConnectionRef.current) return peerConnectionRef.current;

    const pcConfig = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    };

    const pc = new RTCPeerConnection(pcConfig);
    peerConnectionRef.current = pc;

    // Handle connection state changes
    pc.onconnectionstatechange = () => {
      setConnectionState(pc.connectionState);
      console.log('Connection state:', pc.connectionState);
    };

    // Handle remote stream
    pc.ontrack = (event) => {
      console.log('📥 Received remote stream');
      const remoteStream = event.streams[0];
      
      if (remoteStream) {
        console.log('🔊 Remote stream tracks:', remoteStream.getTracks().map(t => t.kind));
        
        // Set remote video stream (for video sessions or fallback)
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
          // Show therapist video clearly without anonymization
        }
        
        // Set remote audio stream (for all audio/video sessions)
        if (remoteAudioRef.current && (sessionType === 'audio' || sessionType === 'video')) {
          remoteAudioRef.current.srcObject = remoteStream;
          console.log('🔊 Setting remote audio stream');
          
          // Handle autoplay policies
          remoteAudioRef.current.play().then(() => {
            console.log('✅ Remote audio started playing');
            setAudioAutoplayBlocked(false);
          }).catch(error => {
            console.warn('⚠️ Audio autoplay blocked:', error);
            setAudioAutoplayBlocked(true);
          });
        }
      }
    };

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate && onICECandidate) {
        onICECandidate(event.candidate);
      }
    };

    return pc;
  }, [sessionType, onICECandidate]);

  // Start call (get user media and create offer)
  const startCall = useCallback(async () => {
    try {
      console.log(`🚀 Starting ${sessionType} call...`);
      console.log('Session details:', { sessionType, sessionId, userType });
      
      // Don't start call for text sessions
      if (sessionType === 'text') {
        console.log('✋ Text session - no WebRTC call needed');
        return;
      }
      
      console.log('✅ Proceeding with WebRTC call setup...');
      
      const constraints = {
        audio: sessionType === 'audio' || sessionType === 'video',
        video: sessionType === 'video' ? {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        } : false
      };

      // Ensure at least audio is requested for non-text sessions
      if (!constraints.audio && !constraints.video) {
        constraints.audio = true;
      }

      console.log('WebRTC constraints:', constraints);
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('✅ Got user media stream:', stream.getTracks().map(t => t.kind));
        
        // Use original stream without masking
        const originalStream = stream;
        localStreamRef.current = originalStream;

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = originalStream;
          // Local video without anonymization
        }

        const pc = initializePeerConnection();
        
        // Add tracks to peer connection
        originalStream.getTracks().forEach(track => {
          console.log(`🎵 Adding ${track.kind} track to peer connection`);
          pc.addTrack(track, originalStream);
        });

        // Create and send offer
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        
        if (onOffer) {
          onOffer(offer);
        }

        setIsCallActive(true);
        console.log('Call started successfully');
        
      } catch (error) {
        console.error('Failed to start call:', error);
        
        // Provide user-friendly error messages
        if (error.name === 'NotAllowedError') {
          alert('Camera/microphone access denied. Please allow permissions and try again.');
        } else if (error.name === 'NotFoundError') {
          alert('No camera/microphone found. Please check your devices.');
        } else {
          alert('Failed to start call: ' + error.message);
        }
        throw error;
      }
  }, [sessionType, sessionId, userType, initializePeerConnection, onOffer]);

  // Answer incoming call
  const answerCall = useCallback(async (offer) => {
    try {
      console.log(`Answering ${sessionType} call...`);
      
      const constraints = {
        audio: sessionType === 'audio' || sessionType === 'video',
        video: sessionType === 'video' ? {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        } : false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // Use original stream without masking
      const originalStream = stream;
      localStreamRef.current = originalStream;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = originalStream;
        // Local video without anonymization
      }

      const pc = initializePeerConnection();
      
      // Add tracks to peer connection
      originalStream.getTracks().forEach(track => {
        console.log(`🎵 Adding ${track.kind} track to peer connection (answer)`);
        pc.addTrack(track, originalStream);
      });

      // Set remote offer and create answer
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      
      if (onAnswer) {
        onAnswer(answer);
      }

      setIsCallActive(true);
      console.log('Call answered successfully');
    } catch (error) {
      console.error('Failed to answer call:', error);
      throw error;
    }
  }, [sessionType, initializePeerConnection, onAnswer]);

  // Handle remote answer
  const handleAnswer = useCallback(async (answer) => {
    try {
      const pc = peerConnectionRef.current;
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
        console.log('Remote answer set successfully');
      }
    } catch (error) {
      console.error('Failed to handle answer:', error);
    }
  }, []);

  // Handle ICE candidate
  const handleICECandidate = useCallback(async (candidate) => {
    try {
      const pc = peerConnectionRef.current;
      if (pc) {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
        console.log('ICE candidate added successfully');
      }
    } catch (error) {
      console.error('Failed to add ICE candidate:', error);
    }
  }, []);

  // Toggle mute
  const toggleMute = useCallback(() => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  }, [isMuted]);

  // Toggle video
  const toggleVideo = useCallback(() => {
    if (localStreamRef.current && sessionType === 'video') {
      const videoTracks = localStreamRef.current.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoEnabled(!isVideoEnabled);
    }
  }, [isVideoEnabled, sessionType]);

  // Enable audio playback (call when user interacts)
  const enableAudioPlayback = useCallback(async () => {
    if (remoteAudioRef.current && audioAutoplayBlocked) {
      try {
        await remoteAudioRef.current.play();
        console.log('✅ Audio playback enabled after user interaction');
        setAudioAutoplayBlocked(false);
      } catch (error) {
        console.error('❌ Failed to enable audio playback:', error);
      }
    }
  }, [audioAutoplayBlocked]);

  // End call
  const endCall = useCallback(() => {
    try {
      // Stop local stream
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
        localStreamRef.current = null;
      }

      // Close peer connection
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
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

      setIsCallActive(false);
      setConnectionState('disconnected');
      setIsMuted(false);
      setIsVideoEnabled(sessionType === 'video');
      setAudioAutoplayBlocked(false);
      
      console.log('Call ended');
    } catch (error) {
      console.error('Error ending call:', error);
    }
  }, [sessionType]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      endCall();
    };
  }, [endCall]);

  return {
    localVideoRef,
    remoteVideoRef,
    remoteAudioRef, // Export the audio ref
    isCallActive,
    isMuted,
    isVideoEnabled,
    connectionState,
    audioAutoplayBlocked, // Export autoplay status
    startCall,
    answerCall,
    handleAnswer,
    handleICECandidate,
    toggleMute,
    toggleVideo,
    enableAudioPlayback, // Export audio enable function
    endCall,
  };
};
