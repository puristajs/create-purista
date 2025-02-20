import path from 'node:path'
import { createDaprBridge } from './createDaprBridge.js'
import { createRegularBridges } from './createRegularBridges.js'
import { getPackageJson, writePackageJson } from './getPackageJson.js'
import { setPuristaConfig } from './setPuristaConfig.js'

import type { Settings } from './types.js'
import { updateTSConfigJson } from './updateTSConfigJson.js'

export const initFiles = async (settings: Settings) => {
	const targetDirectoryPath = path.join(process.cwd(), settings.target)

	if (settings.eventBridge === 'dapr') {
		await createDaprBridge(targetDirectoryPath, settings)
	} else {
		await createRegularBridges(targetDirectoryPath, settings)
	}

	writePackageJson(targetDirectoryPath, getPackageJson(settings))
	updateTSConfigJson(targetDirectoryPath, settings)

	await setPuristaConfig(settings, targetDirectoryPath)
}
