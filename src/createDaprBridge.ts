import { createSpinner } from 'nanospinner'
// @ts-expect-error tiged does not have types
import tiged from 'tiged'
import { templateConig } from './templateConig.js'
import type { Settings } from './types.js'

export const createDaprBridge = async (targetDirectoryPath: string, settings: Settings) => {
	const templateName = 'dapr'

	const spinner = createSpinner(`Cloning the ${templateName} template`).start()

	await new Promise(res => {
		const emitter = tiged(
			`${templateConig.user}/${templateConig.repository}/${templateConig.directory}/${templateName}#${templateConig.ref}`,
			{
				cache: false,
				force: true,
			},
		)
		emitter.clone(targetDirectoryPath).then(() => {
			spinner.success()
			res({})
		})
	})
}
