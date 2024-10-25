import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default ({ mode }: { mode: string }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };

  return defineConfig({
    base: "/around-the-world/",
    resolve: {
      alias: {
        "@components": path.resolve(__dirname, "./src/components"),
        "@data": path.resolve(__dirname, "./src/data"),
        "@hooks": path.resolve(__dirname, "./src/hooks"),
        "@interfaces": path.resolve(__dirname, "./src/interfaces"),
        "@pages": path.resolve(__dirname, "./src/pages"),
        "@utils": path.resolve(__dirname, "./src/utils"),
      },
    },
    plugins: [react()],
    define: {
      BUILD_DATE: new Date().getFullYear(),
    },
  });
};
