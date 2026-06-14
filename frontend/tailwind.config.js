export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['"Playfair Display"', 'ui-serif', 'Georgia', 'serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      colors: {
        'nexus-light-bg': '#F8F3EA',
        'nexus-light-bg-alt': '#FFF9EF',
        'nexus-text': '#17201A',
        'nexus-green': '#0F5C3B',
        'nexus-green-soft': '#7BAE7F',
        'nexus-green-bright': '#2ECC71',
        'nexus-cream': '#F3DFC1',
        'nexus-gold': '#C79A46',
        'nexus-red': '#C84C31',
        'nexus-border': '#E6D8C4',
        
        'nexus-dark-bg': '#07110C',
        'nexus-dark-bg-alt': '#0E1B13',
        'nexus-dark-card': '#13261A',
        'nexus-dark-text': '#F4F1E8',
        'nexus-dark-text-alt': '#B8C7B5',
        'nexus-dark-neon': '#4ADE80',
        'nexus-dark-gold': '#D6A84F',
        'nexus-dark-red': '#E36B52',
        'nexus-dark-border': '#254331',
      }
    },
  },
  plugins: [],
}
