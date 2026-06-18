"use client";

import RotatingBackground from '@/components/RotatingBackground';
import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {
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
      <LoginForm />
    </div>
  );
}
