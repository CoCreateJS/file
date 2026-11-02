const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const vm = require('node:vm');

test('download delegates binary representations to the shared decoder', async t => {
    const helpers = await import('@cocreate/utils/file');
    const source = fs.readFileSync(require.resolve('../../../src/client/node/index.js'), 'utf8');
    const code = source.slice(source.indexOf('async function writeFiles('), source.indexOf('\nexport default async function file('));
    const writeFiles = vm.runInNewContext(`(${code})`, { ...helpers, fs, path, process, console });
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'coc-download-content-'));
    t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
    const bytes = Uint8Array.of(0, 255, 128);
    const values = [
        bytes.buffer, Uint8Array.of(10, ...bytes, 20).subarray(1, 4),
        { type: 'Buffer', data: [...bytes] },
        { _bsontype: 'Binary', value: () => bytes },
        'data:application/octet-stream;base64,AP+A'
    ];
    const written = await writeFiles(values.map((src, index) => ({ pathname: `/${index}.bin`, src })), null, directory);
    assert.equal(written.length, values.length);
    for (const filename of written) assert.deepEqual(fs.readFileSync(filename), Buffer.from(bytes));
    await writeFiles([{ pathname: '/plain.txt', src: 'test' }], null, directory);
    assert.equal(fs.readFileSync(path.join(directory, 'plain.txt'), 'utf8'), 'test');
});
