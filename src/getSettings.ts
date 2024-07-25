import input from '@inquirer/input'
import select from '@inquirer/select'
import chalk from 'chalk'
import { execa } from 'execa'
import path from 'node:path'
import type { Arguments } from 'yargs-parser'
import { version } from '../package.json'
import type { PackageManager, Settings } from './types.js'

const runtimes = [
	{ value: 'node', name: 'Node.js' },
	{ value: 'bun', name: 'Bun' },
]

const moduleTypes = [
	{ value: 'module', name: 'ESM' },
	{ value: 'commonjs', name: 'CommonJS' },
]

const bridges = [
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

const fileConvetions = [
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
]

const linters = [
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
		name: 'DO not install a linter',
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

const knownPackageManagerNames = ['bun', 'npm', 'pnpm', 'yarn']

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
		projectName: 'my-app',
		runtime: 'node',
		eventBridge: 'default',
		useWebserver: false,
		fileConvention: 'camel',
		linter: 'biome',
		type: 'module',
		packageManager: 'npm',
	}

	console.log(chalk.gray(`create-purista version ${version}`))

	const { install, pm, template: templateArg } = args

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
		templateArg ||
		(await select({
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

  if (pm && installedPackageManagerNames.includes(pm)) {
    config.packageManager = pm
  } else if (config.runtime==='bun' && installedPackageManagerNames.includes('bun')) {
    config.packageManager='bun'
  } else{
		config.packageManager = await select({
			message: 'Which package manager do you want to use?',
			choices: installedPackageManagerNames.map((template: string) => ({
				title: template,
				value: template as PackageManager,
			})),
			default: currentPackageManager,
		})
	}

	config.type =
		templateArg ||
		(await select({
			loop: true,
			message: 'Do you want to create an ESM or CommonJS?',
			choices: moduleTypes,
			default: 0,
		}))

	config.fileConvention =
		templateArg ||
		(await select({
			loop: true,
			message: 'Which file naming convention do you prefer?',
			choices: fileConvetions,
			default: 0,
		}))

	config.linter =
		templateArg ||
		(await select({
			loop: true,
			message: 'Which linter and code prettifier do you prefer?',
			choices: linters,
			default: 0,
		}))

	config.eventBridge =
		templateArg ||
		(await select({
			loop: true,
			message: 'Choose the Event Bridge',
			choices: bridges,
			default: 0,
		}))

	if (config.eventBridge !== 'dapr') {
		config.useWebserver =
			templateArg ||
			(await select({
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
