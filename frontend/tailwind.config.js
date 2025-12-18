module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',  // Tailwind will scan these files for classes
  ],
  theme: {
    extend: {
      colors: {
        // Custom colors can be added here
        primary: '#1D4ED8',  // Example: custom primary color
        secondary: '#9333EA', // Example: custom secondary color
      },
      spacing: {
        // Custom spacing values (padding, margin, etc.)
        128: '32rem',   // Adding custom spacing size
      },
      fontFamily: {
        // Custom fonts (if needed)
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
