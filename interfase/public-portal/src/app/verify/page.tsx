"use client";

import RotatingBackground from '@/components/RotatingBackground';
import VerifyEmail from '@/components/auth/VerifyEmail';

export default function VerifyPage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      position: 'relative',
      backgroundColor: '#08101f',
    }}>
      <RotatingBackground />
      <VerifyEmail />
    </div>
  );
}
