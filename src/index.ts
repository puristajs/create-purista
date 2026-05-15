import { getCommandMode } from '../../purista/packages/cli/src/adapters/argv/getCommandMode.js'
import { createNoPromptAdapter } from '../../purista/packages/cli/src/adapters/interactive/noPromptAdapter.js'
import { createTerminalPromptAdapter } from '../../purista/packages/cli/src/adapters/interactive/terminalPromptAdapter.js'
import { createTerminalOutputAdapter } from '../../purista/packages/cli/src/adapters/output/terminalOutput.js'
import { type InitProjectInput, initProjectCommand } from '../../purista/packages/cli/src/commands/init-project.js'
import { askForMissingValues } from '../../purista/packages/cli/src/commands/shared.js'
import type { PuristaCommandContext } from '../../purista/packages/cli/src/core/command.js'
import { PuristaCliError } from '../../purista/packages/cli/src/core/errors.js'
import { parseArgs } from './parseArgs.js'

const stringArg = <T extends string>(value: unknown) => (typeof value === 'string' ? (value as T) : undefined)

async function main() {
	const args = parseArgs(process.argv.slice(2))
	const mode = getCommandMode({
		interactive: args.interactive === true,
		nonInteractive: args['non-interactive'] === true,
		yes: args.yes === true,
		defaults: args.defaults === true,
	})

	const output = createTerminalOutputAdapter()
	const context: PuristaCommandContext = {
		cwd: process.cwd(),
		mode,
		prompt: mode === 'interactive' ? createTerminalPromptAdapter() : createNoPromptAdapter(),
		applyDefaults: true,
	}

	try {
		let input: InitProjectInput = {
			target: args._[0],
			runtime: stringArg<NonNullable<InitProjectInput['runtime']>>(args.runtime),
			packageManager: stringArg<NonNullable<InitProjectInput['packageManager']>>(args['package-manager']),
			type: stringArg<NonNullable<InitProjectInput['type']>>(args.type),
			eventBridge: stringArg<NonNullable<InitProjectInput['eventBridge']>>(args['event-bridge']),
			fileConvention: stringArg<NonNullable<InitProjectInput['fileConvention']>>(args['file-convention']),
			eventConvention: stringArg<NonNullable<InitProjectInput['eventConvention']>>(args['event-convention']),
			linter: stringArg<NonNullable<InitProjectInput['linter']>>(args.linter),
			formatter: stringArg<NonNullable<InitProjectInput['formatter']>>(args.formatter),
			useWebserver: typeof args.webserver === 'boolean' ? args.webserver : undefined,
			installDependencies: typeof args.install === 'boolean' ? args.install : undefined,
		}

		let resolution = await initProjectCommand.resolve(input, context)
		while (resolution.missing.length > 0 && (context.mode === 'interactive' || context.applyDefaults)) {
			input = await askForMissingValues(input, resolution.missing, context)
			resolution = await initProjectCommand.resolve(input, context)
		}

		if (resolution.missing.length > 0 || resolution.errors.length > 0 || !resolution.resolvedInput) {
			throw new PuristaCliError(`Unable to resolve command ${initProjectCommand.id}.`, {
				command: initProjectCommand.id,
				issues: [
					...resolution.errors,
					...resolution.missing.map(prompt => ({
						code: 'missing_input',
						message: prompt.message,
						path: [prompt.key],
					})),
				],
			})
		}

		const result = await initProjectCommand.execute(resolution.resolvedInput, context)

		output.renderResult(result)
	} catch (error) {
		output.renderError(error)
		process.exit(error instanceof PuristaCliError ? error.exitCode : 1)
	}
}

main()
