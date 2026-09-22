import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import file from '../src/server.js';
import Config from '@cocreate/config';
import crud from '@cocreate/crud-client';

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
