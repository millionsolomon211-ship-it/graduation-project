"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Loader2, ShieldCheck, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const q = searchParams.get('email');
    if (q) setEmail(q);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Reset failed');

      setSuccess(true);
      setTimeout(() => router.push('/login'), 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Reset failed');
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
            <ShieldCheck size={26} color="white" />
          </div>
        </div>

        <p className="uiverse-heading">Reset Password</p>
        <p style={{ textAlign: 'center', color: '#64748b', fontSize: '0.8rem', marginTop: '-0.75rem', marginBottom: '1rem' }}>
          Enter the code from your email and a new password
        </p>

        <div className="uiverse-field">
          <input
            placeholder="Email Address"
            className="uiverse-input-field"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ paddingLeft: '0.75rem' }}
          />
        </div>

        <div className="uiverse-field">
          <input
            placeholder="6-digit reset code"
            className="uiverse-input-field"
            type="text"
            inputMode="numeric"
            maxLength={6}
            required
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            style={{ paddingLeft: '0.75rem' }}
          />
        </div>

        <div className="uiverse-field" style={{ position: 'relative' }}>
          <input
            placeholder="New Password (min 8 chars)"
            className="uiverse-input-field"
            type={showPassword ? 'text' : 'password'}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ paddingLeft: '0.75rem' }}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', padding: '0 4px', display: 'flex', alignItems: 'center' }}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        <div className="uiverse-field">
          <input
            placeholder="Confirm New Password"
            className="uiverse-input-field"
            type={showPassword ? 'text' : 'password'}
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            style={{ paddingLeft: '0.75rem' }}
          />
        </div>

        {error && (
          <p style={{ color: '#ff6b6b', fontSize: '0.78rem', textAlign: 'center', margin: '0.25em 0' }}>{error}</p>
        )}

        {success && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: '#4ade80', fontSize: '0.85rem' }}>
            <CheckCircle size={16} /> Password updated! Redirecting…
          </div>
        )}

        <div className="uiverse-btn-group">
          <button type="submit" disabled={loading || success} className="uiverse-button1">
            {loading
              ? <Loader2 style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }} size={18} />
              : 'Reset Password'}
          </button>
        </div>

        <Link href="/forgot-password" style={{ textDecoration: 'none' }}>
          <button type="button" className="uiverse-button3" style={{ width: '100%' }}>
            Resend code
          </button>
        </Link>

        <Link href="/login" style={{ textDecoration: 'none' }}>
          <button type="button" className="uiverse-button2" style={{ width: '100%', marginTop: '0.25rem' }}>
            Back to Login
          </button>
        </Link>
      </form>
    </motion.div>
  );
}
