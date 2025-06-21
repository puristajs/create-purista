/** Available package managers */
export type PackageManager = 'npm' | 'bun' | 'pnpm' | 'yarn'

export type Settings = {
	/** The target file path (default: process.cwd()) */
	target: string
	/** Project name */
	projectName: string
	/** Runtime used for the project */
	runtime: 'node' | 'bun'
	/** Event bridge used in the project */
	eventBridge: 'default' | 'mqtt' | 'amqp' | 'nats' | 'dapr'
	useWebserver: boolean
	/** Format convention for files (camel case, snake case...) */
	fileConvention: 'camel' | 'snake' | 'kebab' | 'pascal' | 'pascalSnake'
	/** Format convention to use for events (snake case, camel case...) */
	eventConvention:
		| 'camel'
		| 'snake'
		| 'kebab'
		| 'pascal'
		| 'pascalSnake'
		| 'constantCase'
		| 'dotCase'
		| 'pathCase'
		| 'trainCase'
	/** Linter used in the project */
	linter: 'biome' | 'eslint' | 'none'
	/** Prettier/Code-Formatter used in the project */
	formatter: 'biome' | 'prettier' | 'none'
	/** type of the project ESM or CommonJS */
	type: 'module' | 'commonjs'
	/** Package manager used in the project */
	packageManager: PackageManager
}
