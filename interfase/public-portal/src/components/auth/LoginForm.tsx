"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { initKeycloak } from '@/lib/keycloak';

const KEYCLOAK_URL = process.env.NEXT_PUBLIC_KEYCLOAK_URL || "http://localhost:8080";
const KEYCLOAK_REALM = process.env.NEXT_PUBLIC_KEYCLOAK_REALM || "master";
const KEYCLOAK_CLIENT_ID = process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || "public-portal";

export default function LoginForm() {
  const [loading, setLoading] = useState(false);
  const [kcLoading, setKcLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Optionally check if keycloak-js already has a session
    initKeycloak().then((kc) => {
      if (kc?.authenticated) {
        document.cookie = `auth_token=${kc.token}; path=/; max-age=3600`;
        router.push('/dashboard');
      }
    });
  }, [router]);

  // Option 1: Direct Access Grant (Authenticating via custom UI securely)
  const handleCustomLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const response = await fetch(`${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'password',
          client_id: KEYCLOAK_CLIENT_ID,
          username: formData.username,
          password: formData.password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error_description || 'Invalid credentials');
      }

      const data = await response.json();
      
      // Store token securely (cookie mechanism matches middleware)
      document.cookie = `auth_token=${data.access_token}; path=/; max-age=3600`;
      router.push('/dashboard');
      
    } catch (err: any) {
      setError(err.message || 'Login failed. Please confirm Keycloak is running.');
    } finally {
      setLoading(false);
    }
  };

  // Option 2: Use Official Keycloak-JS Redirect Flow
  const handleKeycloakRedirectLogin = async () => {
    setKcLoading(true);
    try {
      const kc = await initKeycloak();
      if (kc) {
        await kc.login();
      }
    } catch (err) {
      console.error(err);
      setKcLoading(false);
    }
  };

  return (
    <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
        style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: '380px' }}
      >
        <form className="uiverse-form" onSubmit={handleCustomLogin}>
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

          <p className="uiverse-heading">Login</p>

          <div style={{ marginBottom: "1rem" }}>
            <button 
              type="button" 
              className="uiverse-button2" 
              onClick={handleKeycloakRedirectLogin} 
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              disabled={kcLoading}
            >
              {kcLoading ? <Loader2 size={16} className="animate-spin" /> : null}
              Secure Keycloak SSO Redirect
            </button>
            <div style={{ textAlign: "center", color: "#64748b", fontSize: "0.8em", marginTop: "10px" }}>OR USE CUSTOM UI</div>
          </div>

          {/* Username */}
          <div className="uiverse-field">
            <svg className="uiverse-input-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M13.106 7.222c0-2.967-2.249-5.032-5.482-5.032-3.35 0-5.646 2.318-5.646 5.702 0 3.493 2.235 5.708 5.762 5.708.862 0 1.689-.123 2.304-.335v-.862c-.43.199-1.354.328-2.29.328-2.926 0-4.813-1.88-4.813-4.798 0-2.844 1.921-4.881 4.594-4.881 2.735 0 4.608 1.688 4.608 4.156 0 1.682-.554 2.769-1.416 2.769-.492 0-.772-.28-.772-.76V5.206H8.923v.834h-.11c-.266-.595-.881-.964-1.6-.964-1.4 0-2.378 1.162-2.378 2.823 0 1.737.957 2.906 2.379 2.906.8 0 1.415-.39 1.709-1.087h.11c.081.67.703 1.148 1.503 1.148 1.572 0 2.57-1.415 2.57-3.643zm-7.177.704c0-1.197.54-1.907 1.456-1.907.93 0 1.524.738 1.524 1.907S8.308 9.84 7.371 9.84c-.895 0-1.442-.725-1.442-1.914z"></path>
            </svg>
            <input
              autoComplete="off"
              placeholder="Username"
              className="uiverse-input-field"
              type="text"
              required
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
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
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', padding: '0 4px', display: 'flex', alignItems: 'center' }}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
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
                : <>&nbsp;&nbsp;&nbsp;&nbsp;Login&nbsp;&nbsp;&nbsp;&nbsp;</>}
            </button>
            <Link href="/signup">
              <button type="button" className="uiverse-button2">Sign Up</button>
            </Link>
          </div>

          <Link href="/forgot-password" style={{ textDecoration: 'none' }}>
            <button type="button" className="uiverse-button3" style={{ width: '100%' }}>
              Forgot Password
            </button>
          </Link>
        </form>
      </motion.div>
  );
}

