'use client';

import { useState, useEffect } from 'react';
import { Phone, PhoneOff, Video, Shield } from 'lucide-react';
import { useSocket } from '@/hooks/useSocket';
import WebRtcCallModal from './WebRtcCallModal';

export interface IncomingCallData {
  applicationId: string;
  callerId: string;
  callerName: string;
  offerSdp?: any;
}

export default function IncomingCallModal() {
  const { socket, isConnected } = useSocket();
  const [incomingCall, setIncomingCall] = useState<IncomingCallData | null>(null);
  const [activeCall, setActiveCall] = useState<IncomingCallData | null>(null);

  useEffect(() => {
    if (socket && isConnected) {
      const handleIncomingCall = (data: IncomingCallData) => {
        setIncomingCall(data);
      };

      const handleCallEnded = () => {
        setIncomingCall(null);
        setActiveCall(null);
      };

      socket.on('incomingCall', handleIncomingCall);
      socket.on('callEnded', handleCallEnded);

      return () => {
        socket.off('incomingCall', handleIncomingCall);
        socket.off('callEnded', handleCallEnded);
      };
    }
  }, [socket, isConnected]);

  const handleAccept = () => {
    if (!incomingCall || !socket) return;
    socket.emit('acceptCall', {
      applicationId: incomingCall.applicationId,
      callerId: incomingCall.callerId,
    });
    setActiveCall(incomingCall);
    setIncomingCall(null);
  };

  const handleReject = () => {
    if (!incomingCall || !socket) return;
    socket.emit('rejectCall', {
      applicationId: incomingCall.applicationId,
      callerId: incomingCall.callerId,
    });
    setIncomingCall(null);
  };

  return (
    <>
      {/* Incoming Call Overlay Banner / Dialog */}
      {incomingCall && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#141417] border border-emerald-500/40 rounded-3xl w-full max-w-md p-6 shadow-2xl flex flex-col items-center text-center space-y-5 animate-in zoom-in-95 duration-200 relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 animate-pulse" />

            {/* Calling Pulse Icon */}
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shadow-xl shadow-emerald-500/20">
                <Video className="w-10 h-10 animate-bounce text-emerald-400" />
              </div>
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-background animate-ping" />
            </div>

            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full inline-block mb-2">
                📞 Appel Visio HD Entrant
              </span>
              <h3 className="text-xl font-extrabold text-white leading-tight">
                {incomingCall.callerName}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Souhaite démarrer un entretien vidéo en direct avec vous.
              </p>
            </div>

            {/* Actions: Accept & Decline */}
            <div className="grid grid-cols-2 gap-4 w-full pt-2">
              <button
                type="button"
                onClick={handleReject}
                className="py-3.5 px-4 rounded-2xl bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <PhoneOff className="w-4 h-4" />
                Refuser
              </button>

              <button
                type="button"
                onClick={handleAccept}
                className="py-3.5 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 cursor-pointer hover:scale-105 active:scale-95"
              >
                <Phone className="w-4 h-4" />
                Décrocher
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Accepted WebRTC Call */}
      {activeCall && (
        <WebRtcCallModal
          partnerName={activeCall.callerName}
          applicationId={activeCall.applicationId}
          targetUserId={activeCall.callerId}
          isIncomingCallAccepted={true}
          onClose={() => {
            if (socket) {
              socket.emit('endCall', {
                applicationId: activeCall.applicationId,
                targetUserId: activeCall.callerId,
              });
            }
            setActiveCall(null);
          }}
        />
      )}
    </>
  );
}
