import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  base: process.env.BASE_PATH ?? "/",
  resolve: {
    alias: {
      "@content": resolve(__dirname, "content"),
    },
  },
});
