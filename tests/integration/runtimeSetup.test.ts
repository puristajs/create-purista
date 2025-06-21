import { describe, expect, it } from 'bun:test'
import fs, { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { getPackageJson } from '../../src/getPackageJson.js'
import type { Settings } from '../../src/types.js'
import { updateTSConfigJson } from '../../src/updateTSConfigJson.js'

describe('runtime setup', () => {
	const base: Omit<Settings, 'runtime'> = {
		target: '.',
		projectName: 'app',
		eventBridge: 'default',
		useWebserver: false,
		fileConvention: 'camel',
		eventConvention: 'camel',
		linter: 'none',
		formatter: 'none',
		type: 'module',
		packageManager: 'npm',
		runtime: 'node',
	}

	it('creates tsconfig for node runtime', async () => {
		const dir = mkdtempSync(path.join(tmpdir(), 'purista-test-'))
		fs.writeFileSync(path.join(dir, 'tsconfig.json'), '{}')
		await updateTSConfigJson(dir, { ...base, runtime: 'node' } as Settings)
		const content = fs.readFileSync(path.join(dir, 'tsconfig.json'), 'utf-8')
		const cfg = JSON.parse(content)
		expect(cfg.compilerOptions.types).toContain('node')
	})

	it('creates tsconfig for bun runtime', async () => {
		const dir = mkdtempSync(path.join(tmpdir(), 'purista-test-'))
		fs.writeFileSync(path.join(dir, 'tsconfig.json'), '{}')
		await updateTSConfigJson(dir, { ...base, runtime: 'bun' } as Settings)
		const content = fs.readFileSync(path.join(dir, 'tsconfig.json'), 'utf-8')
		const cfg = JSON.parse(content)
		expect(cfg.compilerOptions.types).toContain('bun')
	})

	it('generates runtime specific package.json', () => {
		const bun = getPackageJson({ ...base, runtime: 'bun' } as Settings)
		const node = getPackageJson({ ...base, runtime: 'node' } as Settings)
		expect(bun.scripts.start).toContain('bun')
		expect(node.scripts.start).toContain('tsx')
	})
})
