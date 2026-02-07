import path from 'node:path'
import input from '@inquirer/input'
import select from '@inquirer/select'
import chalk from 'chalk'
import { execa } from 'execa'
import type { Arguments } from 'yargs-parser'
import { version } from '../package.json'
import type { PackageManager, Settings } from './types.js'

type Runtime = Settings['runtime']
type ModuleType = Settings['type']
type FileConvention = Settings['fileConvention']
type EventConvention = Settings['eventConvention']
type Linter = Settings['linter']
type EventBridge = Settings['eventBridge']

const runtimes: { value: Runtime; name: string }[] = [
	{ value: 'node', name: 'Node.js' },
	{ value: 'bun', name: 'Bun' },
]

const moduleTypes: { value: ModuleType; name: string }[] = [
	{ value: 'module', name: 'ESM' },
	{ value: 'commonjs', name: 'CommonJS' },
]

const bridges: { value: EventBridge; name: string; description: string }[] = [
	{
		value: 'default',
		name: 'Default',
		description: 'In-Memory without scaling',
	},
	{ value: 'amqp', name: 'AMQP', description: 'Message Broker like RabbitMQ' },
	{ value: 'nats', name: 'NATS', description: 'NATS Message Broker' },
	{
		value: 'mqtt',
		name: 'MQTT',
		description: 'MQTT Message Broker like Mosquitto',
	},
	{ value: 'dapr', name: 'Dapr', description: 'Dapr Runtime' },
]

const fileConventions: { value: FileConvention; name: string; description: string }[] = [
	{
		value: 'camel',
		name: 'camel case',
		description: 'myFileInCamelCase.ts',
	},
	{
		value: 'snake',
		name: 'snake case',
		description: 'my_file_in_snake_case.ts',
	},
	{
		value: 'kebab',
		name: 'kebab case',
		description: 'my-file-in-snake-case.ts',
	},
	{
		value: 'pascal',
		name: 'pascal case',
		description: 'MyFileInPascalCase.ts',
	},
	{
		value: 'pascalSnake',
		name: 'pascal snake case',
		description: 'My_File_In_Pascal_Case.ts',
	},
]

const eventConventions: { value: EventConvention; name: string; description: string }[] = [
	{
		value: 'camel',
		name: 'camel case',
		description: 'myEvent',
	},
	{
		value: 'snake',
		name: 'snake case',
		description: 'my_event',
	},
	{
		value: 'kebab',
		name: 'kebab case',
		description: 'my-event',
	},
	{
		value: 'pascal',
		name: 'pascal case',
		description: 'MyEvent',
	},
	{
		value: 'pascalSnake',
		name: 'pascal snake case',
		description: 'My_Event',
	},
	{
		value: 'constantCase',
		name: 'constant case',
		description: 'MY_EVENT',
	},
	{
		value: 'dotCase',
		name: 'dot case',
		description: 'my.event',
	},
	{
		value: 'pathCase',
		name: 'path case',
		description: 'my/event',
	},
	{
		value: 'trainCase',
		name: 'train case',
		description: 'My-Event',
	},
]

const linters: { value: Linter; name: string; description: string }[] = [
	{
		value: 'biome',
		name: 'Biome',
		description: 'https://biomejs.dev/',
	},
	{
		value: 'eslint',
		name: 'ESLint',
		description: 'https://eslint.org/',
	},
	{
		value: 'none',
		name: 'Do not install a linter',
		description: 'https://eslint.org/',
	},
]

function getCurrentPackageManager(): PackageManager {
	const agent = process.env.npm_config_user_agent || 'npm' // Types say it might be undefined, just being cautious;

	if (agent.startsWith('bun')) return 'bun'
	if (agent.startsWith('pnpm')) return 'pnpm'
	if (agent.startsWith('yarn')) return 'yarn'

	return 'npm'
}

const currentPackageManager = getCurrentPackageManager()

const knownPackageManagerNames: PackageManager[] = ['bun', 'npm', 'pnpm', 'yarn']
const knownRuntimes: Runtime[] = ['node', 'bun']
const knownModuleTypes: ModuleType[] = ['module', 'commonjs']
const knownFileConventions: FileConvention[] = ['camel', 'snake', 'kebab', 'pascal', 'pascalSnake']
const knownEventConventions = [
	'camel',
	'snake',
	'kebab',
	'pascal',
	'pascalSnake',
	'constantCase',
	'dotCase',
	'pathCase',
	'trainCase',
] as EventConvention[]
const knownLinters: Linter[] = ['biome', 'eslint', 'none']
const knownBridges: EventBridge[] = ['default', 'mqtt', 'amqp', 'nats', 'dapr']

export const getStringArgument = (value: unknown): string | undefined => {
	return typeof value === 'string' && value.length > 0 ? value : undefined
}

