'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, X, Info } from 'lucide-react';

export interface ToastMessage {
  id: string;
  title?: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export interface ConfirmDialog {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'primary';
  onConfirm: () => void;
}

export function NotificationToast({
  toasts,
  onDismiss,
}: {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}) {
  return (
    <div className="fixed top-5 right-5 z-[100] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border shadow-2xl backdrop-blur-xl animate-in slide-in-from-top-4 duration-300 ${
              isSuccess
                ? 'bg-[#122416]/90 border-emerald-500/40 text-emerald-300'
                : isError
                ? 'bg-[#291214]/90 border-red-500/40 text-red-300'
                : 'bg-[#121929]/90 border-blue-500/40 text-blue-300'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              {isError && <AlertCircle className="w-5 h-5 text-red-400" />}
              {!isSuccess && !isError && <Info className="w-5 h-5 text-blue-400" />}
            </div>

            <div className="flex-1 min-w-0">
              {toast.title && <p className="font-bold text-sm text-foreground mb-0.5">{toast.title}</p>}
              <p className="text-xs font-medium leading-relaxed text-foreground/90">{toast.message}</p>
            </div>

            <button
              onClick={() => onDismiss(toast.id)}
              className="shrink-0 p-1 text-muted-foreground hover:text-white rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

export function ConfirmModal({
  dialog,
  onClose,
}: {
  dialog: ConfirmDialog;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-[#141414] border border-white/10 rounded-3xl w-full max-w-md p-6 shadow-2xl flex flex-col gap-4 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-2xl ${dialog.type === 'danger' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}`}>
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">{dialog.title}</h3>
          </div>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed">{dialog.message}</p>

        <div className="flex items-center justify-end gap-3 mt-2">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-muted-foreground hover:text-white hover:bg-white/10 transition-colors"
          >
            {dialog.cancelText || 'Annuler'}
          </button>
          <button
            onClick={() => {
              dialog.onConfirm();
              onClose();
            }}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white transition-all shadow-lg ${
              dialog.type === 'danger'
                ? 'bg-red-500 hover:bg-red-600 shadow-red-500/25'
                : 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/25'
            }`}
          >
            {dialog.confirmText || 'Confirmer'}
          </button>
        </div>
      </div>
    </div>
  );
}
