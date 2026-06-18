"use client";

import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function VerifyEmail() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    // Simulate verification logic
    const timer = setTimeout(() => {
      setStatus('success'); // In a real app, you'd call the API gateway here
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
      style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: '380px' }}
    >
      <div className="uiverse-form" style={{ textAlign: 'center', padding: '2.5em 2em' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5em' }}>
          <div style={{
            width: 72, height: 72,
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            {status === 'loading' && <Loader2 size={32} color="#00aaff" style={{ animation: 'spin 1s linear infinite' }} />}
            {status === 'success' && <CheckCircle size={32} color="#22c55e" />}
            {status === 'error' && <XCircle size={32} color="#ef4444" />}
          </div>
        </div>

        <h1 className="uiverse-heading" style={{ marginBottom: '0.5em', marginTop: 0 }}>
          {status === 'loading' && 'Verifying Email'}
          {status === 'success' && 'Verified!'}
          {status === 'error' && 'Failed'}
        </h1>
        
        <p style={{ color: '#94a3b8', fontSize: '0.9em', marginBottom: '2em', lineHeight: 1.5 }}>
          {status === 'loading' && 'Please wait while we verify your credentials...'}
          {status === 'success' && 'Your account is now fully active.'}
          {status === 'error' && 'The link might have expired or is invalid.'}
        </p>

        {status === 'success' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Link href="/login" style={{ textDecoration: 'none' }}>
              <button className="uiverse-button1" style={{ width: '100%' }}>Proceed to Login</button>
            </Link>
          </motion.div>
        )}

        {status === 'error' && (
          <Link href="/signup" style={{ textDecoration: 'none' }}>
            <button className="uiverse-button3">Back to Registry</button>
          </Link>
        )}
      </div>
    </motion.div>
  );
}
