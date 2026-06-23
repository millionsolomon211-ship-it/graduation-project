"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, Mail, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const RESEND_COOLDOWN = 60;

export default function VerifyOtpForm() {
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [emailHint, setEmailHint] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();

  const sendOtp = useCallback(async () => {
    setSending(true);
    setError('');
    try {
      const res = await fetch('/api/auth/send-otp', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send code');
      setCooldown(RESEND_COOLDOWN);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send code');
    } finally {
      setSending(false);
    }
  }, []);

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
    sendOtp();
  }, [sendOtp]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...digits];
    next[index] = value.slice(-1);
    setDigits(next);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const next = [...digits];
    for (let i = 0; i < 6; i++) next[i] = pasted[i] || '';
    setDigits(next);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otp = digits.join('');
    if (otp.length !== 6) {
      setError('Enter the full 6-digit code');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Verification failed');

      if (data.requiresLogin) {
        router.push('/login');
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push('/dashboard'), 1200);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
      style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: '400px' }}
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
            <Mail size={26} color="white" />
          </div>
        </div>

        <p className="uiverse-heading">Verify Email</p>
        <p style={{ textAlign: 'center', color: '#64748b', fontSize: '0.8rem', marginTop: '-0.75rem', marginBottom: '1rem' }}>
          {sending ? 'Sending code…' : `Enter the 6-digit code sent to ${emailHint || 'your email'}`}
        </p>

        <div
          style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '0.5rem' }}
          onPaste={handlePaste}
        >
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className="uiverse-input-field"
              style={{
                width: 44, height: 48, textAlign: 'center', fontSize: '1.25rem',
                padding: 0, borderRadius: 12, background: 'rgba(255,255,255,0.08)',
              }}
            />
          ))}
        </div>

        {error && (
          <p style={{ color: '#ff6b6b', fontSize: '0.78rem', textAlign: 'center', margin: '0.25em 0' }}>
            {error}
          </p>
        )}

        {success && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: '#4ade80', fontSize: '0.85rem' }}>
            <CheckCircle size={16} /> Verified! Redirecting…
          </div>
        )}

        <div className="uiverse-btn-group">
          <button type="submit" disabled={loading || success} className="uiverse-button1">
            {loading
              ? <Loader2 style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }} size={18} />
              : 'Verify'}
          </button>
        </div>

        <button
          type="button"
          className="uiverse-button3"
          style={{ width: '100%' }}
          disabled={cooldown > 0 || sending}
          onClick={sendOtp}
        >
          {cooldown > 0 ? `Resend code in ${cooldown}s` : sending ? 'Sending…' : 'Resend code'}
        </button>

        <Link href="/login" style={{ textDecoration: 'none' }}>
          <button type="button" className="uiverse-button2" style={{ width: '100%', marginTop: '0.25rem' }}>
            Back to Login
          </button>
        </Link>
      </form>
    </motion.div>
  );
}
