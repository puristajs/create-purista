export type ParsedArgs = {
	_: string[]
	[key: string]: string | boolean | string[] | undefined
}

export const parseArgs = (argv: string[]): ParsedArgs => {
	const result: ParsedArgs = { _: [] }

	for (let index = 0; index < argv.length; index += 1) {
		const token = argv[index]
		if (!token.startsWith('--')) {
			result._.push(token)
			continue
		}

		const normalized = token.slice(2)
		if (normalized.startsWith('no-')) {
			result[normalized.slice(3)] = false
			continue
		}

		const next = argv[index + 1]
		if (!next || next.startsWith('--')) {
			result[normalized] = true
			continue
		}

		result[normalized] = next
		index += 1
	}

	return result
}
