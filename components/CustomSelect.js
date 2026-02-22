'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check } from 'lucide-react';

export default function CustomSelect({ options, value, onChange, placeholder = 'Select...', disabled = false, width = 140, icon: Icon = null, size = 'sm' }) {
    const [open, setOpen] = useState(false);
    const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });
    const triggerRef = useRef();
    const dropRef = useRef();

    // Calculate position from trigger
    const updatePos = useCallback(() => {
        if (!triggerRef.current) return;
        const r = triggerRef.current.getBoundingClientRect();
        setPos({ top: r.bottom + 6, left: r.left, width: r.width });
    }, []);

    useEffect(() => {
        if (!open) return;
        updatePos();
        const handler = (e) => {
            if (triggerRef.current?.contains(e.target)) return;
            if (dropRef.current?.contains(e.target)) return;
            setOpen(false);
        };
        const scrollHandler = () => updatePos();
        document.addEventListener('mousedown', handler);
        window.addEventListener('scroll', scrollHandler, true);
        window.addEventListener('resize', scrollHandler);
        return () => {
            document.removeEventListener('mousedown', handler);
            window.removeEventListener('scroll', scrollHandler, true);
            window.removeEventListener('resize', scrollHandler);
        };
    }, [open, updatePos]);

    const selected = options.find(o => (typeof o === 'string' ? o : o.value) === value);
    const label = selected ? (typeof selected === 'string' ? selected : selected.label) : placeholder;

    const pad = size === 'sm' ? '7px 12px' : '10px 16px';
    const fontSize = size === 'sm' ? 12 : 13;

    const dropdown = open && typeof window !== 'undefined' ? createPortal(
        <div ref={dropRef} style={{
            position: 'fixed',
            top: pos.top,
            left: pos.left,
            width: pos.width,
            zIndex: 99999,
            background: 'var(--bg-1)',
            border: '1px solid var(--border-1)',
            borderRadius: 'var(--r-md)',
            padding: 4,
            boxShadow: '0 12px 40px rgba(0,0,0,0.25), 0 0 0 1px var(--border-0)',
            maxHeight: 220,
            overflowY: 'auto',
            animation: 'dropdown-in 0.15s ease-out',
        }}>
            {options.map((opt, i) => {
                const optValue = typeof opt === 'string' ? opt : opt.value;
                const optLabel = typeof opt === 'string' ? opt : opt.label;
                const optColor = typeof opt === 'object' ? opt.color : null;
                const isActive = optValue === value;
                return (
                    <button
                        key={i}
                        type="button"
                        onClick={() => { onChange(optValue); setOpen(false); }}
                        style={{
                            width: '100%',
                            display: 'flex', alignItems: 'center', gap: 8,
                            padding: '8px 10px',
                            background: isActive ? 'rgba(245,158,11,0.1)' : 'transparent',
                            border: 'none',
                            borderRadius: 6,
                            color: isActive ? 'var(--amber)' : 'var(--text-1)',
                            fontFamily: 'var(--font-body)', fontSize,
                            cursor: 'pointer',
                            transition: 'all 0.1s',
                            textAlign: 'left',
                            outline: 'none',
                        }}
                        onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--border-0)'; }}
                        onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                    >
                        {optColor && (
                            <span style={{ width: 7, height: 7, borderRadius: '50%', background: optColor, flexShrink: 0 }} />
                        )}
                        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{optLabel}</span>
                        {isActive && <Check size={13} color="var(--amber)" style={{ flexShrink: 0 }} />}
                    </button>
                );
            })}
        </div>,
        document.body
    ) : null;

    return (
        <div style={{ position: 'relative', display: 'inline-block', width }}>
            <button
                ref={triggerRef}
                type="button"
                onClick={() => { if (!disabled) { updatePos(); setOpen(v => !v); } }}
                disabled={disabled}
                style={{
                    width: '100%',
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: pad,
                    background: 'var(--bg-1)',
                    border: `1px solid ${open ? 'var(--amber-d)' : 'var(--border-0)'}`,
                    borderRadius: 'var(--r-sm)',
                    color: value ? 'var(--text-0)' : 'var(--text-3)',
                    fontFamily: 'var(--font-body)', fontSize,
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    transition: 'all 0.15s',
                    opacity: disabled ? 0.4 : 1,
                    outline: 'none',
                    textAlign: 'left',
                    boxShadow: open ? '0 0 0 3px rgba(245,158,11,0.1)' : 'none',
                }}
            >
                {Icon && <Icon size={12} style={{ color: 'var(--text-3)', flexShrink: 0 }} />}
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
                <ChevronDown size={13} style={{ color: 'var(--text-3)', flexShrink: 0, transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0)' }} />
            </button>
            {dropdown}
            <style>{`
        @keyframes dropdown-in {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
        </div>
    );
}
