import fs from 'node:fs'
import path from 'node:path'
import type { PackageJson } from 'type-fest'
import type { Settings } from './types.js'

export type PKG = PackageJson & { trustedDependencies?: string[] }

const bunPackage: PKG = {
	scripts: {
		start: 'bun src/index.ts',
		build: 'tsc',
		dev: 'bun --watch run src/index.ts',
		test: 'tsc --noEmit && bun test',
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
		build: 'tsc',
		dev: 'tsx watch src/index.ts',
		test: 'tsc --noEmit && vitest',
	},
	dependencies: {},
	devDependencies: {
		tsx: 'latest',
		vitest: 'latest',
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
			...mergePkg.devDependencies,
		},
	}

	return newPackageJson as PKG
}

export const getPackageJson = (settings: Settings): PKG => {
	const runtimePkg = settings.runtime === 'node' ? nodePackage : bunPackage

	return {
		name: settings.projectName,
		...runtimePkg,
		type: settings.type,
	} as PKG
}

export const writePackageJson = (targetDirectoryPath: string, pkg: PKG) => {
	const packageJsonPath = path.join(targetDirectoryPath, 'package.json')

	if (fs.existsSync(packageJsonPath)) {
		const packageJson = fs.readFileSync(packageJsonPath, 'utf-8')
		const newPackageJson = mergePackageJson(JSON.parse(packageJson), pkg)
		fs.writeFileSync(packageJsonPath, JSON.stringify(newPackageJson, null, 2))
	} else {
		fs.writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2))
	}
}
