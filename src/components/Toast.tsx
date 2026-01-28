'use client';

import { useState, useEffect, createContext, useContext, useCallback, useRef } from 'react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  undoAction?: () => void;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (message: string, type?: Toast['type'], duration?: number) => void;
  addUndoToast: (message: string, onUndo: () => void, duration?: number) => void;
  addActionToast: (message: string, action: { label: string; onClick: () => void }, type?: Toast['type'], duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: Toast['type'] = 'info', duration = 4000) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { id, message, type, duration }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    }
  }, []);

  const addUndoToast = useCallback((message: string, onUndo: () => void, duration = 5000) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { id, message, type: 'info', duration, undoAction: onUndo }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    }
  }, []);

  const addActionToast = useCallback((
    message: string,
    action: { label: string; onClick: () => void },
    type: Toast['type'] = 'info',
    duration = 6000
  ) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { id, message, type, duration, action }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, addUndoToast, addActionToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

function ToastContainer({ toasts, removeToast }: { toasts: Toast[]; removeToast: (id: string) => void }) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const [isExiting, setIsExiting] = useState(false);
  const [progress, setProgress] = useState(100);
  const startTimeRef = useRef(Date.now());
  const animationRef = useRef<number>(undefined);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(onClose, 200);
  };

  const handleUndo = () => {
    if (toast.undoAction) {
      toast.undoAction();
      handleClose();
    }
  };

  const handleAction = () => {
    if (toast.action) {
      toast.action.onClick();
      handleClose();
    }
  };

  // Animate progress bar for undo toasts
  useEffect(() => {
    if (!toast.undoAction || !toast.duration) return;

    const animate = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const remaining = Math.max(0, 100 - (elapsed / toast.duration!) * 100);
      setProgress(remaining);

      if (remaining > 0) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [toast.duration, toast.undoAction]);

  const iconMap = {
    success: 'check_circle',
    error: 'error',
    warning: 'warning',
    info: 'info',
  };

  const colorMap = {
    success: 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/30 dark:border-green-800 dark:text-green-200',
    error: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/30 dark:border-red-800 dark:text-red-200',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/30 dark:border-yellow-800 dark:text-yellow-200',
    info: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-200',
  };

  const iconColorMap = {
    success: 'text-green-500',
    error: 'text-red-500',
    warning: 'text-yellow-500',
    info: 'text-blue-500',
  };

  const progressColorMap = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500',
  };

  return (
    <div
      className={`relative flex flex-col rounded-lg border shadow-lg min-w-[280px] max-w-md overflow-hidden
        ${colorMap[toast.type]}
        ${isExiting ? 'animate-slide-out' : 'animate-slide-in'}
      `}
    >
      <div className="flex items-center gap-3 px-4 py-3">
        <span className={`material-icons-outlined text-lg ${iconColorMap[toast.type]}`}>
          {iconMap[toast.type]}
        </span>
        <span className="flex-1 text-sm">{toast.message}</span>

        {/* Undo button */}
        {toast.undoAction && (
          <button
            onClick={handleUndo}
            className="px-2 py-1 text-xs font-semibold bg-black/10 dark:bg-white/10 rounded hover:bg-black/20 dark:hover:bg-white/20 transition-colors"
          >
            Undo
          </button>
        )}

        {/* Custom action button */}
        {toast.action && (
          <button
            onClick={handleAction}
            className="px-2 py-1 text-xs font-semibold bg-black/10 dark:bg-white/10 rounded hover:bg-black/20 dark:hover:bg-white/20 transition-colors"
          >
            {toast.action.label}
          </button>
        )}

        <button
          onClick={handleClose}
          className="material-icons-outlined text-sm opacity-60 hover:opacity-100 transition-opacity"
        >
          close
        </button>
      </div>

      {/* Progress bar for undo toasts */}
      {toast.undoAction && (
        <div className="h-1 bg-black/10 dark:bg-white/10">
          <div
            className={`h-full transition-none ${progressColorMap[toast.type]}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}
