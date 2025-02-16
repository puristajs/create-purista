import * as changeCase from 'change-case'
import type { Settings } from './types.js'

export const convertString = (settings: Settings, input: string) => {
	switch (settings.fileConvention) {
		case 'camel':
			return changeCase.camelCase(input)
		case 'snake':
			return changeCase.snakeCase(input)
		case 'kebab':
			return changeCase.kebabCase(input)
		case 'pascal':
			return changeCase.pascalCase(input)
		case 'pascalSnake':
			return changeCase.pascalSnakeCase(input)
	}
}

export const convertFilename = (settings: Settings, input: string) =>
	input
		.split('.')
		.map(e => convertString(settings, e))
		.join('.')

export const rewriteLocalImportPaths = (settings: Settings, content: string): string => {
	// Regular expression to match import statements
	const importRegex = /import\s+(?:[^'"]*?\s+from\s+)?['"](\.\/[^'"]+)['"]/g

	// Replace local import paths using convertFilename
	const updatedCode = content.replace(importRegex, (match, p1: string) => {
		const newFilename = p1
			.split('/')
			.map(e => convertFilename(settings, e))
			.join('/')
		return match.replace(p1, newFilename)
	})

	return updatedCode
}