export const getBooleanArgument = (value: unknown): boolean | undefined => {
	return typeof value === 'boolean' ? value : undefined
}

export const getOneOfArgument = <T extends string>(value: unknown, allowed: readonly T[]): T | undefined => {
	const arg = getStringArgument(value)
	if (!arg) {
		return undefined
	}
	return allowed.includes(arg as T) ? (arg as T) : undefined
}

function checkPackageManagerInstalled(packageManager: string) {
	return new Promise<boolean>(resolve => {
		execa(packageManager, ['--version'])
			.then(() => resolve(true))
			.catch(() => resolve(false))
	})
}

export const getSettings = async (args: Arguments) => {
	const config: Settings = {
		target: '',
		projectName: 'purista-app',
		runtime: 'node',
		eventBridge: 'default',
		useWebserver: false,
		fileConvention: 'camel',
		eventConvention: 'camel',
		linter: 'biome',
		formatter: 'biome',
		type: 'module',
		packageManager: 'npm',
	}

	console.log(chalk.gray(`create-purista version ${version}`))

	const packageManagerArg = getOneOfArgument(args.pm, knownPackageManagerNames)
	// Keep backwards compatibility for `--template <runtime>` while preferring dedicated `--runtime`.
	const runtimeArg = getOneOfArgument(args.runtime, knownRuntimes) ?? getOneOfArgument(args.template, knownRuntimes)
	const moduleTypeArg = getOneOfArgument(args.type, knownModuleTypes)
	const fileConventionArg = getOneOfArgument(args.fileConvention, knownFileConventions)
	const eventConventionArg = getOneOfArgument(args.eventConvention, knownEventConventions)
	const linterArg = getOneOfArgument(args.linter, knownLinters)
	const eventBridgeArg = getOneOfArgument(args.eventBridge, knownBridges)
	const useWebserverArg = getBooleanArgument(args.useWebserver)

	if (args._[0]) {
		config.target = args._[0].toString()
		console.log(`${chalk.bold(`${chalk.green('✔')} Using target directory`)} … ${config.target}`)
	} else {
		const answer = await input({
			message: 'Target directory',
			default: 'my-app',
		})
		config.target = answer
	}

	if (config.target === '.') {
		config.projectName = path.basename(process.cwd())
	} else {
		config.projectName = path.basename(config.target)
	}

	config.runtime =
		runtimeArg ??
		(await select<Runtime>({
			loop: true,
			message: 'Which runtime do you use?',
			choices: runtimes,
			default: 0,
		}))

	const installedPackageManagerNames = await Promise.all(
		knownPackageManagerNames.map(checkPackageManagerInstalled),
	).then(results => knownPackageManagerNames.filter((_, index) => results[index]))

	if (!installedPackageManagerNames.length) {
		console.error('Looks like no package manager is installed')
	}

	if (packageManagerArg && installedPackageManagerNames.includes(packageManagerArg)) {
		config.packageManager = packageManagerArg
	} else if (config.runtime === 'bun' && installedPackageManagerNames.includes('bun')) {
		config.packageManager = 'bun'
	} else {
		config.packageManager = await select<PackageManager>({
			message: 'Which package manager do you want to use?',
			choices: installedPackageManagerNames.map((packageManager: PackageManager) => ({
				name: packageManager,
				value: packageManager,
			})),
			default: currentPackageManager,
		})
	}

	config.type =
		moduleTypeArg ||
		(await select<ModuleType>({
			loop: true,
			message: 'Do you want to create an ESM or CommonJS?',
			choices: moduleTypes,
			default: 0,
		}))

	config.fileConvention =
		fileConventionArg ||
		(await select<FileConvention>({
			loop: true,
			message: 'Which file naming convention do you prefer?',
			choices: fileConventions,
			default: 0,
		}))

	config.eventConvention =
		eventConventionArg ||
		(await select<EventConvention>({
			loop: true,
			message: 'Which naming convention should be used for events?',
			choices: eventConventions,
			default: 0,
		}))

	config.linter =
		linterArg ||
		(await select<Linter>({
			loop: true,
			message: 'Which linter and code prettifier do you prefer?',
			choices: linters,
			default: 0,
		}))

	config.eventBridge =
		eventBridgeArg ||
		(await select<EventBridge>({
			loop: true,
			message: 'Choose the Event Bridge',
			choices: bridges,
			default: 0,
		}))

	if (config.eventBridge !== 'dapr') {
		config.useWebserver =
			useWebserverArg ??
			(await select<boolean>({
				loop: true,
				message: 'Install Webservice',
				choices: [
					{
						value: true,
						name: 'Yes',
					},
					{
						value: false,
						name: 'No',
					},
				],
				default: 0,
			}))
	}

	return config
}
