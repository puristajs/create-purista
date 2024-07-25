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
