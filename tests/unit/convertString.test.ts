import { describe, expect, it } from 'vitest'
import { convertFilename, convertString, rewriteLocalImportPaths } from '../../src/convertString.js'
import type { Settings } from '../../src/types.js'

describe('convertString utilities', () => {
	const baseSettings: Settings = {
		target: '.',
		projectName: 'app',
		runtime: 'node',
		eventBridge: 'default',
		useWebserver: false,
		fileConvention: 'camel',
		eventConvention: 'camel',
		linter: 'none',
		formatter: 'none',
		type: 'module',
		packageManager: 'npm',
	}

	it('converts string based on file convention', () => {
		const s = { ...baseSettings }
		s.fileConvention = 'snake'
		expect(convertString(s, 'myFile')).toBe('my_file')
		s.fileConvention = 'kebab'
		expect(convertString(s, 'myFile')).toBe('my-file')
		s.fileConvention = 'pascal'
		expect(convertString(s, 'myFile')).toBe('MyFile')
		s.fileConvention = 'pascalSnake'
		expect(convertString(s, 'myFile')).toBe('My_File')
	})

	it('converts filename with dots', () => {
		const s = { ...baseSettings, fileConvention: 'kebab' }
		expect(convertFilename(s, 'MyFile.ts')).toBe('my-file.ts')
	})

	it('rewrites local import paths', () => {
		const s = { ...baseSettings, fileConvention: 'snake' }
		const code = "import foo from './MyFile'"
		const result = rewriteLocalImportPaths(s, code)
		expect(result).toContain("import foo from './my_file'")
	})
})
