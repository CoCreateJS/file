import assert from 'node:assert/strict';
import test from 'node:test';
import { toCSV } from '../../src/client/csv.js';

test('CSV uses column labels and order, ignoring unlisted fields', () => {
    assert.equal(toCSV([{ name: 'A', enabled: false, secret: 'not exported' }], [
        { key: 'enabled', label: 'Enabled' }, { key: 'name', label: 'Name' }
    ]), '"Enabled","Name"\r\n"false","A"');
});
test('CSV escapes quotes, commas and newlines; preserves nested values and zero', () => {
    assert.equal(toCSV([{ name: 'A,"B"\nC', nested: { value: 0 }, tags: ['x','y'], empty: null }],
        [{ key: 'name' }, { key: 'nested.value' }, { key: 'tags' }, { key: 'empty' }]),
        '"name","nested.value","tags","empty"\r\n"A,""B""\nC","0","[""x"",""y""]",""');
});
test('CSV reads array paths and literal dotted keys', () => {
    assert.equal(toCSV([{ values: [{ name: 'first' }], 'a.b': 'literal' }], [{ key: 'values[0].name' }, { key: 'a.b' }]),
        '"values[0].name","a.b"\r\n"first","literal"');
});
test('CSV protects formula-like strings while preserving numeric negatives', () => {
    assert.equal(toCSV([{ text: '=SUM(A1:A2)', number: -2 }], [{ key: 'text' }, { key: 'number' }]),
        '"text","number"\r\n"\'=SUM(A1:A2)","-2"');
});
test('CSV requires explicit columns and emits headings for empty results', () => {
    assert.throws(() => toCSV([], []));
    assert.equal(toCSV([], [{ key: 'name', label: 'Name' }]), '"Name"');
});
