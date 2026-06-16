/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    container: false,
    extend: {
      colors: {
        bone:        "#F4EFE6",
        "bone-2":    "#ECE5D6",
        ink:         "#0E0E10",
        "ink-2":     "#2A2A2E",
        oxblood:     "#6E1023",
        "oxblood-2": "#4A0A18",
        chartreuse:  "#C5D24A",
        "blue-black":"#16202B",
        background:  "#F4EFE6",
        foreground:  "#0E0E10",
        border:      "rgba(14, 14, 16, 0.18)",
        ring:        "#6E1023",
        muted: { DEFAULT: "#2A2A2E", foreground: "#5A5A60" },
      },
      fontFamily: {
        sans:    ["var(--font-sans)",    "Geist", "ui-sans-serif"],
        display: ["var(--font-display)", "Fraunces", "ui-serif", "Georgia", "serif"],
        mono:    ["var(--font-mono)",    "Geist Mono", "ui-monospace"],
      },
      keyframes: {
        float:  { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-8px)" } },
        spinSlow: { to: { transform: "rotate(360deg)" } },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "spin-slow": "spinSlow 90s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
