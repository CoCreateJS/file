const types = new Set(['object', 'array', 'index', 'database', 'storage']);
const scopeKeys = ['storage', 'database', 'array'];

function scope(data) {
    return Object.fromEntries(scopeKeys.filter(key => data?.[key] != null)
        .map(key => [key, data[key]]));
}

function records(value) {
    const result = Array.isArray(value) ? value : [value];
    if (result.some(item => !item || typeof item !== 'object' || Array.isArray(item)))
        throw new Error('Import requires JSON records or export bundles.');
    return result;
}

export function createTransfer({ getDataObject, getFiles, queryElements, send, download }) {
    function targets(source, prefix, visited = new Set()) {
        const result = [];
        for (const element of Array.isArray(source) ? source : [source]) {
            if (visited.has(element)) continue;
            visited.add(element);
            const queried = queryElements({ element, prefix });
            if (queried.length) result.push(...targets(queried, prefix, visited));
            else result.push(element);
        }
        return result;
    }

    async function exportData(source, options = {}) {
        const bundles = [];
        for (const element of targets(source, 'export')) {
            if (element.type === 'file') {
                bundles.push(...await getFiles([element]));
                continue;
            }
            const data = getDataObject(element);
            if (!data?.type) continue;
            const type = data.type === 'key' ? 'object' : data.type;
            if (!types.has(type)) throw new Error('Unsupported export type.');
            const filter = element.getFilter ? structuredClone(await element.getFilter()) : undefined;
            const values = [];
            let index = 0;
            do {
                const request = { ...scope(data), type, method: `${type}.read` };
                if (data[type] !== undefined) request[type] = data[type];
                if (filter) request.filter = { ...filter, index, limit: 500 };
                const response = await send(request);
                if (response?.error || !response || !Array.isArray(response[type]))
                    throw new Error('Export read failed.');
                const page = response[type];
                values.push(...page);
                if (!filter || page.length < 500) break;
                index += page.length;
            } while (true);
            bundles.push({ ...scope(data), type, [type]: values });
        }
        if (bundles.length) await download(bundles, options);
        return bundles;
    }

    async function importData(source, value) {
        if (value === undefined) {
            const fileInputs = [];
            for (const element of Array.isArray(source) ? source : [source]) {
                if (element.type === 'file') fileInputs.push(element);
                else fileInputs.push(...(element.closest('form')?.querySelectorAll('input[type="file"]') || []));
            }
            const files = await getFiles(fileInputs);
            value = files.flatMap(file => records(JSON.parse(file.src)));
        }
        const entries = records(value);
        const destinations = targets(source, 'import').map(getDataObject).filter(data => data?.type);
        if (destinations.length > 1) throw new Error('Choose one import destination.');
        const destination = destinations[0];
        const requests = [];
        // Validate the complete input before sending any writes.
        for (const entry of entries) {
            const bundle = types.has(entry.type) && Object.hasOwn(entry, entry.type);
            const type = bundle ? entry.type : 'object';
            if (destination && type !== (destination.type === 'key' ? 'object' : destination.type))
                throw new Error('Import type does not match the destination.');
            const target = { ...scope(bundle ? entry : {}), ...scope(destination) };
            if (type === 'object' && !target.array)
                throw new Error('Import requires a destination array.');
            for (const record of records(bundle ? entry[type] : entry)) {
                const update = type === 'object' && Boolean(record._id);
                requests.push({ ...target, type, method: `${type}.${update ? 'update' : 'create'}`,
                    ...(update ? { upsert: true } : {}), [type]: record });
            }
        }
        const results = [];
        for (const request of requests) {
            const response = await send(request);
            if (!response || response.error) throw new Error('Import write failed.');
            results.push(response);
        }
        return results;
    }
    return { importData, exportData };
}
