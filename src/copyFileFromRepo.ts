import fs from 'node:fs'
import path, { join } from 'node:path'

import { rewriteLocalImportPaths } from './convertString.js'
import { type PKG, writePackageJson } from './getPackageJson.js'
import { templateConfig } from './templateConfig.js'
import type { Settings } from './types.js'

export const copyFileFromRepo = async (
	settings: Settings,
	targetDirectoryPath: string,
	sourcePath: string,
	destination: string,
) => {
	const url = `https://raw.githubusercontent.com/${templateConfig.user}/${templateConfig.repository}/${templateConfig.ref}/${sourcePath}`
	const resp = await fetch(url)
	if (!resp.ok) {
		console.error(`Unable to load ${sourcePath}`)
		return
	}

	const dest = join(targetDirectoryPath, destination)

	const p = path.dirname(dest)
	fs.mkdirSync(p, { recursive: true })

	if (dest.endsWith('package.json')) {
		const content = (await resp.json()) as PKG
		writePackageJson(path.dirname(dest), content)
		return
	}

	const content = await resp.text()

	fs.writeFileSync(dest, rewriteLocalImportPaths(settings, content))
}
