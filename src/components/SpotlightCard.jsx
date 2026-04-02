import React, { useRef, useState } from 'react';

export default function SpotlightCard({ children, className = "" }) {
  const divRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
      className={`relative overflow-hidden rounded-[2.5rem] bg-white/80 backdrop-blur-2xl border border-slate-200/60 shadow-xl shadow-slate-200/40 transition-all duration-500 hover:border-indigo-500/30 ${className}`}
    >
      <div
        className="pointer-events-none absolute -inset-px transition duration-300"
        style={{
          opacity,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(79, 70, 229, 0.08), transparent 40%)`,
        }}
      />
      
      {/* Subtle diagnostic pattern for medical aesthetic */}
      <div
        className="pointer-events-none absolute inset-0 transition duration-500 opacity-5"
        style={{
          opacity: opacity * 0.1,
          backgroundImage: 'radial-gradient(circle, #4f46e5 0.5px, transparent 0.5px)',
          backgroundSize: '32px 32px',
          WebkitMaskImage: `radial-gradient(300px circle at ${position.x}px ${position.y}px, black, transparent)`,
          maskImage: `radial-gradient(300px circle at ${position.x}px ${position.y}px, black, transparent)`
        }}
      />

      <div className="relative h-full z-10">
        {children}
      </div>
    </div>
  );
}
