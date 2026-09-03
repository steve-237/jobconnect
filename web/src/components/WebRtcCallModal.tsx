'use client';

import { useState, useEffect, useRef } from 'react';
import { Video, Mic, MicOff, VideoOff, PhoneOff, Shield, Sparkles } from 'lucide-react';

interface WebRtcCallModalProps {
  partnerName: string;
  onClose: () => void;
}

export default function WebRtcCallModal({
  partnerName,
  onClose,
}: WebRtcCallModalProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isCallActive, setIsCallActive] = useState(true);

  const localVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Timer for call duration
    const interval = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    // Get user camera/mic stream
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then((stream) => {
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
        })
        .catch((err) => {
          console.warn('Camera access not granted or unavailable:', err);
        });
    }

    return () => {
      clearInterval(interval);
      // Stop stream tracks
      if (localVideoRef.current && localVideoRef.current.srcObject) {
        const stream = localVideoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-lg animate-in fade-in duration-200">
      <div className="bg-[#121212] border border-white/15 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col relative">
        {/* Header */}
        <div className="p-4 bg-white/5 border-b border-white/10 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                Entretien Vidéo WebRTC — {partnerName}
                <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  HD Crypté 🔒
                </span>
              </h4>
              <span className="text-xs text-muted-foreground font-mono">
                {formatTime(callDuration)}
              </span>
            </div>
          </div>
        </div>

        {/* Video Area */}
        <div className="relative bg-black h-80 sm:h-96 flex items-center justify-center overflow-hidden">
          {/* Main Remote Video Placeholder */}
          <div className="text-center p-6 space-y-3">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-primary to-purple-600 flex items-center justify-center text-white text-3xl font-extrabold mx-auto shadow-2xl animate-pulse">
              {partnerName.charAt(0)}
            </div>
            <p className="text-sm font-bold text-white">{partnerName}</p>
            <span className="text-xs text-emerald-400 font-semibold flex items-center justify-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Entretien en cours via JobConnect
            </span>
          </div>

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
            onClick={onClose}
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
