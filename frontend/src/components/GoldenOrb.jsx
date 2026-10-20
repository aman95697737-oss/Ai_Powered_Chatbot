import React from 'react';

export default function GoldenOrb() {
  return (
    <div className="golden-orb-container">
      {/* Outer ambient glow */}
      <div className="orb-ambient-glow"></div>
      
      {/* Plasma Sphere */}
      <div className="orb-sphere-wrapper orb-animated">
        <svg 
          viewBox="0 0 160 160" 
          width="120" 
          height="120" 
          className="plasma-layer"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <radialGradient id="plasmaCore" cx="50%" cy="50%" r="50%" fx="35%" fy="35%">
              <stop offset="0%" stopColor="#fff8b5" stopOpacity="0.95" />
              <stop offset="30%" stopColor="#e2ee2a" stopOpacity="0.9" />
              <stop offset="70%" stopColor="#8d9411" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#0a0b0d" stopOpacity="0.1" />
            </radialGradient>

            <linearGradient id="swirlGold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#e2ee2a" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#713f12" stopOpacity="0.1" />
            </linearGradient>

            <filter id="orbFilter" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3.5" />
            </filter>
          </defs>

          {/* Dark spherical body */}
          <circle cx="80" cy="80" r="58" fill="#0d0e12" stroke="rgba(226, 238, 42, 0.45)" strokeWidth="1.5" />

          {/* Internal glowing plasma swirls */}
          <circle cx="76" cy="74" r="44" fill="url(#plasmaCore)" filter="url(#orbFilter)" />

          <path 
            d="M50,75 C60,45 110,48 115,75 C120,105 75,115 58,100 C45,88 40,90 50,75 Z" 
            fill="url(#swirlGold)" 
            opacity="0.9" 
            filter="url(#orbFilter)"
          />

          <ellipse 
            cx="84" 
            cy="72" 
            rx="34" 
            ry="25" 
            fill="none" 
            stroke="#fef08a" 
            strokeWidth="3.5" 
            opacity="0.8" 
            transform="rotate(-25 84 72)"
          />

          <ellipse 
            cx="76" 
            cy="86" 
            rx="36" 
            ry="18" 
            fill="none" 
            stroke="#e2ee2a" 
            strokeWidth="2.5" 
            opacity="0.85" 
            transform="rotate(35 76 86)"
          />

          {/* Specular spark */}
          <circle cx="64" cy="60" r="4" fill="#ffffff" opacity="0.95" filter="drop-shadow(0 0 6px #ffffff)" />
        </svg>
      </div>

      <style>{`
        .golden-orb-container {
          position: relative;
          width: 130px;
          height: 130px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
        }
        .orb-ambient-glow {
          position: absolute;
          width: 170px;
          height: 170px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(226, 238, 42, 0.4) 0%, rgba(226, 238, 42, 0.08) 55%, transparent 75%);
          pointer-events: none;
          z-index: 1;
        }
        .orb-sphere-wrapper {
          position: relative;
          z-index: 2;
          width: 120px;
          height: 120px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>
    </div>
  );
}
