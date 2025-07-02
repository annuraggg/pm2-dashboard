import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(() => {
  const env = loadEnv("", "", "");

  const base = env.VITE_BASENAME || "/";

  return {
    base,
    plugins: [react(), tailwindcss()],
    server: {
      port: parseInt(env.PORT || "5173", 10),
    },
  };
});
