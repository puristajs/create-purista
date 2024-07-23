import type { PackageJson } from 'type-fest'
import type { Settings } from './types.js'

const bunDefaultScripts = {
	start: 'bun src/index.ts',
	dev: 'bun --watch run src/index.ts',
	test: 'bun test',
}

const nodeDefaultScripts = {
	start: 'tsx src/index.ts',
	dev: 'tsx watch src/index.ts',
	test: 'vitest',
}

const nodeDeps = {
	tsx: 'latest',
	vitest: 'latest',
}

const bunDeps = {}

const nodeDevDeps = {
	tsx: 'latest',
	vitest: 'latest',
}

const bunDevDeps = {
	'@types/bun': 'latest',
}

const eventBrigeDeps = {
	default: {
		scripts: {},
		dependencies: {},
		devDependencies: {},
	},
	mqtt: {
		scripts: {},
		dependencies: {
			'@purista/mqttbridge': 'latest',
		},
		devDependencies: {},
	},
	amqp: {
		scripts: {},
		dependencies: {
			'@purista/amqpbridge': 'latest',
		},
		devDependencies: {},
	},
	nats: {
		scripts: {},
		dependencies: {
			'@purista/natsbridge': 'latest',
		},
		devDependencies: {},
	},
	dapr: {
		scripts: {},
		dependencies: {},
		devDependencies: {},
	},
}

export const getPackageJson = (input: PackageJson, settings: Settings) => {
	const scripts = settings.runtime === 'node' ? nodeDefaultScripts : bunDefaultScripts
	const deps = settings.runtime === 'node' ? nodeDeps : bunDeps
	const devDeps = settings.runtime === 'node' ? nodeDevDeps : bunDevDeps

	const bridgePkg = eventBrigeDeps[settings.eventBridge] ?? eventBrigeDeps.default

	const trustedDependencies = []
	if (settings.linter === 'biome') {
		trustedDependencies.push('@biomejs/biome')
	}

	const newPackageJson = {
		name: settings.projectName,
		...input,
		...bridgePkg,
		type: settings.type,
		trustedDependencies,
		scripts: {
			...input.scripts,
			...scripts,
			...bridgePkg.scripts,
		},
		dependencies: {
			...input.dependencies,
			...deps,
			...bridgePkg.dependencies,
		},
		devDependencies: {
			...input.devDependencies,
			...devDeps,
			...bridgePkg.devDependencies,
		},
	}

	return newPackageJson
}
