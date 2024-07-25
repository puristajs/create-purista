export type PackageManager = 'npm' | 'bun' | 'pnpm' | 'yarn'

export type Settings = {
	target: string
	projectName: string
	runtime: 'node' | 'bun'
	eventBridge: 'default' | 'mqtt' | 'amqp' | 'nats' | 'dapr'
	useWebserver: boolean
	fileConvention: 'camel' | 'snake' | 'kebab' | 'pascal' | 'pascalSnake'
	linter: 'biome' | 'eslint' | 'none'
	type: 'module' | 'commonjs'
	packageManager: PackageManager
}
