/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      keyframes: {
        // --- YOUR EXISTING KEYFRAMES (PRESERVED) ---
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'zoom-in': {
          '0%': { transform: 'scale(0.9) translateY(20px)', opacity: '0' },
          '100%': { transform: 'scale(1) translateY(0)', opacity: '1' },
        },
        'bounce-slow': {
          '0%, 100%': { transform: 'translateY(-5%)' },
          '50%': { transform: 'translateY(0)' },
        },
        'bounce-sm': {
          '0%, 100%': { transform: 'translateY(-10%)' },
          '50%': { transform: 'translateY(0)' },
        },
        'pulse-fast': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.75 },
        },
        'spin-slow': {
          'from': { transform: 'rotate(0deg)' },
          'to': { transform: 'rotate(360deg)' },
        },
        'spin-slow-reverse': {
          'from': { transform: 'rotate(0deg)' },
          'to': { transform: 'rotate(-360deg)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0) translateX(0)' },
          '25%': { transform: 'translateY(-5px) translateX(5px)' },
          '50%': { transform: 'translateY(0) translateX(0)' },
          '75%': { transform: 'translateY(5px) translateX(-5px)' },
        },
        'achievement-bounce': { // Kept as it was in your file
          '0%': { transform: 'scale(0.3) translateY(100px)', opacity: '0' },
          '50%': { transform: 'scale(1.05) translateY(-10px)', opacity: '1' },
          '70%': { transform: 'scale(0.95) translateY(5px)' },
          '100%': { transform: 'scale(1) translateY(0)' },
        },

        // --- UPDATED & ADDED KEYFRAMES FOR POPUP ---
        'shine': { // Updated for a better visual effect
          '0%': { transform: 'translateX(-150%) skewX(-25deg)' },
          '100%': { transform: 'translateX(150%) skewX(-25deg)' },
        },
        'confetti-fall': { // Added for the confetti animation
          '0%': { transform: 'translateY(-10vh) rotate(0deg)', opacity: 1 },
          '100%': { transform: 'translateY(110vh) rotate(720deg)', opacity: 0 },
        },
      },
      animation: {
        // --- YOUR EXISTING ANIMATIONS (PRESERVED) ---
        'fade-in': 'fade-in 0.3s ease-out forwards',
        'zoom-in': 'zoom-in 0.3s ease-out forwards',
        'bounce-slow': 'bounce-slow 4s infinite ease-in-out',
        'bounce-sm': 'bounce-sm 2s infinite ease-in-out',
        'pulse-fast': 'pulse-fast 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin-slow 10s linear infinite',
        'spin-slow-reverse': 'spin-slow-reverse 15s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'achievement-bounce': 'achievement-bounce 0.6s ease-out',

        // --- UPDATED & ADDED ANIMATIONS FOR POPUP ---
        'shine': 'shine 1.5s ease-out infinite',
        'confetti-fall': 'confetti-fall linear infinite',
      }
    },
  },
  plugins: [],
};

// tailwind.config.js
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      keyframes: {
        // Existing keyframes (from HomePage.tsx)
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'zoom-in': {
          '0%': { transform: 'scale(0.9) translateY(20px)', opacity: '0' },
          '100%': { transform: 'scale(1) translateY(0)', opacity: '1' },
        },
        'bounce-slow': {
          '0%, 100%': { transform: 'translateY(-5%)' },
          '50%': { transform: 'translateY(0)' },
        },
        'bounce-sm': { // Smaller bounce for modal
          '0%, 100%': { transform: 'translateY(-10%)' },
          '50%': { transform: 'translateY(0)' },
        },
        'pulse-fast': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.75 },
        },
        'spin-slow': {
          'from': { transform: 'rotate(0deg)' },
          'to': { transform: 'rotate(360deg)' },
        },
        'spin-slow-reverse': {
          'from': { transform: 'rotate(0deg)' },
          'to': { transform: 'rotate(-360deg)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0) translateX(0)' },
          '25%': { transform: 'translateY(-5px) translateX(5px)' },
          '50%': { transform: 'translateY(0) translateX(0)' },
          '75%': { transform: 'translateY(5px) translateX(-5px)' },
        },
        // --- NEW KEYFRAMES FOR ACHIEVEMENT POPUP ---
        'achievement-bounce': {
          '0%': { transform: 'scale(0.3) translateY(100px)', opacity: '0' },
          '50%': { transform: 'scale(1.05) translateY(-10px)', opacity: '1' },
          '70%': { transform: 'scale(0.95) translateY(5px)' },
          '100%': { transform: 'scale(1) translateY(0)' },
        },
        'shine': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        // --- END NEW KEYFRAMES ---
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out forwards',
        'zoom-in': 'zoom-in 0.3s ease-out forwards',
        'bounce-slow': 'bounce-slow 4s infinite ease-in-out',
        'bounce-sm': 'bounce-sm 2s infinite ease-in-out',
        'pulse-fast': 'pulse-fast 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin-slow 10s linear infinite',
        'spin-slow-reverse': 'spin-slow-reverse 15s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        // --- NEW ANIMATION CLASSES FOR ACHIEVEMENT POPUP ---
        'achievement-bounce': 'achievement-bounce 0.6s ease-out',
        'shine': 'shine 1.5s ease-in-out infinite',
        // --- END NEW ANIMATION CLASSES ---
      }
    },
  },
  plugins: [],
};