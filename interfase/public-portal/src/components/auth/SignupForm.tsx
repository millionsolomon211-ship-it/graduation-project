"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { setAuthCookiesClient } from '@/lib/auth-client';

export default function SignupForm() {
  const [loading,      setLoading]      = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm,  setShowConfirm]  = useState(false);
  const [error,        setError]        = useState('');
  const [success,      setSuccess]      = useState(false);
  const [formData,     setFormData]     = useState({
    firstName: '', lastName: '', email: '', password: '', confirm: '',
  });
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed.');
      }

      if (data.autoLogin && data.token) {
        setAuthCookiesClient(data.token, data.refreshToken);
      }

      setSuccess(true);
      setTimeout(() => {
        if (data.autoLogin) {
          router.push('/verify-email');
        } else {
          router.push('/login');
        }
      }, 1200);

    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const field = (key: keyof typeof formData) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setFormData({ ...formData, [key]: e.target.value });

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
      style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: '400px' }}
    >
      <form className="uiverse-form" onSubmit={handleSubmit}>

        {/* Logo */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5em' }}>
          <div style={{
            width: 52, height: 52,
            background: 'linear-gradient(135deg, #003366 60%, #00aaff 100%)',
            borderRadius: 14,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 24px rgba(0,170,255,0.25)',
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
            </svg>
          </div>
        </div>

        <p className="uiverse-heading">Create Account</p>
        <p style={{ textAlign: 'center', color: '#64748b', fontSize: '0.8rem', marginBottom: '1rem', marginTop: '-0.5rem' }}>
          Join the Citizen Portal — it only takes a minute
        </p>

        {/* First + Last name row */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <div className="uiverse-field" style={{ flex: 1 }}>
            <svg className="uiverse-input-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4z"/>
            </svg>
            <input
              autoComplete="given-name"
              placeholder="First Name"
              className="uiverse-input-field"
              type="text"
              required
              value={formData.firstName}
              onChange={field('firstName')}
            />
          </div>
          <div className="uiverse-field" style={{ flex: 1 }}>
            <input
              autoComplete="family-name"
              placeholder="Last Name"
              className="uiverse-input-field"
              type="text"
              required
              value={formData.lastName}
              onChange={field('lastName')}
              style={{ paddingLeft: '0.75rem' }}
            />
          </div>
        </div>

        {/* Email */}
        <div className="uiverse-field">
          <svg className="uiverse-input-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1H2zm13 2.383-4.708 2.825L15 11.105V5.383zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741zM1 11.105l4.708-2.897L1 5.383v5.722z"/>
          </svg>
          <input
            placeholder="Email Address"
            className="uiverse-input-field"
            type="email"
            required
            autoComplete="email"
            value={formData.email}
            onChange={field('email')}
          />
        </div>

        {/* Password */}
        <div className="uiverse-field" style={{ position: 'relative' }}>
          <svg className="uiverse-input-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
          </svg>
          <input
            placeholder="Password (min 8 chars)"
            className="uiverse-input-field"
            type={showPassword ? 'text' : 'password'}
            required
            autoComplete="new-password"
            value={formData.password}
            onChange={field('password')}
          />
          <button type="button" onClick={() => setShowPassword(!showPassword)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', padding: '0 4px', display: 'flex', alignItems: 'center' }}>
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        {/* Confirm Password */}
        <div className="uiverse-field" style={{ position: 'relative' }}>
          <svg className="uiverse-input-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
          </svg>
          <input
            placeholder="Confirm Password"
            className="uiverse-input-field"
            type={showConfirm ? 'text' : 'password'}
            required
            autoComplete="new-password"
            value={formData.confirm}
            onChange={field('confirm')}
          />
          <button type="button" onClick={() => setShowConfirm(!showConfirm)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', padding: '0 4px', display: 'flex', alignItems: 'center' }}>
            {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ color: '#ff6b6b', fontSize: '0.78rem', textAlign: 'center', margin: '0.25em 0' }}
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Success flash */}
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                color: '#4ade80', fontSize: '0.85rem', margin: '0.25em 0' }}
            >
              <CheckCircle size={16} /> Account created! Check your email for the verification code…
            </motion.div>
          )}
        </AnimatePresence>

        {/* Buttons */}
        <div className="uiverse-btn-group">
          <button type="submit" disabled={loading || success} className="uiverse-button1">
            {loading
              ? <Loader2 style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }} size={18} />
              : 'Create Account'}
          </button>
          <Link href="/login" style={{ flex: 1 }}>
            <button type="button" className="uiverse-button2" style={{ width: '100%' }}>
              Login
            </button>
          </Link>
        </div>

        <p style={{ textAlign: 'center', color: '#475569', fontSize: '0.72rem', marginTop: '0.75rem' }}>
          By signing up you agree to our{' '}
          <Link href="#" style={{ color: '#00aaff', textDecoration: 'none' }}>Terms of Service</Link>
        </p>

      </form>
    </motion.div>
  );
}
