import { useEffect, useState } from 'react';
import { CheckCircle2, Sparkles } from 'lucide-react';

interface AchievementPopupProps {
  isVisible: boolean;
  message: string;
  onClose: () => void;
  type?: 'task' | 'progress' | 'achievement';
}

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  rotation: number;
  velocity: { x: number; y: number };
  gravity: number;
  shape: 'circle' | 'square';
}

export default function AchievementPopup({
  isVisible,
  message,
  onClose,
  type = 'achievement'
}: AchievementPopupProps) {
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      
      // Create confetti
      const colors = [
        '#66CCFF', // cyan
        '#FF69B4', // fuchsia
        '#FFD700', // gold
        '#C084FC', // light purple
        '#8B5CF6', // purple
        '#F59E0B', // amber
        '#10B981', // emerald
        '#EC4899'  // pink
      ];

      const pieces: ConfettiPiece[] = [];
      for (let i = 0; i < 60; i++) {
        pieces.push({
          id: i,
          x: 30 + Math.random() * 40, // Spread around center
          y: 10 + Math.random() * 30, // Start from top area
          color: colors[Math.floor(Math.random() * colors.length)],
          size: Math.random() * 6 + 3,
          rotation: Math.random() * 360,
          velocity: {
            x: (Math.random() - 0.5) * 8,
            y: (Math.random() - 0.5) * 4 - 3
          },
          gravity: Math.random() * 0.15 + 0.08,
          shape: Math.random() > 0.5 ? 'circle' : 'square'
        });
      }
      setConfetti(pieces);

      // Animate confetti
      let frame = 0;
      const animate = () => {
        if (frame > 100) return; // Stop after ~3.3 seconds

        const updatedPieces = pieces.map(piece => ({
          ...piece,
          x: piece.x + piece.velocity.x * 0.5,
          y: piece.y + piece.velocity.y * 0.5,
          rotation: piece.rotation + 5,
          velocity: {
            x: piece.velocity.x * 0.98, // Air resistance
            y: piece.velocity.y + piece.gravity // Gravity
          }
        }));

        setConfetti([...updatedPieces]);
        frame++;

        if (frame <= 100) {
          requestAnimationFrame(animate);
        }
      };
      requestAnimationFrame(animate);

      // Auto-dismiss after 3 seconds
      const timer = setTimeout(() => {
        setIsAnimating(false);
        setTimeout(onClose, 300); // Wait for fade out animation
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  const getIcon = () => {
    switch (type) {
      case 'task':
        return <CheckCircle2 className="w-8 h-8 text-green-500" />;
      case 'progress':
        return <Sparkles className="w-8 h-8 text-purple-500" />;
      default:
        return <CheckCircle2 className="w-8 h-8 text-green-500" />;
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'task':
        return 'TASK ADDED!';
      case 'progress':
        return 'PROGRESS SAVED!';
      default:
        return 'ACHIEVEMENT UNLOCKED!';
    }
  };

  return (
    <>
      {/* Backdrop with celebratory gradient */}
      <div
        className={`fixed inset-0 z-50 transition-all duration-500 pointer-events-none ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          background: isAnimating 
            ? 'radial-gradient(ellipse at center, rgba(75, 42, 122, 0.3) 0%, rgba(139, 69, 179, 0.4) 35%, rgba(224, 168, 248, 0.2) 70%, rgba(15, 23, 42, 0.8) 100%)'
            : 'transparent'
        }}
        onClick={() => {
          setIsAnimating(false);
          setTimeout(onClose, 300);
        }}
      />

      {/* Confetti */}
      <div className="fixed inset-0 z-[60] pointer-events-none overflow-hidden">
        {confetti.map(piece => (
          <div
            key={piece.id}
            className="absolute transition-all duration-75 ease-out"
            style={{
              left: `${piece.x}%`,
              top: `${piece.y}%`,
              width: `${piece.size}px`,
              height: `${piece.size}px`,
              backgroundColor: piece.color,
              transform: `rotate(${piece.rotation}deg)`,
              borderRadius: piece.shape === 'circle' ? '50%' : '2px',
              opacity: 0.9,
              boxShadow: `0 0 6px ${piece.color}40`
            }}
          />
        ))}
      </div>

      {/* Main Achievement Popup */}
      <div className="fixed inset-0 flex items-center justify-center z-[70] pointer-events-none px-4">
        <div
          className={`
            bg-white rounded-3xl max-w-sm w-full relative overflow-hidden
            transform transition-all duration-700 ease-out pointer-events-auto
            ${isAnimating
              ? 'scale-100 opacity-100 translate-y-0 animate-achievement-bounce'
              : 'scale-75 opacity-0 translate-y-12'
            }
          `}
          style={{
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)',
            border: '1px solid #E0E0E0'
          }}
        >
          {/* Content */}
          <div className="text-center px-8 py-6">
            {/* Mascot Section with Halo Effect */}
            <div className="relative mb-6">
              {/* Halo/Shine Effect */}
              <div 
                className={`absolute inset-0 ${isAnimating ? 'animate-pulse' : 'opacity-0'}`}
                style={{
                  background: 'radial-gradient(circle, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.2) 30%, transparent 60%)',
                  transform: 'scale(1.5)'
                }}
              />
              
              {/* Mascot */}
              <div className="relative z-10">
                <img
                  src="/DaDo_hurey.svg"
                  alt="Celebration Mascot"
                  className={`w-20 h-20 mx-auto mb-2 ${isAnimating ? 'animate-bounce' : ''}`}
                  style={{ filter: 'drop-shadow(0 4px 8px rgba(139, 92, 246, 0.3))' }}
                />
              </div>

              {/* Sparkles around mascot */}
              {[...Array(8)].map((_, i) => {
                const angle = (i * 45) * (Math.PI / 180);
                const radius = 50;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                return (
                  <div
                    key={i}
                    className={`absolute w-1 h-1 bg-yellow-400 rounded-full ${
                      isAnimating ? 'animate-ping' : 'opacity-0'
                    }`}
                    style={{
                      left: '50%',
                      top: '50%',
                      transform: `translate(${x}px, ${y}px) translate(-50%, -50%)`,
                      animationDelay: `${i * 0.15}s`,
                      animationDuration: '1.5s'
                    }}
                  />
                );
              })}
            </div>

            {/* Title and Message */}
            <div className="mb-6">
              <div className="flex items-center justify-center gap-2 mb-3">
                <h2 className="text-2xl font-bold text-slate-900" style={{ color: '#333333' }}>
                  {getTitle()}
                </h2>
                {getIcon()}
              </div>

              <p className="text-base font-medium text-slate-600 mb-4" style={{ color: '#666666' }}>
                {message}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div 
                className="w-full h-1.5 rounded-full overflow-hidden"
                style={{ backgroundColor: '#EBEBEB' }}
              >
                <div
                  className={`h-full rounded-full transition-all duration-[2500ms] ease-out ${
                    isAnimating ? 'w-full' : 'w-0'
                  }`}
                  style={{
                    background: 'linear-gradient(to right, #FF69B4, #8A2BE2)'
                  }}
                />
              </div>
            </div>

            {/* Encouragement Badge */}
            <div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
              style={{ backgroundColor: '#8A2BE2' }}
            >
              <Sparkles className="w-4 h-4 text-white" />
              <span className="text-sm font-medium text-white">
                Keep up the great work!
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}