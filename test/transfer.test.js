import assert from 'node:assert/strict';
import test from 'node:test';
import { createTransfer } from '../src/transfer.js';

function fixture(send = async data => ({ object: data.object })) {
    const calls = [], downloads = [];
    const transfer = createTransfer({
        getDataObject: element => element.data,
        getFiles: async inputs => inputs.flatMap(input => input.files || []),
        queryElements: ({ element, prefix }) => element[prefix] || [],
        send: async data => { calls.push(data); return send(data); },
        download: async data => downloads.push(data)
    });
    return { ...transfer, calls, downloads };
}

test('nested export queries read each target once and download once', async () => {
    const f = fixture(async data => ({ object: [{ _id: data.object }] }));
    const one = { data: { type: 'object', array: 'apis', object: 'one' } };
    const two = { data: { type: 'object', array: 'apis', object: 'two' } };
    const source = { export: [one, { export: [one, two] }] };
    one.export = [source, { data: one.data }];
    await f.exportData(source);
    assert.equal(f.calls.length, 2);
    assert.equal(f.downloads.length, 1);
    assert.deepEqual(f.downloads[0].flatMap(bundle => bundle.object.map(record => record._id)), ['one', 'two']);
});

test('filtered export starts at zero and reads beyond the displayed page', async () => {
    const filter = { query: { enabled: true }, sort: { name: 1 }, index: 20, limit: 20 };
    const f = fixture(async data => ({ object: Array.from({ length: data.filter.index ? 1 : 500 }, (_, i) => ({ _id: `${data.filter.index + i}` })) }));
    await f.exportData({ data: { type: 'object', array: 'apis', object: '' }, getFilter: async () => filter });
    assert.deepEqual(f.calls.map(data => data.filter.index), [0, 500]);
    assert.deepEqual(f.calls[0].filter.query, filter.query);
    assert.equal(filter.index, 20);
    assert.equal(f.downloads[0][0].object.length, 501);
});

test('export bundles round-trip into the chosen destination without inheriting source database', async () => {
    const record = { _id: 'existing', name: 'Connection', type: 'cloud', url: { $concat: ['$host', '/api'] } };
    const f = fixture(async data => ({ object: data.method.endsWith('.read') ? [record] : [data.object] }));
    const bundles = await f.exportData({ data: { type: 'object', array: 'apis', database: 'dev', object: 'existing' } });
    await f.importData({ import: [{ data: { type: 'object', array: 'apis', database: 'test' } }] }, bundles);
    assert.deepEqual(f.calls[1], { type: 'object', array: 'apis', database: 'test', method: 'object.update', upsert: true, object: record });
    assert.deepEqual(bundles[0].object[0], record);
});

test('plain JSON records import as creates; existing IDs use upsert', async () => {
    const f = fixture();
    await f.importData({ data: { type: 'object', array: 'apis' } }, [{ name: 'new' }, { _id: 'saved' }]);
    assert.deepEqual(f.calls.map(data => data.method), ['object.create', 'object.update']);
});

test('file input imports parse file.src separately from the file metadata', async () => {
    const f = fixture();
    await f.importData({ type: 'file', files: [{ type: 'application/json', name: 'records.json', src: '[{"name":"new"}]' }], import: [{ data: { type: 'object', array: 'apis' } }] });
    assert.deepEqual(f.calls[0].object, { name: 'new' });
});

test('invalid input is rejected before any write', async () => {
    const f = fixture();
    const destination = { data: { type: 'object', array: 'apis' } };
    await assert.rejects(f.importData(destination, [{ name: 'valid' }, null]));
    await assert.rejects(f.importData({ type: 'file', files: [{ src: '{bad json' }] }));
    await assert.rejects(f.importData({}, [{ name: 'missing destination' }]));
    assert.equal(f.calls.length, 0);
});

test('failed reads do not download and failed writes stop subsequent imports', async () => {
    const f = fixture(async () => ({ error: 'failed' }));
    const target = { data: { type: 'object', array: 'apis' } };
    await assert.rejects(f.exportData(target));
    assert.equal(f.downloads.length, 0);
    await assert.rejects(f.importData(target, [{ name: 'first' }, { name: 'second' }]));
    assert.equal(f.calls.length, 2);
});

test('export waits for file objects instead of spreading a pending promise', async () => {
    const f = fixture();
    const file = { name: 'sample.txt', type: 'text/plain', src: 'contents' };
    await f.exportData({ type: 'file', files: [file] });
    assert.deepEqual(f.downloads, [[file]]);
    assert.equal(f.calls.length, 0);
});

test('export does not complete or download before the read finishes', async () => {
    let release;
    const response = new Promise(resolve => { release = resolve; });
    const f = fixture(() => response);
    let completed = false;
    const pending = f.exportData({ data: { type: 'object', array: 'apis' } }).then(() => { completed = true; });
    await Promise.resolve();
    assert.equal(completed, false);
    assert.equal(f.downloads.length, 0);
    release({ object: [{ name: 'done' }] });
    await pending;
    assert.equal(completed, true);
    assert.equal(f.downloads.length, 1);
});
