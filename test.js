'use strict'
const test       = require('node:test')
const assert     = require('node:assert')
const {spawnSync} = require('node:child_process')
const path       = require('node:path')

const cliPath = path.join(__dirname, 'cli.js')

function url (args, stdin) {
	return spawnSync(process.execPath, [cliPath, ...args], {input: stdin, encoding: 'utf8'})
}

test('url encoding', () => {
	const {stdout, status} = url(['just 4n0ther $tr1ng'])
	assert.strictEqual(status, 0)
	assert.strictEqual(stdout.trim(), encodeURIComponent('just 4n0ther $tr1ng'))
})

test('url decoding', () => {
	const {stdout, status} = url(['-d', 'url%E2%80%93encoded%20string'])
	assert.strictEqual(status, 0)
	assert.strictEqual(stdout.trim(), 'url–encoded string')
})

test('reads from stdin', () => {
	const {stdout} = url(['--decode'], 'a%20b\n')
	assert.strictEqual(stdout.trim(), 'a b')
})

test('malformed input fails cleanly instead of crashing', () => {
	for (const bad of ['%zz', '%E0', '100%']) {
		const {stdout, stderr, status} = url(['-d', '-p', bad])
		assert.strictEqual(status, 1)
		assert.strictEqual(stdout.trim(), 'Ciphertext doesn\'t seem to be URL-encoded')
		assert.strictEqual(stderr, '')
	}
})

test('unknown flags are rejected', () => {
	const {status} = url(['--nope', 'x'])
	assert.strictEqual(status, 2)
})
