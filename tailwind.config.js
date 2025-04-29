/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      cursor: {
        custom: "url('https://i.ibb.co/gZ0njmd7/arrowhead-rounded-outline.png'), auto",
        'custom-pointer': 'url("https://i.ibb.co/8nVVv1rv/hand-pointer.png"), pointer',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      container: {
        center: true,
        padding: '1rem',
        screens: {
          sm: '640px',
          md: '768px',
          lg: '1024px',
          xl: '1280px',
        },
      },
      colors: {
        gray: {
          750: '#2A2A2A',
        },
      },
    },
  },
  plugins: [],
};