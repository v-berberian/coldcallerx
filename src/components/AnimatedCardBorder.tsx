
import React from 'react';

interface AnimatedCardBorderProps {
  isActive: boolean;
  duration: number;
  className?: string;
}

const AnimatedCardBorder: React.FC<AnimatedCardBorderProps> = ({
  isActive,
  duration,
  className = ""
}) => {
  if (!isActive) return null;

  return (
    <div className={`absolute inset-0 rounded-3xl overflow-hidden pointer-events-none ${className}`}>
      {/* Animated green border path */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <path
          d="M 50 0 L 100 0 L 100 100 L 0 100 L 0 0 L 50 0"
          fill="none"
          stroke="rgb(34 197 94)"
          strokeWidth="0.8"
          strokeLinecap="round"
          strokeDasharray="100"
          strokeDashoffset="100"
          className="animate-border-draw"
          style={{
            animation: `border-draw ${duration}s linear forwards`
          }}
        />
      </svg>
      
      {/* CSS animation keyframes */}
      <style jsx>{`
        @keyframes border-draw {
          from {
            stroke-dashoffset: 100;
          }
          to {
            stroke-dashoffset: 0;
          }
        }
        .animate-border-draw {
          animation: border-draw ${duration}s linear forwards;
        }
      `}</style>
    </div>
  );
};

export default AnimatedCardBorder;
