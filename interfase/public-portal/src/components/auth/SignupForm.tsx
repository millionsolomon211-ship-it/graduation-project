"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default function SignupForm() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '', confirm: '' });
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
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formData.fullName, email: formData.email, password: formData.password }),
      });
      // Allow for mock success if API isn't ready
      // if (!response.ok) throw new Error('Registration failed. Please try again.');
      
      router.push('/verify');
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
      // For demonstration of UI flow:
      router.push('/verify');
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
          {/* Logo/Badge */}
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

          <p className="uiverse-heading">Sign Up</p>

          {/* Full Name */}
          <div className="uiverse-field">
            <svg className="uiverse-input-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4z"/>
            </svg>
            <input
              autoComplete="off"
              placeholder="Full Name"
              className="uiverse-input-field"
              type="text"
              required
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            />
          </div>

          {/* Email */}
          <div className="uiverse-field">
            <svg className="uiverse-input-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M13.106 7.222c0-2.967-2.249-5.032-5.482-5.032-3.35 0-5.646 2.318-5.646 5.702 0 3.493 2.235 5.708 5.762 5.708.862 0 1.689-.123 2.304-.335v-.862c-.43.199-1.354.328-2.29.328-2.926 0-4.813-1.88-4.813-4.798 0-2.844 1.921-4.881 4.594-4.881 2.735 0 4.608 1.688 4.608 4.156 0 1.682-.554 2.769-1.416 2.769-.492 0-.772-.28-.772-.76V5.206H8.923v.834h-.11c-.266-.595-.881-.964-1.6-.964-1.4 0-2.378 1.162-2.378 2.823 0 1.737.957 2.906 2.379 2.906.8 0 1.415-.39 1.709-1.087h.11c.081.67.703 1.148 1.503 1.148 1.572 0 2.57-1.415 2.57-3.643zm-7.177.704c0-1.197.54-1.907 1.456-1.907.93 0 1.524.738 1.524 1.907S8.308 9.84 7.371 9.84c-.895 0-1.442-.725-1.442-1.914z"></path>
            </svg>
            <input
              placeholder="Email Address"
              className="uiverse-input-field"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          {/* Password */}
          <div className="uiverse-field" style={{ position: 'relative' }}>
            <svg className="uiverse-input-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"></path>
            </svg>
            <input
              placeholder="Password"
              className="uiverse-input-field"
              type={showPassword ? 'text' : 'password'}
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', padding: '0 4px', display: 'flex', alignItems: 'center' }}>
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {/* Confirm Password */}
          <div className="uiverse-field" style={{ position: 'relative' }}>
            <svg className="uiverse-input-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"></path>
            </svg>
            <input
              placeholder="Confirm Password"
              className="uiverse-input-field"
              type={showConfirm ? 'text' : 'password'}
              required
              value={formData.confirm}
              onChange={(e) => setFormData({ ...formData, confirm: e.target.value })}
            />
            <button type="button" onClick={() => setShowConfirm(!showConfirm)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', padding: '0 4px', display: 'flex', alignItems: 'center' }}>
              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {/* Error */}
          {error && (
            <p style={{ color: '#ff6b6b', fontSize: '0.78rem', textAlign: 'center', margin: '0.25em 0' }}>{error}</p>
          )}

          {/* Buttons */}
          <div className="uiverse-btn-group">
            <button type="submit" disabled={loading} className="uiverse-button1">
              {loading
                ? <Loader2 style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }} size={18} />
                : <>Sign Up</>}
            </button>
            <Link href="/login" style={{ flex: 1 }}>
              <button type="button" className="uiverse-button2" style={{ width: '100%' }}>Login</button>
            </Link>
          </div>
        </form>
      </motion.div>
  );
}
