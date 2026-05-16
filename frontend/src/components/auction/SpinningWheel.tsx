import { useRef, useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Player } from '../../types';

interface SpinningWheelProps {
  players: Player[];
  onSpinEnd?: (player: Player) => void;
  isSpinning: boolean;
  targetIndex?: number;
}

const COLORS = [
  '#39FF14', '#00f0ff', '#bf00ff', '#ff006e', '#ff8c00',
  '#00ff88', '#4488ff', '#ff44aa', '#ffdd00', '#44ffcc',
  '#ff6644', '#8844ff', '#00ddff', '#ff0044', '#88ff44',
];

export default function SpinningWheel({ players, isSpinning, targetIndex }: SpinningWheelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rotation, setRotation] = useState(0);
  const animRef = useRef<number>(0);

  const drawWheel = useCallback((ctx: CanvasRenderingContext2D, size: number, currentRotation: number) => {
    const center = size / 2;
    const radius = center - 8;
    const count = players.length;
    if (count === 0) return;

    const segAngle = (2 * Math.PI) / count;

    ctx.clearRect(0, 0, size, size);

    // Outer glow ring
    ctx.beginPath();
    ctx.arc(center, center, radius + 4, 0, 2 * Math.PI);
    ctx.strokeStyle = 'rgba(57, 255, 20, 0.3)';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Draw segments
    players.forEach((player, i) => {
      const startAngle = currentRotation + i * segAngle;
      const endAngle = startAngle + segAngle;

      // Segment fill
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, startAngle, endAngle);
      ctx.closePath();
      const color = COLORS[i % COLORS.length];
      ctx.fillStyle = color + '40'; // Semi-transparent
      ctx.fill();
      ctx.strokeStyle = color + '80';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Player name
      ctx.save();
      const midAngle = startAngle + segAngle / 2;
      const textRadius = radius * 0.65;
      ctx.translate(center + Math.cos(midAngle) * textRadius, center + Math.sin(midAngle) * textRadius);
      ctx.rotate(midAngle + Math.PI / 2);

      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${Math.max(10, Math.min(14, 400 / count))}px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const name = player.name.length > 12 ? player.name.slice(0, 11) + '…' : player.name;
      ctx.fillText(name, 0, 0);
      ctx.restore();
    });

    // Center circle
    ctx.beginPath();
    ctx.arc(center, center, 30, 0, 2 * Math.PI);
    ctx.fillStyle = '#0d1321';
    ctx.fill();
    ctx.strokeStyle = '#39FF14';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Center text
    ctx.fillStyle = '#39FF14';
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('SPIN', center, center);
  }, [players]);

  // Draw wheel on change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const size = canvas.width;
    drawWheel(ctx, size, rotation);
  }, [rotation, players, drawWheel]);

  // Spin animation
  useEffect(() => {
    if (!isSpinning || players.length === 0) return;

    const count = players.length;
    const segAngle = (2 * Math.PI) / count;
    // Calculate target rotation: multiple full spins + land on target
    const targetRot = targetIndex !== undefined
      ? -(targetIndex * segAngle) - segAngle / 2 - Math.PI / 2 + Math.PI * 2 * (10 + Math.floor(Math.random() * 5)) // Precise full spins
      : Math.PI * 2 * (10 + Math.random() * 5);

    const startTime = Date.now();
    const duration = 4500; // 4.5 seconds
    const startRot = rotation;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const currentRot = startRot + (targetRot - startRot) * eased;
      setRotation(currentRot);

      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate);
      }
    };

    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [isSpinning, targetIndex]);

  if (players.length === 0) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="text-center text-gray-500">
          <div className="w-24 h-24 mx-auto mb-4 rounded-full border-2 border-dashed border-gray-700 flex items-center justify-center">
            <span className="text-2xl">🎯</span>
          </div>
          <p>No players in pool</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative wheel-container flex items-center justify-center">
      {/* Pointer */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 z-10 wheel-pointer">
        <div className="w-0 h-0 border-l-[14px] border-r-[14px] border-t-[24px] border-l-transparent border-r-transparent border-t-neon-green" 
          style={{ filter: 'drop-shadow(0 0 8px rgba(57, 255, 20, 0.8))' }} />
      </div>

      <canvas
        ref={canvasRef}
        width={400}
        height={400}
        className="max-w-full"
      />

      {isSpinning && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          className="absolute inset-0 rounded-full border-2 border-neon-green/50"
        />
      )}
    </div>
  );
}
