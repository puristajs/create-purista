import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import type { TsConfigJson } from 'type-fest'
import type { Settings } from './types.js'

export const updateTSConfigJson = async (targetDirectoryPath: string, settings: Settings) => {
	const tsConfigFilePath = join(targetDirectoryPath, 'tsconfig.json')

	const content = await readFile(tsConfigFilePath, 'utf-8')

	let tsConfig: TsConfigJson = JSON.parse(content)

	if (settings.runtime === 'bun') {
		tsConfig = {
			...tsConfig,
			compilerOptions: {
				...tsConfig.compilerOptions,
				types: ['bun'],
			},
		}
	} else {
		tsConfig = {
			...tsConfig,
			compilerOptions: {
				...tsConfig.compilerOptions,
				types: ['node'],
			},
		}
	}

	await writeFile(tsConfigFilePath, JSON.stringify(tsConfig, null, 2), 'utf-8')
}
