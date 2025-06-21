import { exec } from 'node:child_process'
import { chdir, exit } from 'node:process'
import chalk from 'chalk'
import { createSpinner } from 'nanospinner'
import type { PackageManager, Settings } from './types.js'

const knownPackageManagers: { [key: string]: string } = {
	npm: 'npm install',
	bun: 'bun install',
	pnpm: 'pnpm install',
	yarn: 'yarn',
}

export const installDependencies = async (packageManager: PackageManager, settings: Settings) => {
	chdir(settings.target)

	if (!knownPackageManagers[packageManager]) {
		console.log(`Unknown package manager ${packageManager}`)
		exit(1)
	}

	const spinnerDeps = createSpinner('Installing project dependencies').start()
	const procDeps = exec(knownPackageManagers[packageManager])
	procDeps.stdout?.pipe(process.stdout)
	procDeps.stderr?.pipe(process.stderr)

	const procDepsExit: number = await new Promise(res => {
		procDeps.on('exit', code => res(code == null ? 0xff : code))
	})

	procDeps.on('error', console.error)

	if (procDepsExit === 0) {
		spinnerDeps.success()
	} else {
		spinnerDeps.stop({
			mark: chalk.red('×'),
			text: 'Failed to install project dependencies',
		})
		exit(procDepsExit)
	}
}
