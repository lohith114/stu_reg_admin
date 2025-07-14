// In app/loading.tsx
'use client';

import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import Image from 'next/image';

const AnimatedGradientBackground = styled(Box)({
  minHeight: '100vh',
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'fixed',
  top: 0,
  left: 0,
  zIndex: 9999,
  background: 'linear-gradient(45deg, #0a192f, #112240, #0a192f)',
  backgroundSize: '400% 400%',
  animation: 'gradientAnimation 15s ease infinite',
  '@keyframes gradientAnimation': {
    '0%': { backgroundPosition: '0% 50%' },
    '50%': { backgroundPosition: '100% 50%' },
    '100%': { backgroundPosition: '0% 50%' },
  },
});

const SpinningImageContainer = styled('div')({
  animation: 'spin 1.5s linear infinite',
  '@keyframes spin': {
    '0%': { transform: 'rotate(0deg)' },
    '100%': { transform: 'rotate(360deg)' },
  },
});

export default function Loading() {
  return (
    <AnimatedGradientBackground>
      <SpinningImageContainer>
        <Image
          src="/ic_jairisys.png"
          alt="Loading..."
          width={80}
          height={80}
          priority
          unoptimized // Add if your icon is a PNG and you don't need optimization
        />
      </SpinningImageContainer>
    </AnimatedGradientBackground>
  );
}