'use client';
import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastCtx = createContext();

const ICONS = {
    success: { Icon: CheckCircle, color: '#6EE7B7', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.2)' },
    error: { Icon: AlertTriangle, color: '#FCA5A5', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.2)' },
    info: { Icon: Info, color: 'var(--amber)', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)' },
};

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'success', duration = 3500) => {
        const id = Date.now() + Math.random();
        setToasts(t => [...t, { id, message, type, exiting: false }]);
        setTimeout(() => {
            setToasts(t => t.map(x => x.id === id ? { ...x, exiting: true } : x));
            setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 300);
        }, duration);
    }, []);

    const dismiss = useCallback((id) => {
        setToasts(t => t.map(x => x.id === id ? { ...x, exiting: true } : x));
        setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 300);
    }, []);

    return (
        <ToastCtx.Provider value={addToast}>
            {children}
            {typeof window !== 'undefined' && createPortal(
                <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 99999, display: 'flex', flexDirection: 'column', gap: 10, pointerEvents: 'none' }}>
                    {toasts.map(({ id, message, type, exiting }) => {
                        const { Icon, color, bg, border } = ICONS[type] || ICONS.info;
                        return (
                            <div key={id} style={{
                                display: 'flex', alignItems: 'center', gap: 12,
                                padding: '12px 16px',
                                background: 'var(--bg-1)',
                                border: `1px solid ${border}`,
                                borderRadius: 'var(--r-md)',
                                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                                minWidth: 280, maxWidth: 400,
                                pointerEvents: 'auto',
                                animation: exiting ? 'toast-out 0.3s ease-in forwards' : 'toast-in 0.3s ease-out forwards',
                            }}>
                                <Icon size={16} color={color} style={{ flexShrink: 0 }} />
                                <p style={{ flex: 1, fontSize: 13, color: 'var(--text-0)', lineHeight: 1.4 }}>{message}</p>
                                <button onClick={() => dismiss(id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', display: 'flex', flexShrink: 0, padding: 2 }}>
                                    <X size={13} />
                                </button>
                            </div>
                        );
                    })}
                </div>,
                document.body
            )}
            <style>{`
        @keyframes toast-in {
          from { opacity: 0; transform: translateX(40px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes toast-out {
          from { opacity: 1; transform: translateX(0); }
          to { opacity: 0; transform: translateX(40px); }
        }
      `}</style>
        </ToastCtx.Provider>
    );
}

export function useToast() {
    return useContext(ToastCtx);
}
