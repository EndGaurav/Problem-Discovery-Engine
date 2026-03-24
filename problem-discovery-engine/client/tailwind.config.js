/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0a0b14",
        card: "#161827",
        primary: {
          light: "#c084fc",
          DEFAULT: "#9333ea",
          dark: "#7e22ce"
        },
        secondary: {
          light: "#818cf8",
          DEFAULT: "#4f46e5",
          dark: "#4338ca"
        },
        accent: {
          light: "#2dd4bf",
          DEFAULT: "#0d9488",
          dark: "#0f766e"
        }
      },
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
