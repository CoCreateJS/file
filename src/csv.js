function valueAt(record, key) {
    if (Object.hasOwn(record, key)) return record[key];
    return key.replace(/\[(\d+)\]/g, '.$1').split('.').reduce((value, part) =>
        value != null && Object.hasOwn(Object(value), part) ? value[part] : undefined, record);
}

function cell(value) {
    let text = value == null ? '' : typeof value === 'object' ? JSON.stringify(value) : String(value);
    // Keep spreadsheet software from evaluating imported string cells as formulas.
    if (typeof value === 'string' && /^[\s]*[=+\-@]|^[\t\r\n]/.test(text)) text = "'" + text;
    return '"' + text.replace(/"/g, '""') + '"';
}

export function toCSV(records, columns) {
    if (!Array.isArray(columns) || !columns.length || columns.some(column => typeof column.key !== 'string'))
        throw new Error('CSV export requires columns with field keys.');
    return [columns.map(column => cell(column.label || column.key)).join(','),
        ...records.map(record => columns.map(column => cell(valueAt(record, column.key))).join(','))
    ].join('\r\n');
}
