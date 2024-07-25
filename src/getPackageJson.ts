import fs from 'node:fs'
import path from 'node:path'
import type { PackageJson } from 'type-fest'
import type { Settings } from './types.js'

export type PKG = PackageJson & { trustedDependencies?: string[] }

const bunPackage: PKG = {
	scripts: {
		start: 'bun src/index.ts',
		dev: 'bun --watch run src/index.ts',
		test: 'bun test',
	},
	dependencies: {},
	devDependencies: {
		'@types/bun': 'latest',
	},
	trustedDependencies: [],
}

const nodePackage: PKG = {
	scripts: {
		start: 'tsx src/index.ts',
		dev: 'tsx watch src/index.ts',
		test: 'vitest',
	},
	dependencies: {},
	devDependencies: {
		tsx: 'latest',
		vitest: 'latest',
	},
	trustedDependencies: [],
}

const biomePkg: PKG = {
	scripts: {
		lint: 'bunx @biomejs/biome check',
		'lint:fix': 'bunx @biomejs/biome check --write',
	},
	dependencies: {},
	devDependencies: {
		'@biomejs/biome': '^1.8.3',
	},
	trustedDependencies: ['@biomejs/biome'],
}

const eslintPkg: PKG = {
	scripts: {
		lint: 'eslint',
		'lint:fix': 'eslint --fix',
	},
	dependencies: {},
	devDependencies: {
		'@eslint/js': '^9.7.0',
		eslint: '^9.7.0',
		globals: '^15.8.0',
		'typescript-eslint': '^7.17.0',
	},
	trustedDependencies: [],
}

export const mergePackageJson = (inputPkg: PKG, mergePkg: PKG): PKG => {
	const trustedDependencies = [...(inputPkg.trustedDependencies ?? []), ...(mergePkg.trustedDependencies ?? [])]

	const newPackageJson = {
		...inputPkg,
		...mergePkg,
		trustedDependencies,
		scripts: {
			...inputPkg.scripts,
			...mergePkg.scripts,
		},
		dependencies: {
			...inputPkg.dependencies,
			...mergePkg.dependencies,
		},
		devDependencies: {
			...inputPkg.devDependencies,
			...mergePkg.dependencies,
		},
	}

	return newPackageJson as PKG
}

export const getPackageJson = (settings: Settings) => {
	const runtimePkg = settings.runtime === 'node' ? nodePackage : bunPackage

	let newPackageJson = runtimePkg

	if (settings.linter === 'eslint') {
		newPackageJson = mergePackageJson(newPackageJson, eslintPkg)
	}
	if (settings.linter === 'biome') {
		newPackageJson = mergePackageJson(newPackageJson, biomePkg)
	}

	return newPackageJson
}

export const writePackageJson = (targetDirectoryPath: string, pkg: PKG) => {
	const packageJsonPath = path.join(targetDirectoryPath, 'package.json')

	if (fs.existsSync(packageJsonPath)) {
		const packageJson = fs.readFileSync(packageJsonPath, 'utf-8')
		const newPackageJson = mergePackageJson(JSON.parse(packageJson), pkg)
		fs.writeFileSync(packageJsonPath, JSON.stringify(newPackageJson, null, 2))
	}
}
