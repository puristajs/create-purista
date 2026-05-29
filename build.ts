import { build } from 'esbuild'

const b = () =>
	build({
		bundle: true,
		entryPoints: ['./src/index.ts'],
		banner: {
			js: '#!/usr/bin/env node\nimport { createRequire as __createRequire } from "node:module";import { fileURLToPath as __fileURLToPath } from "node:url";import { dirname as __dirnameOf } from "node:path";const require = __createRequire(import.meta.url);const __filename = __fileURLToPath(import.meta.url);const __dirname = __dirnameOf(__filename);',
		},
		platform: 'node',
		outfile: 'bin.js',
		format: 'esm',
		minify: true,
	})

await Promise.all([b()])
