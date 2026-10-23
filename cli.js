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
    -A, --all     Encode all characters, not only key ones (space as %20)
    -d, --decode  Decode URL encoded string
    -p, --plain   Display output without log symbols
  Examples
    ~ ❯❯❯ url "just 4n0ther URL enc0d3d $tr1ng"
    just+4n0ther+URL+enc0d3d+$tr1ng
    ~ ❯❯❯ url -A "~ola a b.*"
    %7e%6f%6c%61%20%61%20%62%2e%2a
    ~ ❯❯❯ url -d url%E2%80%93encoded%20string
    url–encoded string
`

let cli
try {
	cli = parseArgs({
		allowPositionals: true,
		options: {
			all:     {type: 'boolean', short: 'A', default: false},
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

// Mirrors Burp Suite's Decoder. Default is "URL-encode key characters"
// (Ctrl+U): only the characters that break a URL or query string
// (@ # % & + = ; : ?) and anything outside printable ASCII are encoded, and
// space becomes '+'. With -A it is "URL-encode all characters"
// (Ctrl+Shift+U): every UTF-8 byte is encoded, letters included
const percent = bytes => Array.from(bytes, b => '%' + b.toString(16).padStart(2, '0')).join('')

function URLEncode (text) {
	if (flags.all) return percent(Buffer.from(text, 'utf8'))
	return text.replace(/[@#%&+=;:?]|[^\x20-\x7e]+/gu, c => percent(Buffer.from(c, 'utf8')))
		.replace(/ /g, '+')
}

function URLDecode (text) {
	if (!flags.all) text = text.replace(/\+/g, ' ')
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
	display(flags.decode ? URLDecode(text) : URLEncode(text), eol)
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
