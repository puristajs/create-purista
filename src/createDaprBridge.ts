import { join } from 'node:path'
import { createSpinner } from 'nanospinner'
// @ts-expect-error tiged does not have types
import tiged from 'tiged'
import { convertFilename } from './convertString.js'
import { copyFileFromRepo } from './copyFileFromRepo.js'
import { templateConfig } from './templateConfig.js'
import type { Settings } from './types.js'
import { walkAndRename } from './walkAndRename.js'

const getRepoContentUrl = `https://api.github.com/repos/${templateConfig.user}/${templateConfig.repository}/git/trees/${templateConfig.ref}?recursive=true`

export const createDaprBridge = async (targetDirectoryPath: string, settings: Settings) => {
	const templateName = 'dapr'
	const spinnerRepo = createSpinner(`Cloning the ${templateName} template`).start()

	await new Promise((resolve, reject) => {
		const emitter = tiged(
			`${templateConfig.user}/${templateConfig.repository}/${templateConfig.directory}/${templateName}#${templateConfig.ref}`,
			{
				cache: false,
				force: true,
			},
		)
		emitter
			.clone(targetDirectoryPath)
			.then(() => {
				resolve({})
			})
			.catch(reject)
	})

	await walkAndRename(settings, targetDirectoryPath)

	spinnerRepo.success()

	const fileListResponse = await fetch(getRepoContentUrl)
	if (!fileListResponse.ok) {
		console.error('Unable to fetch repository')
		throw new Error('Unable to fetch repository')
	}
	const fileListAll = (await fileListResponse.json()) as {
		tree: { path: string; type: 'tree' | 'blob' }[]
	}

	const getFilesFromRepo = async (subPath: string) => {
		const eventBridgeFiles = fileListAll.tree
			.filter(entry => entry.path.startsWith(`${templateConfig.directory}/${subPath}`) && entry.type === 'blob')
			.map(e => {
				const p = e.path
					.split('/') // split the path
					.slice(subPath.split('/').length + 1) // remove prefix-folders
					.map(n => convertFilename(settings, n)) // convert to preferred casing
				return copyFileFromRepo(settings, targetDirectoryPath, e.path, join(...p))
			})

		await Promise.all(eventBridgeFiles)
	}

	const spinnerEventBridge = createSpinner('Copy the event bridge files').start()
	await getFilesFromRepo(`eventbridge/${settings.eventBridge}`)
	spinnerEventBridge.success()

	if (settings.linter !== 'none') {
		const spinnerLinter = createSpinner('Copy the linter config').start()
		const confPath = settings.linter === 'biome' ? 'biome' : `eslint_${settings.type}`
		await getFilesFromRepo(`linter/${confPath}`)
		spinnerLinter.success()
	}
}
