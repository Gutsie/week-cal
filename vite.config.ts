import { defineConfig } from "vite";

// Relative base so the build works on GitHub Pages under any repo name
// (https://<user>.github.io/<repo>/) as well as from a custom domain.
export default defineConfig({
  base: "./",
});
