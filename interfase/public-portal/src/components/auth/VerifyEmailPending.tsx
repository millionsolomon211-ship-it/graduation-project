"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, Mail, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const RESEND_COOLDOWN = 60;

export default function VerifyEmailPending() {
  const [emailHint, setEmailHint] = useState('');
  const [resending, setResending] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState('');
  const [resent, setResent] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const token = document.cookie
      .split('; ')
      .find((c) => c.startsWith('auth_token='))
      ?.split('=')[1];
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
        if (payload.email) {
          const [local, domain] = payload.email.split('@');
          setEmailHint(`${local.slice(0, 2)}***@${domain}`);
        }
      } catch { /* ignore */ }
    }
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const handleResend = async () => {
    setResending(true);
    setError('');
    setResent(false);
    try {
      const res = await fetch('/api/auth/resend-verify', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to resend email');
      setResent(true);
      setCooldown(RESEND_COOLDOWN);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to resend email');
    } finally {
      setResending(false);
    }
  };

  const handleCheckVerified = async () => {
    setChecking(true);
    setError('');
    try {
      const res = await fetch('/api/auth/refresh-session', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not refresh session');

      if (data.emailVerified) {
        router.push('/dashboard');
      } else {
        setError('Email not verified yet. Click the link in your inbox, then try again.');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not check verification status');
    } finally {
      setChecking(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
      style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: '400px' }}
    >
      <div className="uiverse-form" style={{ textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5em' }}>
          <div style={{
            width: 52, height: 52,
            background: 'linear-gradient(135deg, #003366 60%, #00aaff 100%)',
            borderRadius: 14,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 24px rgba(0,170,255,0.25)',
          }}>
            <Mail size={26} color="white" />
          </div>
        </div>

        <p className="uiverse-heading">Verify Your Email</p>
        <p style={{ color: '#94a3b8', fontSize: '0.85em', lineHeight: 1.6, marginBottom: '1.25rem' }}>
          Keycloak sent a verification link to{' '}
          <strong style={{ color: '#e2e8f0' }}>{emailHint || 'your email'}</strong>.
          Open the email and click the link to activate your account.
        </p>

        {error && (
          <p style={{ color: '#ff6b6b', fontSize: '0.78rem', marginBottom: '0.75rem' }}>{error}</p>
        )}

        {resent && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: '#4ade80', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
            <CheckCircle size={16} /> Verification email resent
          </div>
        )}

        <button
          type="button"
          className="uiverse-button1"
          style={{ width: '100%', marginBottom: '0.5rem' }}
          disabled={checking}
          onClick={handleCheckVerified}
        >
          {checking
            ? <Loader2 style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }} size={18} />
            : "I've verified — continue"}
        </button>

        <button
          type="button"
          className="uiverse-button3"
          style={{ width: '100%' }}
          disabled={cooldown > 0 || resending}
          onClick={handleResend}
        >
          {cooldown > 0
            ? `Resend email in ${cooldown}s`
            : resending
              ? 'Sending…'
              : 'Resend verification email'}
        </button>

        <Link href="/login" style={{ textDecoration: 'none' }}>
          <button type="button" className="uiverse-button2" style={{ width: '100%', marginTop: '0.5rem' }}>
            Back to Login
          </button>
        </Link>
      </div>
    </motion.div>
  );
}
