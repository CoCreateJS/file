const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const vm = require('node:vm');

test('client MIME normalization selects data-URL mode for PDF with parameters', async () => {
    const helpers = await import('@cocreate/utils/file');
    const source = fs.readFileSync(require.resolve('../../src/client/index.js'), 'utf8');
    const code = source.slice(source.indexOf('async function readFile('), source.indexOf('\nfunction setFiles('));
    const readFile = vm.runInNewContext(`(${code})`, helpers);
    const file = new File([Uint8Array.of(0, 255, 20)], 'document.pdf', { type: 'application/pdf;charset=binary' });
    assert.equal(await readFile(file), file);
    assert.equal(file.src, 'data:application/pdf;charset=binary;base64,AP8U');
});

test('client rejects a failed read without replacing existing contents', async () => {
    const helpers = await import('@cocreate/utils/file');
    const source = fs.readFileSync(require.resolve('../../src/client/index.js'), 'utf8');
    const code = source.slice(source.indexOf('async function readFile('), source.indexOf('\nfunction setFiles('));
    const readFile = vm.runInNewContext(`(${code})`, helpers);
    const file = new File(['image'], 'image.png', { type: 'image/png' });
    file.src = 'previous';
    Object.defineProperty(file, 'arrayBuffer', { value: async () => { throw new Error('Read failed'); } });
    await assert.rejects(readFile(file), /Read failed/);
    assert.equal(file.src, 'previous');
});

