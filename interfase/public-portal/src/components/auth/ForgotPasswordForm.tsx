"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, KeyRound, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed');

      setSent(true);
      setTimeout(() => {
        router.push(`/reset-password?email=${encodeURIComponent(email)}`);
      }, 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
      style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: '380px' }}
    >
      <form className="uiverse-form" onSubmit={handleSubmit}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5em' }}>
          <div style={{
            width: 52, height: 52,
            background: 'linear-gradient(135deg, #003366 60%, #00aaff 100%)',
            borderRadius: 14,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 24px rgba(0,170,255,0.25)',
          }}>
            <KeyRound size={26} color="white" />
          </div>
        </div>

        <p className="uiverse-heading">Forgot Password</p>
        <p style={{ textAlign: 'center', color: '#64748b', fontSize: '0.8rem', marginTop: '-0.75rem', marginBottom: '1rem' }}>
          We&apos;ll email you a reset code
        </p>

        <div className="uiverse-field">
          <svg className="uiverse-input-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1H2zm13 2.383-4.708 2.825L15 11.105V5.383zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741zM1 11.105l4.708-2.897L1 5.383v5.722z"/>
          </svg>
          <input
            placeholder="Email Address"
            className="uiverse-input-field"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {error && (
          <p style={{ color: '#ff6b6b', fontSize: '0.78rem', textAlign: 'center', margin: '0.25em 0' }}>{error}</p>
        )}

        {sent && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: '#4ade80', fontSize: '0.85rem' }}>
            <CheckCircle size={16} /> Code sent! Redirecting…
          </div>
        )}

        <div className="uiverse-btn-group">
          <button type="submit" disabled={loading || sent} className="uiverse-button1">
            {loading
              ? <Loader2 style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }} size={18} />
              : 'Send Reset Code'}
          </button>
        </div>

        <Link href="/login" style={{ textDecoration: 'none' }}>
          <button type="button" className="uiverse-button2" style={{ width: '100%' }}>
            Back to Login
          </button>
        </Link>
      </form>
    </motion.div>
  );
}
