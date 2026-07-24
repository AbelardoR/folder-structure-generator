/**
 * creator.js - Creates folders and files from a parsed structure object.
 *
 * The structure object follows this shape (output from parser.js):
 *
 *   {
 *     "root-folder": {
 *       "file.txt": "",
 *       "subfolder": {
 *         "nested-file.js": ""
 *       }
 *     }
 *   }
 */

const fs = require('fs');
const path = require('path');

/**
 * Conflict resolution strategies.
 */
const ConflictStrategy = {
    SKIP: 'Skip existing',
    MERGE: 'Merge files',
    OVERWRITE: 'Overwrite all',
};

/**
 * Recursively count every item (files + folders) in the structure.
 */
function countItems(structure) {
    let count = 0;
    for (const [, content] of Object.entries(structure)) {
        count++; // count this entry
        if (typeof content === 'object' && !Array.isArray(content)) {
            count += countItems(content);
        }
    }
    return count;
}

/**
 * Ensure a directory exists (creates it recursively if needed).
 */
function ensureDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

/**
 * Create or handle a single file according to the conflict strategy.
 */
function createFile(filePath, content, strategy) {
    if (fs.existsSync(filePath)) {
        switch (strategy) {
            case ConflictStrategy.SKIP:
                return;
            case ConflictStrategy.MERGE:
                if (fs.statSync(filePath).isFile()) {
                    const existing = fs.readFileSync(filePath, 'utf8');
                    fs.writeFileSync(filePath, existing + '\n' + content);
                }
                return;
            case ConflictStrategy.OVERWRITE:
                break; // fall through to write
            default:
                break;
        }
    }
    fs.writeFileSync(filePath, content);
}

/**
 * Walk the nested structure and create every folder/file.
 *
 * @param {string}  basePath   - Root directory to build inside.
 * @param {Object}  structure  - Nested object from parseTreeText().
 * @param {string}  strategy   - One of ConflictStrategy values.
 * @param {Function} onItem    - Called after each item is processed (for progress).
 */
function buildStructure(basePath, structure, strategy, onItem) {
    for (const [name, content] of Object.entries(structure)) {
        const target = path.join(basePath, name);

        if (typeof content === 'object' && !Array.isArray(content)) {
            // It is a folder — recurse into it
            ensureDir(target);
            buildStructure(target, content, strategy, onItem);
        } else {
            // It is a file
            ensureDir(path.dirname(target));
            createFile(target, content || '', strategy);
        }

        if (onItem) onItem();
    }
}

module.exports = { ConflictStrategy, countItems, buildStructure };
