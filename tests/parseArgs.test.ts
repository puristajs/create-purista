import { describe, expect, it } from 'bun:test'
import { parseArgs } from '../src/parseArgs.js'

describe('parseArgs', () => {
	it('parses positional args, flags, and key value pairs', () => {
		const parsed = parseArgs(['./my-app', '--runtime', 'node', '--install', '--no-webserver', '--linter', 'biome'])

		expect(parsed._).toEqual(['./my-app'])
		expect(parsed.runtime).toBe('node')
		expect(parsed.install).toBe(true)
		expect(parsed.webserver).toBe(false)
		expect(parsed.linter).toBe('biome')
	})
})
