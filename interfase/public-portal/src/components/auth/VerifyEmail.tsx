"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function VerifyEmailCallback() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Confirming your email with Keycloak…');
  const router = useRouter();

  useEffect(() => {
    async function confirm() {
      try {
        const res = await fetch('/api/auth/refresh-session', { method: 'POST' });
        const data = await res.json();

        if (res.ok && data.emailVerified) {
          setStatus('success');
          setMessage('Your email is verified. Redirecting to dashboard…');
          setTimeout(() => router.push('/dashboard'), 1500);
          return;
        }

        setStatus('success');
        setMessage('Email verified by Keycloak. Please log in to continue.');
        setTimeout(() => router.push('/login'), 2500);
      } catch {
        setStatus('error');
        setMessage('Something went wrong. Try logging in — your email may already be verified.');
      }
    }
    confirm();
  }, [router]);

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
            border: '1px solid rgba(255,255,255,0.1)',
          }}>
            {status === 'loading' && <Loader2 size={32} color="#00aaff" style={{ animation: 'spin 1s linear infinite' }} />}
            {status === 'success' && <CheckCircle size={32} color="#22c55e" />}
            {status === 'error' && <XCircle size={32} color="#ef4444" />}
          </div>
        </div>

        <h1 className="uiverse-heading" style={{ marginBottom: '0.5em', marginTop: 0 }}>
          {status === 'loading' && 'Verifying Email'}
          {status === 'success' && 'Verified!'}
          {status === 'error' && 'Verification Issue'}
        </h1>

        <p style={{ color: '#94a3b8', fontSize: '0.9em', marginBottom: '2em', lineHeight: 1.5 }}>
          {message}
        </p>

        {status === 'error' && (
          <Link href="/login" style={{ textDecoration: 'none' }}>
            <button className="uiverse-button1" style={{ width: '100%' }}>Go to Login</button>
          </Link>
        )}
      </div>
    </motion.div>
  );
}
