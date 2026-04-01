import { getCommandMode } from '../../purista/packages/cli/src/adapters/argv/getCommandMode.js'
import { createTerminalPromptAdapter } from '../../purista/packages/cli/src/adapters/interactive/terminalPromptAdapter.js'
import { createTerminalOutputAdapter } from '../../purista/packages/cli/src/adapters/output/terminalOutput.js'
import { PuristaCliError } from '../../purista/packages/cli/src/core/errors.js'
import { createPuristaCliEngine } from '../../purista/packages/cli/src/engine.js'

type ParsedArgs = {
	_: string[]
	[key: string]: string | boolean | string[] | undefined
}

const parseArgs = (argv: string[]): ParsedArgs => {
	const result: ParsedArgs = { _: [] }

	for (let index = 0; index < argv.length; index += 1) {
		const token = argv[index]
		if (!token.startsWith('--')) {
			result._.push(token)
			continue
		}

		const normalized = token.slice(2)
		if (normalized.startsWith('no-')) {
			result[normalized.slice(3)] = false
			continue
		}

		const next = argv[index + 1]
		if (!next || next.startsWith('--')) {
			result[normalized] = true
			continue
		}

		result[normalized] = next
		index += 1
	}

	return result
}

async function main() {
	const args = parseArgs(process.argv.slice(2))
	const mode = getCommandMode({
		interactive: args.interactive === true,
		nonInteractive: args['non-interactive'] === true,
		yes: args.yes === true,
		defaults: args.defaults === true,
	})

	const output = createTerminalOutputAdapter()
	const engine = createPuristaCliEngine({
		cwd: process.cwd(),
		mode,
		prompt: mode === 'interactive' ? createTerminalPromptAdapter() : undefined,
	})

	try {
		const result = await engine.runPuristaCommand('init-project', {
			target: args._[0],
			runtime: typeof args.runtime === 'string' ? args.runtime : undefined,
			packageManager: typeof args['package-manager'] === 'string' ? args['package-manager'] : undefined,
			type: typeof args.type === 'string' ? args.type : undefined,
			eventBridge: typeof args['event-bridge'] === 'string' ? args['event-bridge'] : undefined,
			fileConvention: typeof args['file-convention'] === 'string' ? args['file-convention'] : undefined,
			eventConvention: typeof args['event-convention'] === 'string' ? args['event-convention'] : undefined,
			linter: typeof args.linter === 'string' ? args.linter : undefined,
			formatter: typeof args.formatter === 'string' ? args.formatter : undefined,
			useWebserver: typeof args.webserver === 'boolean' ? args.webserver : undefined,
			installDependencies: typeof args.install === 'boolean' ? args.install : undefined,
		})

		output.renderResult(result)
	} catch (error) {
		output.renderError(error)
		process.exit(error instanceof PuristaCliError ? error.exitCode : 1)
	}
}

main()
