"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const backgrounds = [
  '/bg/police_security_bg_1_1781769733964.png',
  '/bg/police_security_bg_2_1781769745084.png',
  '/bg/police_security_bg_3_1781769754369.png',
  '/bg/police_security_bg_4_1781769765485.png',
];

export default function RotatingBackground() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % backgrounds.length);
    }, 8000); // Rotate every 8 seconds
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 -z-20 overflow-hidden bg-black">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 0.6, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 2, ease: "easeInOut" }}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${backgrounds[index]})` }}
        />
      </AnimatePresence>
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black opacity-60" />
    </div>
  );
}
