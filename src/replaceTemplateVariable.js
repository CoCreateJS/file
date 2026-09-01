/**
 * Replaces a file-template variable without interpreting JavaScript replacement
 * tokens such as $&, $`, $', or $$. File contents must be stored byte-for-byte.
 */
export function replaceTemplateVariable(template, variable, value) {
    return template.replace(variable, () => value || "");
}

export default replaceTemplateVariable;
