const vscode = require('vscode');
const fs = require('fs');
const path = require('path');


// Store confirmation UI state
let confirmationUI = {
    button: null,
    disposables: []
};

function activate(context) {
    // Register main command only once
    context.subscriptions.push(
        vscode.commands.registerCommand('extension.generateStructure', async () => {
            try {
                // Clear any previous UI
                cleanupConfirmationUI();

                const workspaceFolders = vscode.workspace.workspaceFolders;
                if (!workspaceFolders?.length) {
                    vscode.window.showErrorMessage('No workspace folder is open');
                    return;
                }

                const rootPath = workspaceFolders[0].uri.fsPath;
                const jsonFileUri = await getStructureFile(rootPath);
                if (!jsonFileUri) return;

                const document = await vscode.workspace.openTextDocument(jsonFileUri);
                const editor = await vscode.window.showTextDocument(document);

                setupConfirmationUI(context, rootPath, jsonFileUri);

            } catch (error) {
                vscode.window.showErrorMessage(`Error: ${error.message}`);
            }
        })
    );
}

function cleanupConfirmationUI() {
    if (confirmationUI.button) {
        confirmationUI.button.dispose();
        confirmationUI.button = null;
    }
    confirmationUI.disposables.forEach(d => d.dispose());
    confirmationUI.disposables = [];
}

async function getStructureFile(rootPath) {
    const jsonFiles = await vscode.workspace.findFiles('**/*structure*.json');
    
    if (jsonFiles.length > 0) {
        const filePicks = jsonFiles.map(file => ({
            label: path.relative(rootPath, file.fsPath),
            uri: file
        }));
        
        const selected = await vscode.window.showQuickPick(filePicks, {
            placeHolder: 'Select a structure file to use'
        });
        return selected?.uri;
    }

    // Create new structure file
    const newFileUri = vscode.Uri.file(path.join(rootPath, 'structure.json'));
    const templateContent = `{
  "example_folder": {
    "example_file.txt": "content",
    "subfolder": ["file2.txt"]
  },
  "root_file.txt": ""
}`;
    await vscode.workspace.fs.writeFile(newFileUri, Buffer.from(templateContent));
    return newFileUri;
}

function setupConfirmationUI(context, rootPath, jsonFileUri) {
    // Create status bar button
    confirmationUI.button = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    confirmationUI.button.text = "$(check) Generate Structure";
    confirmationUI.button.tooltip = "Click to generate structure from this JSON";
    
    // Create disposable command
    const confirmDisposable = vscode.commands.registerCommand('extension.confirmStructureGeneration', async () => {
        try {
            const conflictOption = await vscode.window.showQuickPick(
                ['Skip existing', 'Merge files', 'Overwrite all'], 
                { placeHolder: 'How to handle existing files?' }
            );
            if (!conflictOption) return;

            const jsonInput = fs.readFileSync(jsonFileUri.fsPath, 'utf8');
            const structure = parseJson(jsonInput);

            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: "Creating structure...",
                cancellable: true
            }, async (progress, token) => {
                await createStructure(rootPath, structure, progress, token, conflictOption);
            });

            vscode.window.showInformationMessage('Structure created successfully!');
            
        } catch (error) {
            if (error.message !== 'Operation cancelled') {
                vscode.window.showErrorMessage(`Error: ${error.message}`);
            }
        } finally {
            cleanupConfirmationUI();
        }
    });

    confirmationUI.button.command = 'extension.confirmStructureGeneration';
    confirmationUI.button.show();

    // Track editor close
    const closeDisposable = vscode.window.onDidChangeActiveTextEditor(e => {
        if (!e || e.document.uri.fsPath !== jsonFileUri.fsPath) {
            cleanupConfirmationUI();
        }
    });

    confirmationUI.disposables.push(confirmDisposable, closeDisposable);
    context.subscriptions.push(confirmDisposable, closeDisposable);
}


// Helper function to parse JSON with better error messages
function parseJson(jsonInput) {
    try {
        // Remove comments (lines starting with //)
        const jsonWithoutComments = jsonInput.replace(/^\s*\/\/.*$/gm, '');
        return JSON.parse(jsonWithoutComments);
    } catch (error) {
        throw new Error(`Invalid JSON: ${error.message}`);
    }
}


async function createStructure(basePath, structure, progress, token, conflictOption) {
    const totalItems = countItems(structure);
    let processedItems = 0;

    await processStructure(basePath, structure, () => {
        processedItems++;
        if (progress) {
            progress.report({
                message: `Creating items (${processedItems}/${totalItems})`,
                increment: (1 / totalItems) * 100
            });
        }
        if (token && token.isCancellationRequested) {
            throw new Error('Operation cancelled');
        }
    }, conflictOption);
}

function countItems(structure) {
    let count = 0;
    for (const [_, content] of Object.entries(structure)) {
        count++;
        if (typeof content === 'object' && !Array.isArray(content)) {
            count += countItems(content);
        } else if (Array.isArray(content)) {
            count += content.length;
        }
    }
    return count;
}

async function processStructure(basePath, structure, updateProgress, conflictOption) {
    for (const [name, content] of Object.entries(structure)) {
        const currentPath = path.join(basePath, name);

        if (typeof content === 'object' && !Array.isArray(content)) {
            // Folder with nested content
            ensureDirectoryExists(currentPath);
            await processStructure(currentPath, content, updateProgress, conflictOption);
            updateProgress();
        } else if (Array.isArray(content)) {
            // Folder with file list
            ensureDirectoryExists(currentPath);
            for (const file of content) {
                const filePath = path.join(currentPath, file);
                await handleFileCreation(filePath, '', conflictOption);
                updateProgress();
            }
        } else {
            // Single file
            ensureDirectoryExists(path.dirname(currentPath));
            await handleFileCreation(currentPath, content || '', conflictOption);
            updateProgress();
        }
    }
}

async function handleFileCreation(filePath, newContent, conflictOption) {
    if (fs.existsSync(filePath)) {
        switch (conflictOption) {
            case 'Skip existing':
                return; // Skip the file
            case 'Merge files':
                if (fs.statSync(filePath).isFile()) {
                    const existingContent = fs.readFileSync(filePath, 'utf8');
                    fs.writeFileSync(filePath, existingContent + '\n' + newContent);
                }
                return;
            case 'Overwrite all':
                // Fall through to default creation
                break;
        }
    }
    fs.writeFileSync(filePath, newContent);
}

function ensureDirectoryExists(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

function deactivate() {
    cleanupConfirmationUI();
}

module.exports = {
    activate,
    deactivate
};