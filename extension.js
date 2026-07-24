const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const { parseTreeText } = require('./parser');
const { ConflictStrategy, countItems, buildStructure } = require('./creator');

function activate(context) {
    context.subscriptions.push(
        vscode.commands.registerCommand('extension.generateStructure', async () => {
            try {
                const rootPath = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
                if (!rootPath) {
                    vscode.window.showErrorMessage('No workspace folder is open');
                    return;
                }

                // 1) Find or select a structure file
                const fileUri = await pickStructureFile(rootPath);
                if (!fileUri) return;

                // 2) Choose how to handle existing files
                const strategy = await pickConflictStrategy();
                if (!strategy) return;

                // 3) Parse and generate
                const content = fs.readFileSync(fileUri.fsPath, 'utf8');
                const structure = parseTreeText(content);

                const totalItems = countItems(structure);
                let done = 0;

                await vscode.window.withProgress({
                    location: vscode.ProgressLocation.Notification,
                    title: 'Generating structure…',
                    cancellable: false,
                }, () => new Promise((resolve, reject) => {
                    try {
                        buildStructure(rootPath, structure, strategy, () => {
                            done++;
                        });
                        resolve();
                    } catch (err) {
                        reject(err);
                    }
                }));

                vscode.window.showInformationMessage(
                    `Structure created — ${totalItems} item(s) processed`
                );
            } catch (err) {
                vscode.window.showErrorMessage(`Error: ${err.message}`);
            }
        })
    );
}

// ── Helpers ──────────────────────────────────────────────────────────

/**
 * Search the workspace for *.txt files whose name contains "structure".
 * If found let the user pick one; otherwise show an info message.
 * @returns { vscode.Uri | undefined }
 */
async function pickStructureFile(rootPath) {
    const files = await vscode.workspace.findFiles('**/*structure*.txt');

    if (files.length === 0) {
        vscode.window.showInformationMessage(
            'No *structure*.txt file found in the workspace. ' +
            'Create a .txt file with the tree structure and try again.'
        );
        return undefined;
    }

    const picks = files.map(f => ({
        label: path.relative(rootPath, f.fsPath),
        uri: f,
    }));

    const selected = await vscode.window.showQuickPick(picks, {
        placeHolder: 'Select a structure file (.txt)',
    });

    return selected?.uri;
}

/**
 * Show a quick-pick asking how to handle pre-existing files/folders.
 * @returns { string | undefined } One of ConflictStrategy values.
 */
async function pickConflictStrategy() {
    const options = [
        ConflictStrategy.SKIP,
        ConflictStrategy.MERGE,
        ConflictStrategy.OVERWRITE,
    ];

    return vscode.window.showQuickPick(options, {
        placeHolder: 'How to handle existing files and folders?',
    });
}

function deactivate() { }

module.exports = { activate, deactivate };