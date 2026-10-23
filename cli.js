#!/usr/bin/env node
'use strict'
const {parseArgs} = require('node:util')
const pkg         = require('./package.json')

const errorSymbol = process.stdout.isTTY && !process.env.NO_COLOR ? '\u001B[31m✖\u001B[39m' : '✖'

const help = `
  ${pkg.description}

  Usage
    ~ ❯❯❯ url [string]
    ~ ❯❯❯ echo [string] | url
  Options
    -d, --decode  Decode URL encoded string
    -p, --plain   Display output without log symbols
  Examples
    ~ ❯❯❯ url "just 4n0ther URL enc0d3d $tr1ng"
    just%204n0ther%20URL%20enc0d3d%20%24tr1ng
    ~ ❯❯❯ url -d url%E2%80%93encoded%20string
    url–encoded string
`

let cli
try {
	cli = parseArgs({
		allowPositionals: true,
		options: {
			decode:  {type: 'boolean', short: 'd', default: false},
			plain:   {type: 'boolean', short: 'p', default: false},
			help:    {type: 'boolean', short: 'h', default: false},
			version: {type: 'boolean', short: 'v', default: false}
		}
	})
} catch (error) {
	console.error(error.message)
	console.error(help)
	process.exit(2)
}

const flags = cli.values
const input = cli.positionals[0]

if (flags.help) {
	console.log(help)
	process.exit(0)
}
if (flags.version) {
	console.log(pkg.version)
	process.exit(0)
}

function URLDecode (text) {
	try {
		return decodeURIComponent(text)
	} catch (_) {
		// Malformed escape sequences (e.g. "%zz", "%E0") are not valid URL encoding
		return null
	}
}

function display (text, eol) {
	if (text !== null) {
		process.stdout.write(text + eol)
	} else {
		const leading = flags.plain ? '' : `${errorSymbol} `
		console.log(leading + 'Ciphertext doesn\'t seem to be URL-encoded')
		process.exit(1)
	}
}

// Only the trailing line break is stripped, and it is echoed back as-is so
// `echo -n x | url` prints no newline while `echo x | url` prints one
function run (text, eol) {
	const match = text.match(/\r?\n$/)
	if (eol === undefined) eol = match ? match[0] : ''
	if (match) text = text.slice(0, -match[0].length)
	display(flags.decode ? URLDecode(text) : encodeURIComponent(text), eol)
}

function readStdin () {
	return new Promise((resolve, reject) => {
		let data = ''
		process.stdin.setEncoding('utf8')
		process.stdin.on('data', chunk => { data += chunk })
		process.stdin.on('end', () => resolve(data))
		process.stdin.on('error', reject)
	})
}

if (!input && process.stdin.isTTY) {
	console.log('Enter string to URL encode/decode')
	process.exit(1)
}
if (input) {
	run(input, '\n')
} else {
	readStdin().then(text => run(text))
}
