import * as fs from 'node:fs'
import * as path from 'node:path'
import { convertFilename, rewriteLocalImportPaths } from './convertString.js'
import type { Settings } from './types.js'

export const walkAndRename = async (settings: Settings, dir: string) => {
	const items = await fs.promises.readdir(dir)

	for (const item of items) {
		const fullPath = path.join(dir, item)
		const stat = await fs.promises.stat(fullPath)

		if (stat.isDirectory()) {
			// Recursively walk through the subdirectory
			await walkAndRename(settings, fullPath)
		}

		// Convert the filename
		const newFilename = convertFilename(settings, item)
		const newFullPath = path.join(dir, newFilename)

		// Rename the file or directory
		await fs.promises.rename(fullPath, newFullPath)

		if (newFullPath.endsWith('.ts')) {
			const content = fs.readFileSync(newFullPath, 'utf8')
			const newContent = rewriteLocalImportPaths(settings, content)
			fs.writeFileSync(newFullPath, newContent)
		}
	}
}
