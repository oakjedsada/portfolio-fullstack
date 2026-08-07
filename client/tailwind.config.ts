import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        wall1: "#0080ff",
        wall2: "#2c3e50",
        taskbar: "#1c2333",
        taskbarEdge: "#0e1320",
        winbar: "#2b3550",
        accent: "#5b8cff",
        // accent2: "#ffb454",
      },
      boxShadow: {
        window: "0 20px 50px rgba(0,0,0,0.4)",
      },
    },
  },
  plugins: [],
} satisfies Config;
