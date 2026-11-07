import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import file from '../../../src/client/node/index.js';
import Config from '@cocreate/config';
import { crudClient as crud } from '@cocreate/crud/client';

function fixture(t, send = async (data) => ({ object: [data.object] })) {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'coc-upload-test-'));
    t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
    fs.mkdirSync(path.join(directory, 'src'));
    fs.writeFileSync(path.join(directory, 'src', 'example.txt'), 'example');
    const configPath = path.join(directory, 'CoCreate.config.js');
    const logs = [];
    const exits = [];
    for (const method of ['log', 'warn', 'error']) {
        t.mock.method(console, method, (...args) => logs.push(args.join(' ')));
    }
    t.mock.method(process, 'exit', (code) => exits.push(code));
    const prompt = t.mock.method(Config, 'prompt', async () => ({ organization_id: 'test', apikey: 'test' }));
    const requests = t.mock.method(crud, 'send', send);
    const config = { directories: [{ entry: './src', object: {} }] };
    return { directory, configPath, logs, exits, requests, prompt, config };
}

test('plain upload waits for confirmation before reporting success and exiting', async (t) => {
    let respond;
    let requested;
    const requestStarted = new Promise((resolve) => { requested = resolve; });
    const f = fixture(t, () => {
        requested();
        return new Promise((resolve) => { respond = resolve; });
    });
    const pending = file(f.config, f.configPath, f.directory);
    await requestStarted;
    assert.deepEqual(f.logs, []);
    assert.ok(!f.logs.some((line) => line.startsWith('Uploaded:')));
    assert.deepEqual(f.exits, []);
    respond({ object: [{ _id: 'saved' }] });
    await pending;
    assert.ok(f.logs.some((line) => line.startsWith('Uploaded:')));
    assert.deepEqual(f.logs, [`Uploaded: ${f.directory}/src/example.txt To: /example.txt`]);
    assert.deepEqual(f.exits, [0]);
});

test('empty parent upload config stays quiet without connecting or prompting', async (t) => {
    const f = fixture(t);
    await file({}, f.configPath, f.directory);
    assert.equal(f.requests.mock.callCount(), 0);
    assert.equal(f.prompt.mock.callCount(), 0);
    assert.deepEqual(f.logs, []);
});

test('unmatched files produce no upload messages', async (t) => {
    const f = fixture(t);
    await file(f.config, f.configPath, path.join(f.directory, 'unmatched'));
    assert.equal(f.requests.mock.callCount(), 0);
    assert.deepEqual(f.logs, []);
});

for (const failure of ['server error', 'missing response', 'rejection']) {
    test(`${failure} is never reported as an uploaded file`, async (t) => {
        const f = fixture(t, async () => {
            if (failure === 'rejection') throw new Error('transport failed');
            return failure === 'server error' ? { error: 'write denied' } : undefined;
        });
        await file(f.config, f.configPath, f.directory);
        assert.ok(!f.logs.some((line) => line.startsWith('Uploaded:')));
        assert.ok(f.logs.some((line) => line.startsWith('Upload not confirmed:')));
        assert.deepEqual(f.exits, [1]);
    });
}

test('watch upload confirms the changed file and keeps the process alive', async (t) => {
    const f = fixture(t);
    await file(f.config, f.configPath, path.join(f.directory, 'src', 'example.txt'), { watch: true });
    assert.equal(f.requests.mock.callCount(), 1);
    assert.deepEqual(f.logs, [`Uploaded: ${f.directory}/src/example.txt To: /example.txt`]);
    assert.deepEqual(f.exits, []);
});

test('stalled request stays quiet while awaiting confirmation', async (t) => {
    t.mock.timers.enable({ apis: ['setTimeout'] });
    let respond;
    let requested;
    const requestStarted = new Promise((resolve) => { requested = resolve; });
    const f = fixture(t, () => {
        requested();
        return new Promise((resolve) => { respond = resolve; });
    });
    const pending = file(f.config, f.configPath, f.directory);
    await requestStarted;
    t.mock.timers.tick(10000);
    assert.deepEqual(f.logs, []);
    assert.deepEqual(f.exits, []);
    respond({ object: [{ _id: 'saved' }] });
    await pending;
    assert.deepEqual(f.exits, [0]);
});

function contentFixture(t, name, content) {
    const f = fixture(t);
    fs.rmSync(path.join(f.directory, 'src', 'example.txt'));
    fs.writeFileSync(path.join(f.directory, 'src', name), content);
    f.config.directories[0].object = {
        name: '{{name}}', src: '{{source}}', mirror: '{{source}}',
        pathname: '{{pathname}}', directory: '{{directory}}', path: '{{path}}',
        'content-type': '{{content-type}}'
    };
    return f;
}

for (const [name, content, contentType, encoded] of [
    ['notes.txt', Buffer.from('\ufeffcafé 🌍 $& $` $\' $$'), 'text/plain', false],
    ['module.mjs', Buffer.from('export default { value: "$&" };'), 'text/javascript', false],
    ['image.png', Buffer.from([0, 255, 254, 1]), 'image/png', true],
    ['image.PNG', Buffer.from([0, 255, 254, 1]), 'image/png', true],
    ['icon.svg', Buffer.from('<svg>café</svg>'), 'image/svg+xml', true],
    ['font.WOFF2', Buffer.from([0, 255, 128, 1]), 'font/woff2', true],
    ['notes.custom', Buffer.from('unchanged text'), '', false]
]) {
    test(`uploader prepares ${name} using shared MIME and content helpers`, async t => {
        const f = contentFixture(t, name, content);
        await file(f.config, f.configPath, f.directory);
        assert.equal(f.requests.mock.callCount(), 1);
        const request = f.requests.mock.calls[0].arguments[0];
        const expected = encoded ? `data:${contentType};base64,${content.toString('base64')}` : content.toString('utf8');
        assert.equal(request.object.src, expected);
        assert.equal(request.object.mirror, expected);
        assert.equal(request.object['content-type'], contentType);
        assert.equal(request.object.name, name);
        assert.equal(request.object.pathname, `/src/${name}`);
        assert.equal(request.method, 'object.update');
        assert.equal(request.upsert, true);
        assert.deepEqual(f.exits, [0]);
    });
}

test('uploader resolves a symlink while retaining the uploaded filename MIME type', async t => {
    const content = Buffer.from([0, 255, 254, 1]);
    const f = contentFixture(t, 'image.png', content);
    const link = path.join(f.directory, 'src', 'image.png');
    const target = path.join(f.directory, 'target.bin');
    fs.rmSync(link);
    fs.writeFileSync(target, content);
    fs.symlinkSync(target, link);
    await file(f.config, f.configPath, link);
    const request = f.requests.mock.calls[0].arguments[0];
    assert.equal(request.object.src, 'data:image/png;base64,AP/+AQ==');
    assert.equal(request.object['content-type'], 'image/png');
    assert.deepEqual(f.exits, [0]);
});

for (const name of ['records.json', 'records.JSON']) {
    test(`dataset upload parses ${name} through the shared MIME lookup`, async t => {
        const data = { name: 'example', count: 3 };
        const f = contentFixture(t, name, JSON.stringify(data));
        f.config.directories[0].object = '{{source}}';
        await file(f.config, f.configPath, f.directory);
        assert.deepEqual(f.requests.mock.calls[0].arguments[0].object, data);
        assert.deepEqual(f.exits, [0]);
    });
}
