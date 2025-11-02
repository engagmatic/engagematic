import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

export const Logo: React.FC<LogoProps> = ({ className = "", size = 40 }) => {
  // Generate unique IDs for each logo instance to avoid conflicts
  const logoId = React.useMemo(() => {
    const id = Math.random().toString(36).substring(2, 9);
    return `logo-${id}`;
  }, []);
  
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id={`logoGradient-${logoId}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{ stopColor: '#2563eb', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#9333ea', stopOpacity: 1 }} />
        </linearGradient>
        <filter id={`glow-${logoId}`}>
          <feGaussianBlur stdDeviation="1" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        
        {/* Sparkle shape definition */}
        <g id={`sparkle-${logoId}`}>
          <path
            d="M 0 -2.5 L 0.8 -0.8 L 2.5 0 L 0.8 0.8 L 0 2.5 L -0.8 0.8 L -2.5 0 L -0.8 -0.8 Z"
            fill="white"
            opacity="0.9"
          />
        </g>
        
        <style>
          {`
            @keyframes sparkleMove1-${logoId} {
              0% { opacity: 0; transform: translate(18px, -15px) scale(0); }
              40% { opacity: 1; transform: translate(6px, -3px) scale(1.2); }
              60% { opacity: 1; transform: translate(2px, -1px) scale(1); }
              100% { opacity: 0; transform: translate(0, 0) scale(0.3); }
            }
            
            @keyframes sparkleMove2-${logoId} {
              0% { opacity: 0; transform: translate(-18px, -15px) scale(0); }
              40% { opacity: 1; transform: translate(-6px, -3px) scale(1.2); }
              60% { opacity: 1; transform: translate(-2px, -1px) scale(1); }
              100% { opacity: 0; transform: translate(0, 0) scale(0.3); }
            }
            
            @keyframes sparkleMove3-${logoId} {
              0% { opacity: 0; transform: translate(18px, 15px) scale(0); }
              40% { opacity: 1; transform: translate(6px, 3px) scale(1.2); }
              60% { opacity: 1; transform: translate(2px, 1px) scale(1); }
              100% { opacity: 0; transform: translate(0, 0) scale(0.3); }
            }
            
            @keyframes sparkleMove4-${logoId} {
              0% { opacity: 0; transform: translate(-18px, 15px) scale(0); }
              40% { opacity: 1; transform: translate(-6px, 3px) scale(1.2); }
              60% { opacity: 1; transform: translate(-2px, 1px) scale(1); }
              100% { opacity: 0; transform: translate(0, 0) scale(0.3); }
            }
            
            @keyframes sparkleRotate-${logoId} {
              0%, 100% { transform: rotate(0deg) scale(1); }
              25% { transform: rotate(90deg) scale(1.05); }
              50% { transform: rotate(180deg) scale(1); }
              75% { transform: rotate(270deg) scale(1.05); }
            }
            
            @keyframes sparklePulse-${logoId} {
              0%, 100% { opacity: 1; transform: scale(1); }
              50% { opacity: 0.85; transform: scale(1.1); }
            }
            
            .sparkle-1-${logoId} {
              animation: sparkleMove1-${logoId} 2.5s ease-in-out infinite;
            }
            
            .sparkle-2-${logoId} {
              animation: sparkleMove2-${logoId} 2.5s ease-in-out infinite 0.6s;
            }
            
            .sparkle-3-${logoId} {
              animation: sparkleMove3-${logoId} 2.5s ease-in-out infinite 1.2s;
            }
            
            .sparkle-4-${logoId} {
              animation: sparkleMove4-${logoId} 2.5s ease-in-out infinite 1.8s;
            }
            
            .center-star-${logoId} {
              animation: sparkleRotate-${logoId} 4s ease-in-out infinite, sparklePulse-${logoId} 2s ease-in-out infinite;
              transform-origin: 20px 20px;
            }
          `}
        </style>
      </defs>
      
      {/* Animated sparkles coming from outside and joining the logo */}
      <g className={`sparkle-1-${logoId}`}>
        <use href={`#sparkle-${logoId}`} x="20" y="20" />
      </g>
      <g className={`sparkle-2-${logoId}`}>
        <use href={`#sparkle-${logoId}`} x="20" y="20" />
      </g>
      <g className={`sparkle-3-${logoId}`}>
        <use href={`#sparkle-${logoId}`} x="20" y="20" />
      </g>
      <g className={`sparkle-4-${logoId}`}>
        <use href={`#sparkle-${logoId}`} x="20" y="20" />
      </g>
      
      {/* Hexagon with rounded corners */}
      <path
        d="M 20 6 L 30 10 L 34 20 L 30 30 L 20 34 L 10 30 L 6 20 L 10 10 Z"
        fill={`url(#logoGradient-${logoId})`}
        filter={`url(#glow-${logoId})`}
      />
      
      {/* Subtle white highlight/shadow on bottom-right edge */}
      <path
        d="M 20 6 L 30 10 L 34 20 L 30 30 L 20 34"
        fill="none"
        stroke="rgba(255, 255, 255, 0.25)"
        strokeWidth="0.8"
        strokeLinecap="round"
      />
      
      {/* White 4-pointed star/sparkle in center with animation */}
      <g className={`center-star-${logoId}`}>
        <path
          d="M 20 13 L 21.5 17.5 L 26.5 17.5 L 22.5 20.5 L 24 25 L 20 22 L 16 25 L 17.5 20.5 L 13.5 17.5 L 18.5 17.5 Z"
          fill="white"
          stroke="white"
          strokeWidth="0.3"
        />
      </g>
    </svg>
  );
};

