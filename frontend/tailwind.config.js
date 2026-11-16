/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        studio: {
          bg: '#F5F1E9',        // Warm off-white / parchment
          ink: '#202820',       // Primary deep charcoal / forest ink
          accent: '#D97745',    // Terracotta accent
          secondary: '#D8CBB7', // Warm stone / linen
          muted: '#82917A',     // Sage / muted green
          white: '#FFFFFF',     // Clean white
          subtle: '#EBE5D8',    // Light parchment border
          surface: '#FDFBF7',   // Slightly elevated cream surface
          card: '#FFFFFF',      // Card white
          hover: '#EDE6D8',     // Hover tint
          darkmuted: '#4A5546', // Darker sage for readable text
        }
      },
      fontFamily: {
        serif: ['"DM Serif Display"', '"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'editorial': '0 4px 20px -2px rgba(32, 40, 32, 0.05), 0 2px 6px -1px rgba(32, 40, 32, 0.03)',
        'float': '0 20px 40px -8px rgba(32, 40, 32, 0.08), 0 8px 16px -4px rgba(32, 40, 32, 0.04)',
        'subtle': '0 1px 3px rgba(32, 40, 32, 0.04)',
      }
    },
  },
  plugins: [],
}
