import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(() => {
  const base = process.env.VITE_BASENAME;

  return {
    base,
    plugins: [react(), tailwindcss()],
    server: {
      port: parseInt(process.env.PORT || "11001", 10),
    },
  };
});
