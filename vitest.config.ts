import { defineConfig } from "vitest/config";

// Solo unit test su logica pura (src/utils) — nessun DOM/componente per ora,
// niente serve un environment jsdom.
export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
  },
});
