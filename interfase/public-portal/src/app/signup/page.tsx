"use client";

import RotatingBackground from '@/components/RotatingBackground';
import SignupForm from '@/components/auth/SignupForm';

export default function SignupPage() {
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
      <SignupForm />
    </div>
  );
}
