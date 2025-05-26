import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        'charcoal': '#333333',
        'eerie-black': '#1f1f1f',
        'warm-teal': '#20A39E',
        'coral': '#FF6F61'
      },
    },
  },
  plugins: [],
} satisfies Config;
