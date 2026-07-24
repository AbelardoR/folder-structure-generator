/**
 * parser.js - Parses tree-format text into a nested structure object.
 *
 * Two supported formats:
 *
 *   FORMAT 1 – with root wrapper (first line = root folder):
 *     your-theme/
 *     ├── style.css
 *     ├── assets/
 *     │   └── css/
 *     └── index.php
 *
 *   FORMAT 2 – flat (no root wrapper):
 *     style.css
 *     assets/
 *     ├── css/
 *     │   └── style.css
 *     └── images/
 *
 * Folders are identified by a trailing "/" in the name.
 * Files get an empty string as their value.
 */

/**
 * Detect whether the first line is a root-folder wrapper.
 * Heuristic: first line ends with "/" AND the second non-empty line
 * contains a connector (├── or └──), meaning everything is nested.
 */
function hasRootFolder(lines) {
    if (lines.length < 2) return false;
    const first = lines[0].trim();
    const second = lines[1].trim();
    return first.endsWith('/') && /[├└]──/.test(second);
}

/**
 * Parse tree-format text into a nested object.
 * @param {string} text - Raw text with tree-format structure.
 * @returns {Object} Nested object like { "root": { "folder": { "file": "" } } }
 */
function parseTreeText(text) {
    const lines = text.replace(/\r/g, '').split('\n').filter(l => l.trim());
    if (lines.length === 0) return {};

    const rootWrap = hasRootFolder(lines);
    const rootName = rootWrap ? lines[0].trim().replace(/\/$/, '') : null;

    const structure = {};
    // rootObj points to the inner object where top-level items live
    const rootObj = rootWrap
        ? (() => { const o = {}; structure[rootName] = o; return o; })()
        : structure;

    const stack = [{ obj: rootObj, depth: -1 }];
    const startIdx = rootWrap ? 1 : 0;

    for (let i = startIdx; i < lines.length; i++) {
        const line = lines[i];
        const connectorMatch = line.match(/^(.*?)[├└]── (.+)$/);

        if (connectorMatch) {
            // ── Connector line (├── / └──) ──────────────────────
            const prefix = connectorMatch[1];
            const rawName = connectorMatch[2].trim();
            const isFolder = rawName.endsWith('/');
            const name = rawName.replace(/\/$/, '');
            const depth = Math.floor(prefix.length / 4) + 1;

            while (stack.length > 1 && stack[stack.length - 1].depth >= depth) {
                stack.pop();
            }

            const parent = stack[stack.length - 1].obj;

            if (isFolder) {
                const folder = {};
                parent[name] = folder;
                stack.push({ obj: folder, depth });
            } else {
                parent[name] = '';
            }
        } else {
            // ── Bare line (no connector — top-level item) ───────
            const rawName = line.trim();
            if (!rawName) continue;

            const isFolder = rawName.endsWith('/');
            const name = rawName.replace(/\/$/, '');

            // Pop back to the root level (depth -1) so the next
            // connector-based block starts from the right parent.
            while (stack.length > 1 && stack[stack.length - 1].depth >= 0) {
                stack.pop();
            }

            const parent = stack[stack.length - 1].obj;

            if (isFolder) {
                const folder = {};
                parent[name] = folder;
                stack.push({ obj: folder, depth: 0 });
            } else {
                parent[name] = '';
            }
        }
    }

    return structure;
}

module.exports = { parseTreeText };
