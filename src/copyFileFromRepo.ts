import fs from 'node:fs'
import path from 'node:path'

import { type PKG, writePackageJson } from './getPackageJson.js'
import { templateConig } from './templateConig.js'

export const copyFileFromRepo = async (sourcePath: string, dest: string) => {
	const url = `https://raw.githubusercontent.com/${templateConig.user}/${templateConig.repository}/${templateConig.ref}/${sourcePath}`
	const resp = await fetch(url)
	if (!resp.ok) {
		console.error('Unable to load default config for event bridge')
		return
	}
	const p = path.dirname(dest)
	fs.mkdirSync(p, { recursive: true })

	if (dest.endsWith('package.json')) {
		const content = (await resp.json()) as PKG
		writePackageJson(path.basename(dest), content)
		return
	}

	const content = await resp.text()

	fs.writeFileSync(dest, content)
}
