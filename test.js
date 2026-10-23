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
	const {stdout, status} = url(['!@#$%^&*()_+1234567890-=qwertyuiop[]\\|}{POIUYTREWQasdfghjkl;\'\":?/.>,<mnbvcxz'])
	assert.strictEqual(status, 0)
	assert.strictEqual(stdout.trim(), '!%40%23$%25^%26*()_%2b1234567890-%3dqwertyuiop[]\\|}{POIUYTREWQasdfghjkl%3b\'\"%3a%3f/.>,<mnbvcxz')
})

test('-A encodes all characters, including spaces', () => {
	const {stdout, status} = url(['-A', '~ola a b.*'])
	assert.strictEqual(status, 0)
	assert.strictEqual(stdout.trim(), '%7e%6f%6c%61%20%61%20%62%2e%2a')
	assert.strictEqual(url(['--all'], 'ç\n').stdout, '%c3%a7\n')
})

test('default only encodes key characters and non-ASCII', () => {
	const symbols = "a b~!'()*-._ç"
	assert.strictEqual(url([], symbols).stdout, "a+b~!'()*-._%c3%a7")
	assert.strictEqual(url(['-d'], url([], symbols).stdout).stdout, symbols)
	assert.strictEqual(url(['-d', '-A'], url(['-A'], symbols).stdout).stdout, symbols)
})

test('literal + is still escaped so it round-trips', () => {
	assert.strictEqual(url([], 'a+b c').stdout, 'a%2bb+c')
	assert.strictEqual(url(['-d'], 'a%2bb+c').stdout, 'a+b c')
	assert.strictEqual(url(['-d', '-A'], 'a+b').stdout, 'a+b')
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

test('stdin trailing newline is preserved, not added', () => {
	assert.strictEqual(url([], 'a b').stdout, 'a+b')
	assert.strictEqual(url([], 'a b\n').stdout, 'a+b\n')
	assert.strictEqual(url(['-d'], 'a%20b').stdout, 'a b')
	assert.strictEqual(url(['-A'], ' a ').stdout, '%20%61%20')
})
