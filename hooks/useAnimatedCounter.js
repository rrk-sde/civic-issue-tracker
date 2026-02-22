'use client';
import { useState, useEffect, useRef } from 'react';

export default function useAnimatedCounter(target, duration = 1200) {
    const [count, setCount] = useState(0);
    const prev = useRef(0);

    useEffect(() => {
        if (typeof target !== 'number' || target === prev.current) return;
        const start = prev.current;
        const diff = target - start;
        const startTime = performance.now();

        const step = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const ease = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(start + diff * ease);
            setCount(current);
            if (progress < 1) requestAnimationFrame(step);
            else prev.current = target;
        };

        requestAnimationFrame(step);
    }, [target, duration]);

    return count;
}
