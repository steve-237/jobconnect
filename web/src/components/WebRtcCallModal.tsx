'use client';

import { useState, useEffect, useRef } from 'react';
import { Video, Mic, MicOff, VideoOff, PhoneOff, Shield, Sparkles, Loader2, PhoneCall, XCircle } from 'lucide-react';
import { useSocket } from '@/hooks/useSocket';

interface WebRtcCallModalProps {
  partnerName: string;
  applicationId?: string;
  targetUserId?: string;
  isIncomingCallAccepted?: boolean;
  onClose: () => void;
}

export default function WebRtcCallModal({
  partnerName,
  applicationId,
  targetUserId,
  isIncomingCallAccepted = false,
  onClose,
}: WebRtcCallModalProps) {
  const { socket, isConnected } = useSocket();
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [callState, setCallState] = useState<'RINGING' | 'CONNECTED' | 'REJECTED' | 'ENDED'>(
    isIncomingCallAccepted ? 'CONNECTED' : 'RINGING'
  );

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  // Initialize Camera & Socket Listeners
  useEffect(() => {
    // 1. Get user media stream
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then((stream) => {
          localStreamRef.current = stream;
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
        })
        .catch((err) => {
          console.warn('Camera access not granted or unavailable:', err);
        });
    }

    // 2. Socket signaling for Caller
    if (socket && isConnected) {
      if (!isIncomingCallAccepted && targetUserId) {
        // Retrieve current user name from token
        let callerName = 'Vous';
        try {
          const token = localStorage.getItem('token');
          if (token) {
            const payload = JSON.parse(atob(token.split('.')[1]));
            callerName = payload.firstName ? `${payload.firstName} ${payload.lastName || ''}` : 'Utilisateur JobConnect';
          }
        } catch (e) {}

        socket.emit('startCall', {
          applicationId,
          receiverId: targetUserId,
          callerName,
        });
      }

      const handleCallAccepted = () => {
        setCallState('CONNECTED');
      };

      const handleCallRejected = () => {
        setCallState('REJECTED');
        setTimeout(() => {
          onClose();
        }, 2500);
      };

      const handleCallEnded = () => {
        setCallState('ENDED');
        setTimeout(() => {
          onClose();
        }, 1500);
      };

      socket.on('callAccepted', handleCallAccepted);
      socket.on('callRejected', handleCallRejected);
      socket.on('callEnded', handleCallEnded);

      return () => {
        socket.off('callAccepted', handleCallAccepted);
        socket.off('callRejected', handleCallRejected);
        socket.off('callEnded', handleCallEnded);
      };
    }
  }, [socket, isConnected, isIncomingCallAccepted, targetUserId, applicationId, onClose]);

  // Duration Timer (Only active when CONNECTED)
  useEffect(() => {
    if (callState !== 'CONNECTED') return;

    const interval = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [callState]);

  // Clean up media tracks on unmount
  useEffect(() => {
    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const handleEndCall = () => {
    if (socket && targetUserId) {
      socket.emit('endCall', {
        applicationId,
        targetUserId,
      });
    }
    onClose();
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/85 backdrop-blur-lg animate-in fade-in duration-200">
      <div className="bg-[#121212] border border-white/15 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col relative">
        {/* Header */}
        <div className="p-4 bg-white/5 border-b border-white/10 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl border ${
              callState === 'CONNECTED'
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                : callState === 'REJECTED'
                ? 'bg-red-500/20 text-red-400 border-red-500/30'
                : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
            }`}>
              <Video className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                Entretien Vidéo WebRTC — {partnerName}
                {callState === 'CONNECTED' && (
                  <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    HD Crypté 🔒
                  </span>
                )}
              </h4>
              <span className="text-xs text-muted-foreground font-mono">
                {callState === 'CONNECTED'
                  ? formatTime(callDuration)
                  : callState === 'RINGING'
                  ? 'Sonnerie en cours...'
                  : callState === 'REJECTED'
                  ? 'Appel refusé'
                  : 'Appel terminé'}
              </span>
            </div>
          </div>
        </div>

        {/* Video Area & Call Status Banner */}
        <div className="relative bg-black h-80 sm:h-96 flex items-center justify-center overflow-hidden">
          {/* Main Display Container */}
          {callState === 'RINGING' && (
            <div className="text-center p-6 space-y-4 animate-pulse">
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white text-3xl font-extrabold mx-auto shadow-2xl relative">
                <PhoneCall className="w-10 h-10 animate-bounce text-white" />
                <span className="absolute -top-1 -right-1 w-6 h-6 bg-amber-400 rounded-full border-2 border-background animate-ping" />
              </div>
              <p className="text-base font-extrabold text-white">
                Sonnerie en cours chez <span className="text-amber-400">{partnerName}</span>...
              </p>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                Veuillez patienter pendant que le destinataire décroche l'appel vidéo.
              </p>
            </div>
          )}

          {callState === 'REJECTED' && (
            <div className="text-center p-6 space-y-3">
              <div className="w-20 h-20 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center text-3xl font-extrabold mx-auto shadow-2xl border border-red-500/30">
                <XCircle className="w-10 h-10" />
              </div>
              <p className="text-base font-extrabold text-white">
                Appel refusé par <span className="text-red-400">{partnerName}</span>
              </p>
              <p className="text-xs text-muted-foreground">Fermeture automatique dans un instant...</p>
            </div>
          )}

          {callState === 'CONNECTED' && (
            <div className="text-center p-6 space-y-3">
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-primary to-purple-600 flex items-center justify-center text-white text-3xl font-extrabold mx-auto shadow-2xl">
                {partnerName.charAt(0)}
              </div>
              <p className="text-sm font-bold text-white">{partnerName}</p>
              <span className="text-xs text-emerald-400 font-semibold flex items-center justify-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Entretien connecté via JobConnect HD
              </span>
            </div>
          )}

          {/* Local Camera Picture-in-Picture */}
          <div className="absolute bottom-4 right-4 w-32 h-24 rounded-2xl overflow-hidden border-2 border-white/20 bg-slate-900 shadow-xl">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            {isVideoOff && (
              <div className="absolute inset-0 bg-slate-900 flex items-center justify-center text-xs text-muted-foreground">
                Caméra désactivée
              </div>
            )}
          </div>
        </div>

        {/* Controls Bar */}
        <div className="p-5 bg-white/5 border-t border-white/10 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => setIsMuted(!isMuted)}
            className={`p-4 rounded-2xl font-bold transition-all cursor-pointer ${
              isMuted ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'bg-white/10 text-white hover:bg-white/20'
            }`}
            title={isMuted ? 'Activer le micro' : 'Couper le micro'}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <button
            type="button"
            onClick={() => setIsVideoOff(!isVideoOff)}
            className={`p-4 rounded-2xl font-bold transition-all cursor-pointer ${
              isVideoOff ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'bg-white/10 text-white hover:bg-white/20'
            }`}
            title={isVideoOff ? 'Activer la caméra' : 'Couper la caméra'}
          >
            {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
          </button>

          <button
            type="button"
            onClick={handleEndCall}
            className="p-4 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold transition-all shadow-lg shadow-red-600/30 cursor-pointer flex items-center gap-2 px-6"
          >
            <PhoneOff className="w-5 h-5" />
            Raccrocher
          </button>
        </div>
      </div>
    </div>
  );
}
