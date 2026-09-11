import { describe, expect, it } from 'bun:test'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readdirSync, readFileSync, rmSync, statSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const packageRoot = resolve(fileURLToPath(new URL('..', import.meta.url)))
const bundledBin = join(packageRoot, 'bin.js')
const puristaCliBin = resolve(packageRoot, '../purista/packages/cli/dist/bin.js')

const readProjectFiles = (directory: string): Array<[string, string]> =>
	readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
		const path = join(directory, entry.name)
		if (entry.isDirectory()) {
			return readProjectFiles(path)
		}
		if (entry.isSymbolicLink()) {
			return []
		}
		return [[path, readFileSync(path, 'utf8')]]
	})

describe('bundled create-purista artifact', () => {
	it('creates a credential-free v4 project through the shipped bin', () => {
		const temporaryRoot = mkdtempSync(join(tmpdir(), 'create-purista-v4-'))
		const target = join(temporaryRoot, 'fresh-project')

		try {
			expect(statSync(bundledBin).isFile()).toBe(true)
			execFileSync(
				process.execPath,
				[
					bundledBin,
					target,
					'--runtime',
					'node',
					'--event-bridge',
					'default',
					'--defaults',
					'--non-interactive',
					'--no-install',
				],
				{ cwd: temporaryRoot, encoding: 'utf8' },
			)

			const manifest = JSON.parse(readFileSync(join(target, 'package.json'), 'utf8'))
			const puristaConfig = JSON.parse(readFileSync(join(target, 'purista.json'), 'utf8'))
			const files = readProjectFiles(target)
			const generatedText = files.map(([, content]) => content).join('\n')

			expect(manifest.private).toBe(true)
			expect(manifest.type).toBe('module')
			expect(manifest.dependencies['@purista/core']).toBe('^4.0.0')
			expect(manifest.dependencies.zod).toBe('^4.4.3')
			expect(manifest.devDependencies['@purista/cli']).toBe('^4.0.0')
			expect(manifest.scripts).toMatchObject({
				'add:agent': 'purista add agent',
				'add:workflow': 'purista add workflow',
				'add:tool': 'purista add tool',
				'add:skill': 'purista add skill',
				'add:mcp': 'purista add mcp',
			})
			expect(puristaConfig.servicePath).toBe('src/service')
			expect(files.some(([path]) => path.endsWith('/src/service/ping/v1/pingV1Service.ts'))).toBe(true)
			expect(files.some(([path]) => path.includes('/src/harness/'))).toBe(false)
			expect(generatedText).not.toMatch(/(?:"|')(?:latest|workspace:|file:|link:|copy:)/i)
			expect(generatedText).not.toMatch(/src\/harness|defineHarnessModule|getAgentQueueBuilder|ai\.model\b/i)

			execFileSync(
				process.execPath,
				[
					puristaCliBin,
					'add',
					'agent',
					'assistant',
					'--service',
					'ping',
					'--service-version',
					'1',
					'--description',
					'Assistant',
					'--model-alias',
					'assistant',
					'--defaults',
					'--non-interactive',
				],
				{ cwd: target, encoding: 'utf8' },
			)

			const agentManifest = JSON.parse(readFileSync(join(target, 'package.json'), 'utf8'))
			const agentSource = readFileSync(
				join(target, 'src/service/ping/v1/harness/agent/assistant/assistantAgent.ts'),
				'utf8',
			)
			const agentTest = readFileSync(
				join(target, 'src/service/ping/v1/harness/agent/assistant/assistantAgent.test.ts'),
				'utf8',
			)
			const harness = readFileSync(join(target, 'src/service/ping/v1/harness/pingHarness.ts'), 'utf8')
			const service = readFileSync(join(target, 'src/service/ping/v1/pingV1Service.ts'), 'utf8')
			const bootstrap = readFileSync(join(target, 'src/index.ts'), 'utf8')
			const envSchema = readFileSync(join(target, 'src/config/env.ts'), 'utf8')
			const envExample = readFileSync(join(target, '.env.example'), 'utf8')

			expect(agentManifest.dependencies['@purista/harness']).toBe('^4.0.0')
			expect(agentManifest.dependencies['@purista/harness-openai']).toBe('^4.0.0')
			expect(agentSource).toContain("defineAgent('assistant'")
			expect(agentSource).toMatch(/model:\s*['"]assistant['"]/)
			expect(agentTest).toContain('FakeModelProvider')
			expect(harness).toContain('.addAgent(assistantAgent)')
			expect(service.match(/\.mountHarness\(/g)).toHaveLength(1)
			expect(bootstrap).toContain('ai: {')
			expect(bootstrap).toContain('models: {')
			expect(bootstrap).toContain('assistant: {')
			expect(bootstrap).toContain('openai({ apiKey: env.OPENAI_API_KEY })')
			expect(envSchema).toContain('OPENAI_API_KEY: z.string().min(1)')
			expect(envExample).toBe('OPENAI_API_KEY=\n')
		} finally {
			rmSync(temporaryRoot, { recursive: true, force: true })
		}
	})

	it('would pack only the self-contained published artifact without a network cache', () => {
		const temporaryRoot = mkdtempSync(join(tmpdir(), 'create-purista-pack-'))

		try {
			const packed = JSON.parse(
				execFileSync('npm', ['pack', '--dry-run', '--json', '--ignore-scripts'], {
					cwd: packageRoot,
					encoding: 'utf8',
					env: { ...process.env, npm_config_cache: join(temporaryRoot, 'npm-cache') },
				}),
			)
			const packedPaths = packed[0].files.map((file: { path: string }) => file.path).sort()

			expect(packed[0].id).toBe('create-purista@3.0.0')
			expect(packedPaths).toEqual(['LICENSE', 'README.md', 'bin.js', 'package.json'])
			expect(packedPaths.some((path: string) => path.startsWith('src/') || path.includes('purista/'))).toBe(false)
		} finally {
			rmSync(temporaryRoot, { recursive: true, force: true })
		}
	})

	it('ships a self-contained v4 bundle without stale Harness guidance', () => {
		const packageManifest = JSON.parse(readFileSync(join(packageRoot, 'package.json'), 'utf8'))
		const artifact = readFileSync(bundledBin, 'utf8')

		expect(packageManifest.version).toBe('3.0.0')
		expect(packageManifest.files).toEqual(['bin.js'])
		expect(artifact.startsWith('#!/usr/bin/env node')).toBe(true)
		expect(artifact).not.toContain('../../purista/packages/cli')
		expect(artifact).toContain('src/service/<service>/v<version>/harness/{agent,workflow,tool,skill,mcp}')
		expect(artifact).not.toMatch(/src\/harness|defineHarnessModule|getAgentQueueBuilder|ai\.model\b/i)
		expect(artifact).toContain('ai.models')
	})
})
