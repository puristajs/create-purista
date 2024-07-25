import { build } from 'esbuild'

const b = () =>
	build({
		bundle: true,
		entryPoints: ['./src/index.ts'],
		banner: {
			js: '#!/usr/bin/env node',
		},
		platform: 'node',
		outfile: 'bin',
		format: 'cjs',
		// For debug
		minify: true,
	})

await Promise.all([b()])
