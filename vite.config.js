import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base: "./" uses relative asset paths, so the built site works at
// https://<username>.github.io/<repo-name>/ whatever the repo is called,
// and also later on a custom domain or a /rent-vs-buy path.
export default defineConfig({
  plugins: [react()],
  base: "./",
});
