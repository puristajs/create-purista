import { createSpinner } from 'nanospinner'
// @ts-expect-error tiged does not have types
import { join } from 'node:path'
import tiged from 'tiged'
import { copyFileFromRepo } from './copyFileFromRepo.js'
import { templateConig } from './templateConig.js'
import type { Settings } from './types.js'

const getRepoContentUrl = `https://api.github.com/repos/${templateConig.user}/${templateConig.repository}/git/trees/${templateConig.ref}?recursive=true`

export const createRegularBridges = async (targetDirectoryPath: string, settings: Settings) => {
	const templateName = settings.eventBridge === 'dapr' ? 'dapr' : 'base'

	const spinner = createSpinner(`Cloning the ${templateName} template`).start()

	await new Promise((resolve, reject) => {
		const emitter = tiged(
			`${templateConig.user}/${templateConig.repository}/${templateConig.directory}/${templateName}#${templateConig.ref}`,
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

	const fileListResponse = await fetch(getRepoContentUrl)
	if (!fileListResponse.ok) {
		spinner.error({ text: 'Failed to load template file list' })
	}
	const fileListAll = (await fileListResponse.json()) as { tree: { path: string }[] }

	const eventBridgeFiles = fileListAll.tree
		.filter(entry => entry.path.startsWith(`${templateConig.directory}/eventbridge/${settings.eventBridge}`))
		.map(e => {
			const p = e.path.split('/').slice(3)
			return copyFileFromRepo(e.path, join(targetDirectoryPath,...p))
		})

	await Promise.all(eventBridgeFiles)

	spinner.success()
}
