import assert from "node:assert/strict";
import test from "node:test";

import { replaceTemplateVariable } from "../src/replaceTemplateVariable.js";

test("inserts JavaScript source without interpreting replacement tokens", () => {
    const source = "$&&index > rules.length; $&&!index.includes('-'); $$ $` $'";

    assert.equal(
        replaceTemplateVariable("{{source}}", "{{source}}", source),
        source
    );
});
