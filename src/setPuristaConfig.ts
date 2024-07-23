import fs from 'node:fs'
import path from 'node:path'
import type { Settings } from './types.js'

export const setPuristaConfig = async (settings: Settings, targetDirectoryPath: string) => {
	const puristaJsonPath = path.join(targetDirectoryPath, 'purista.json')

	if (fs.existsSync(puristaJsonPath)) {
		const puristaJson = fs.readFileSync(puristaJsonPath, 'utf-8')
		const newPuristaJson = {
			...JSON.parse(puristaJson),
			runtime: settings.runtime,
			eventBridge: settings.eventBridge,
			fileConvention: settings.fileConvention,
			linter: settings.linter,
		}
		fs.writeFileSync(puristaJsonPath, JSON.stringify(newPuristaJson, null, 2))
	}
}
