import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface BatchCompletionScreenProps {
  onContinue: () => void;
}

export function BatchCompletionScreen({ onContinue }: BatchCompletionScreenProps) {
  const [animationKey, setAnimationKey] = useState(0);
  const [showText, setShowText] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowText(true), 1500);
    return () => clearTimeout(timer);
  }, [animationKey]);

  const handleReplay = () => {
    setShowText(false);
    setAnimationKey(prev => prev + 1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0f1a]">
      {/* Subtle grid background */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(59, 130, 246, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />
      
      {/* Glow effect */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/20 rounded-full blur-[100px]" />

      <div className="relative text-center space-y-8 px-6">
        {/* AI Avatar with brow-wipe animation */}
        <div key={animationKey} className="relative mx-auto w-32 h-32">
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Face outline */}
            <circle
              cx="50"
              cy="50"
              r="35"
              className="text-blue-400 animate-[draw_1s_ease-out_forwards]"
              style={{
                strokeDasharray: 220,
                strokeDashoffset: 220,
              }}
            />
            
            {/* Left eye */}
            <circle
              cx="38"
              cy="45"
              r="3"
              className="text-blue-400 animate-[draw_0.3s_ease-out_0.5s_forwards]"
              style={{
                strokeDasharray: 20,
                strokeDashoffset: 20,
              }}
            />
            
            {/* Right eye - closed/squinting for relief expression */}
            <path
              d="M58 45 Q62 42 66 45"
              className="text-blue-400 animate-[draw_0.3s_ease-out_0.5s_forwards]"
              style={{
                strokeDasharray: 20,
                strokeDashoffset: 20,
              }}
            />
            
            {/* Relieved smile */}
            <path
              d="M35 58 Q50 68 65 58"
              className="text-blue-400 animate-[draw_0.4s_ease-out_0.7s_forwards]"
              style={{
                strokeDasharray: 40,
                strokeDashoffset: 40,
              }}
            />
            
            {/* Sweat drop */}
            <path
              d="M72 35 Q75 40 72 45 Q69 40 72 35"
              className="text-blue-300 animate-[draw_0.3s_ease-out_0.9s_forwards,sweatDrop_0.5s_ease-in_1.2s_forwards]"
              style={{
                strokeDasharray: 25,
                strokeDashoffset: 25,
                fill: 'none'
              }}
            />
            
            {/* Brow-wipe arm */}
            <g className="animate-[browWipe_1s_ease-in-out_1s_forwards]" style={{ transformOrigin: '50px 75px' }}>
              {/* Arm */}
              <path
                d="M50 75 Q30 60 25 45"
                className="text-blue-400"
                style={{
                  strokeDasharray: 50,
                  strokeDashoffset: 0,
                }}
              />
              {/* Hand */}
              <circle
                cx="25"
                cy="45"
                r="4"
                className="text-blue-400"
                fill="none"
              />
            </g>
            
            {/* Relief lines */}
            <g className="animate-[fadeIn_0.3s_ease-out_1.5s_forwards]" style={{ opacity: 0 }}>
              <line x1="20" y1="30" x2="15" y2="25" className="text-blue-300/60" />
              <line x1="80" y1="30" x2="85" y2="25" className="text-blue-300/60" />
              <line x1="18" y1="40" x2="12" y2="40" className="text-blue-300/60" />
              <line x1="82" y1="40" x2="88" y2="40" className="text-blue-300/60" />
            </g>
          </svg>
          
          {/* Sparkles around avatar */}
          <div className="absolute -top-2 -right-2 text-blue-400 animate-[sparkle_1.5s_ease-in-out_infinite]">✦</div>
          <div className="absolute -bottom-1 -left-3 text-blue-300 animate-[sparkle_1.5s_ease-in-out_0.5s_infinite]">✦</div>
          <div className="absolute top-1/2 -right-4 text-blue-200 animate-[sparkle_1.5s_ease-in-out_1s_infinite]">✧</div>
        </div>

        {/* Text content */}
        <div className={`space-y-2 transition-all duration-500 ${showText ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <h2 className="text-2xl font-light text-blue-100 tracking-wide">
            All done here!
          </h2>
          <p className="text-blue-300/70 text-sm">
            You're caught up.
          </p>
        </div>

        {/* Action buttons */}
        <div className={`flex items-center justify-center gap-4 transition-all duration-500 delay-200 ${showText ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReplay}
            className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Replay
          </Button>
          <Button
            onClick={onContinue}
            className="bg-blue-600 hover:bg-blue-500 text-white px-8"
          >
            Continue
          </Button>
        </div>
      </div>

      {/* Animation keyframes */}
      <style>{`
        @keyframes draw {
          to {
            stroke-dashoffset: 0;
          }
        }
        
        @keyframes browWipe {
          0% {
            transform: rotate(0deg) translateY(0);
            opacity: 0;
          }
          20% {
            opacity: 1;
          }
          50% {
            transform: rotate(-15deg) translateY(-5px);
          }
          100% {
            transform: rotate(0deg) translateY(0);
            opacity: 0;
          }
        }
        
        @keyframes sweatDrop {
          0% {
            transform: translateY(0);
            opacity: 1;
          }
          100% {
            transform: translateY(15px);
            opacity: 0;
          }
        }
        
        @keyframes fadeIn {
          to {
            opacity: 1;
          }
        }
        
        @keyframes sparkle {
          0%, 100% {
            opacity: 0.3;
            transform: scale(0.8);
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
          }
        }
      `}</style>
    </div>
  );
}
