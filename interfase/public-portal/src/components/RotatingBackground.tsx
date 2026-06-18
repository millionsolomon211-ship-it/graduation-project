"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const BACKGROUNDS = [
  '/bg/police_security_bg_1_1781769733964.png',
  '/bg/police_security_bg_2_1781769745084.png',
  '/bg/police_security_bg_3_1781769754369.png',
  '/bg/police_security_bg_4_1781769765485.png',
];

export default function RotatingBackground() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % BACKGROUNDS.length);
    }, 7000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 0,
        backgroundColor: '#08101f',
        overflow: 'hidden',
      }}
    >
      <AnimatePresence>
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 0.55, scale: 1.0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.8, ease: 'easeInOut' }}
          style={{
            position: 'absolute', inset: 0,
            backgroundImage: `url(${BACKGROUNDS[current]})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      </AnimatePresence>
      {/* Dark gradient overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to bottom, rgba(8,16,31,0.5) 0%, rgba(8,16,31,0.3) 50%, rgba(8,16,31,0.6) 100%)',
      }} />
    </div>
  );
}
