import { chmod } from "node:fs/promises";
import { build } from "esbuild";

const b = () =>
  build({
    bundle: true,
    entryPoints: ["./src/index.ts"],
    banner: {
      js: "#!/usr/bin/env node",
    },
    platform: "node",
    outfile: "bin",
    format: "cjs",
    // For debug
    minify: false,
  });

await Promise.all([b()]);
await chmod("./bin", 744);
