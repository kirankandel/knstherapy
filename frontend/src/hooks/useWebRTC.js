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
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(sessionType === 'video');
  const [connectionState, setConnectionState] = useState('disconnected');

  // Apply voice masking filter
  const applyVoiceMasking = useCallback((stream) => {
    if (!stream || sessionType === 'text') return stream;

    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioContext.createMediaStreamSource(stream);
      const gainNode = audioContext.createGain();
      const distortion = audioContext.createWaveShaper();
      const destination = audioContext.createMediaStreamDestination();

      // Create distortion curve for voice masking
      const samples = 44100;
      const curve = new Float32Array(samples);
      const deg = Math.PI / 180;
      for (let i = 0; i < samples; i++) {
        const x = (i * 2) / samples - 1;
        curve[i] = ((3 + 20) * x * 20 * deg) / (Math.PI + 20 * Math.abs(x));
      }
      distortion.curve = curve;
      distortion.oversample = '4x';

      // Apply pitch shifting (simplified)
      gainNode.gain.value = 0.7; // Reduce volume slightly
      
      // Connect audio nodes
      source.connect(gainNode);
      gainNode.connect(distortion);
      distortion.connect(destination);

      // Replace audio track in stream
      const maskedStream = new MediaStream();
      if (stream.getVideoTracks().length > 0) {
        stream.getVideoTracks().forEach(track => maskedStream.addTrack(track));
      }
      destination.stream.getAudioTracks().forEach(track => maskedStream.addTrack(track));

      return maskedStream;
    } catch (error) {
      console.warn('Voice masking failed, using original stream:', error);
      return stream;
    }
  }, [sessionType]);

  // Apply video anonymization
  const applyVideoAnonymization = useCallback((videoElement) => {
    if (!videoElement || sessionType !== 'video') return;

    try {
      // Apply CSS filters for basic anonymization
      videoElement.style.filter = 'blur(2px) contrast(0.8) brightness(0.9)';
      videoElement.style.transform = 'scaleX(-1)'; // Mirror effect
    } catch (error) {
      console.warn('Video anonymization failed:', error);
    }
  }, [sessionType]);

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
      console.log('Received remote stream');
      if (remoteVideoRef.current && event.streams[0]) {
        remoteVideoRef.current.srcObject = event.streams[0];
        if (sessionType === 'video') {
          applyVideoAnonymization(remoteVideoRef.current);
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
  }, [sessionType, onICECandidate, applyVideoAnonymization]);

  // Start call (get user media and create offer)
  const startCall = useCallback(async () => {
    try {
      console.log(`Starting ${sessionType} call...`);
      
      const constraints = {
        audio: sessionType === 'audio' || sessionType === 'video',
        video: sessionType === 'video' ? {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        } : false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // Apply voice masking for anonymity
      const maskedStream = applyVoiceMasking(stream);
      localStreamRef.current = maskedStream;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = maskedStream;
        if (sessionType === 'video') {
          applyVideoAnonymization(localVideoRef.current);
        }
      }

      const pc = initializePeerConnection();
      
      // Add tracks to peer connection
      maskedStream.getTracks().forEach(track => {
        pc.addTrack(track, maskedStream);
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
      throw error;
    }
  }, [sessionType, applyVoiceMasking, applyVideoAnonymization, initializePeerConnection, onOffer]);

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
      
      // Apply voice masking for anonymity
      const maskedStream = applyVoiceMasking(stream);
      localStreamRef.current = maskedStream;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = maskedStream;
        if (sessionType === 'video') {
          applyVideoAnonymization(localVideoRef.current);
        }
      }

      const pc = initializePeerConnection();
      
      // Add tracks to peer connection
      maskedStream.getTracks().forEach(track => {
        pc.addTrack(track, maskedStream);
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
  }, [sessionType, applyVoiceMasking, applyVideoAnonymization, initializePeerConnection, onAnswer]);

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

      setIsCallActive(false);
      setConnectionState('disconnected');
      setIsMuted(false);
      setIsVideoEnabled(sessionType === 'video');
      
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
    isCallActive,
    isMuted,
    isVideoEnabled,
    connectionState,
    startCall,
    answerCall,
    handleAnswer,
    handleICECandidate,
    toggleMute,
    toggleVideo,
    endCall,
  };
};
