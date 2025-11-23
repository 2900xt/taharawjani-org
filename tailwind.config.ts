import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        retro: {
          bg: '#2d1b69',
          container: '#4a3586',
          sidebar: '#5a4b9d',
          tab: '#6a5acd',
          accent: '#7b68ee',
          skillbar: '#8a7cc8',
          link: '#9370db',
        }
      },
      fontFamily: {
        vt323: ['VT323', 'monospace'],
      },
    },
  },
  plugins: [],
} satisfies Config;
