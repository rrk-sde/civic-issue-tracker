import { useEffect, useState } from 'react';

export default function SuccessAnimation() {
    const [show, setShow] = useState(true);

    if (!show) return null;

    return (
        <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', height: 120 }}>
            {/* Expanding rings */}
            <div className="ring ring-1" />
            <div className="ring ring-2" />

            {/* Checkmark circle */}
            <div className="check-circle">
                <svg className="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                </svg>
            </div>

            <style>{`
        .check-circle {
          width: 64px;
          height: 64px;
          background: linear-gradient(135deg, #10B981, #059669);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 32px rgba(16, 185, 129, 0.4);
          animation: pop-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
          z-index: 2;
        }

        .check-icon {
          width: 32px;
          height: 32px;
          color: white;
          stroke-dasharray: 50;
          stroke-dashoffset: 50;
          animation: draw-check 0.4s ease-out 0.3s forwards;
        }

        .ring {
          position: absolute;
          border-radius: 50%;
          border: 2px solid #10B981;
          opacity: 0;
          z-index: 1;
        }

        .ring-1 {
          width: 64px;
          height: 64px;
          animation: ripple 1s cubic-bezier(0.0, 0, 0.2, 1) 0.1s forwards;
        }

        .ring-2 {
          width: 64px;
          height: 64px;
          animation: ripple 1s cubic-bezier(0.0, 0, 0.2, 1) 0.3s forwards;
        }

        @keyframes pop-in {
          0% { transform: scale(0); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }

        @keyframes draw-check {
          to { stroke-dashoffset: 0; }
        }

        @keyframes ripple {
          0% { transform: scale(1); opacity: 0.8; border-width: 4px; }
          100% { transform: scale(2.5); opacity: 0; border-width: 0px; }
        }
      `}</style>
        </div>
    );
}
