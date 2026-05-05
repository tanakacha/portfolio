import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'mypalette': {
          'white': '#FFFFFF',
          'pink': '#F3B6B4',
          'gray': '#A6A8B2',
          'lime': '#A5DBC0',
          'light-navy': '#8A91D3',
          'sky': '#7CC4E8',
          'navy': '#6C7EBC',
          'text-dark': '#192138',
        }
      }
    },
  },
  plugins: [],
};
export default config;
