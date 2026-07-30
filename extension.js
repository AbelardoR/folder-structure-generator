const vscode = require('vscode');
const { parseTreeText } = require('./parser');
const { countItems, buildStructure } = require('./creator');
const { getWebviewContent } = require('./webview');

function activate(context) {
    context.subscriptions.push(
        vscode.commands.registerCommand('extension.generateStructure', () => {
            const rootPath = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
            if (!rootPath) {
                vscode.window.showErrorMessage('No workspace folder is open');
                return;
            }

            showStructureForm(rootPath);
        })
    );
}

// ── WebView form ─────────────────────────────────────────────────────

/**
 * Open a WebView panel with a form to paste tree text and choose strategy.
 */
function showStructureForm(rootPath) {
    const panel = vscode.window.createWebviewPanel(
        'folderStructureGenerator',
        'Folder Structure Generator',
        vscode.ViewColumn.One,
        { enableScripts: true, retainContextWhenHidden: true }
    );

    panel.webview.html = getWebviewContent();
    panel.webview.onDidReceiveMessage(async (message) => {
        if (message.command === 'generate') {
            const { text, strategy } = message;

            if (!text || !text.trim()) {
                vscode.window.showErrorMessage('Please enter a folder structure.');
                return;
            }

            try {
                const structure = parseTreeText(text);
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

                panel.dispose();
                vscode.window.showInformationMessage(
                    `Structure created — ${totalItems} item(s) processed`
                );
            } catch (err) {
                vscode.window.showErrorMessage(`Error: ${err.message}`);
            }
        } else if (message.command === 'cancel') {
            panel.dispose();
        }
    });
}

function deactivate() { }

module.exports = { activate, deactivate };