import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
    fontFamily: {
      LINESeedKR: ["LINESeedKR", "sans-serif"],
    },
  },
  plugins: [
    function ({ addUtilities }: any) {
      const newUtilities = {
        ".glass": {
          backgroundColor: "rgba(255, 255, 255, 0.3)",
          backdropFilter: "blur(8px)",
          boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
        },
      };

      addUtilities(newUtilities, ["responsive", "hover"]);
    },
  ],
};
export default config;
