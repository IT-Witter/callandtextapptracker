import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0f1115",
        panel: "#181b22",
        panel2: "#1f232c",
        edge: "#2a2f3a",
        muted: "#8b93a3",
      },
    },
  },
  plugins: [],
};

export default config;
