import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const base = env.VITE_BASENAME || "/";

  return {
    base,
    plugins: [react(), tailwindcss()],
    server: {
      port: parseInt(env.PORT || "11001", 10),
    },
  };
});
