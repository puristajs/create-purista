import { describe, expect, it } from 'bun:test'
import { getBooleanArgument, getOneOfArgument, getStringArgument } from '../../src/getSettings.js'

describe('getSettings argument parsing helpers', () => {
	it('returns non-empty string values', () => {
		expect(getStringArgument('node')).toBe('node')
		expect(getStringArgument('')).toBeUndefined()
		expect(getStringArgument(123)).toBeUndefined()
	})

	it('returns only boolean values for boolean args', () => {
		expect(getBooleanArgument(true)).toBe(true)
		expect(getBooleanArgument(false)).toBe(false)
		expect(getBooleanArgument('true')).toBeUndefined()
	})

	it('returns only supported values for enum-like args', () => {
		const allowed = ['node', 'bun'] as const
		expect(getOneOfArgument('node', allowed)).toBe('node')
		expect(getOneOfArgument('npm', allowed)).toBeUndefined()
		expect(getOneOfArgument(true, allowed)).toBeUndefined()
	})
})
