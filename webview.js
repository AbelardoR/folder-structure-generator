/**
 * webview.js - HTML content for the Folder Structure Generator WebView.
 *
 * Separated from extension.js so it can be edited and optimized independently.
 */

/**
 * Return the HTML for the form WebView.
 */
function getWebviewContent() {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Folder Structure Generator</title>
    <style>
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
            padding: 24px;
            background: var(--vscode-editor-background, #1e1e1e);
            color: var(--vscode-editor-foreground, #d4d4d4);
        }
        h2 {
            font-weight: 600;
            font-size: 20px;
            margin-bottom: 16px;
            color: var(--vscode-editor-foreground, #d4d4d4);
        }
        label {
            display: block;
            margin-bottom: 6px;
            font-weight: 500;
            color: var(--vscode-editor-foreground, #d4d4d4);
        }
        textarea {
            width: 100%;
            min-height: 300px;
            padding: 12px;
            font-family: 'Cascadia Code', 'Fira Code', 'JetBrains Mono', 'Consolas', monospace;
            font-size: 13px;
            line-height: 1.5;
            border: 1px solid var(--vscode-input-border, #3c3c3c);
            border-radius: 6px;
            background: var(--vscode-input-background, #252526);
            color: var(--vscode-input-foreground, #d4d4d4);
            resize: vertical;
            outline: none;
            tab-size: 4;
        }
        textarea:focus {
            border-color: var(--vscode-focusBorder, #007fd4);
            box-shadow: 0 0 0 2px color-mix(in srgb, var(--vscode-focusBorder, #007fd4) 30%, transparent);
        }
        textarea::placeholder {
            color: var(--vscode-input-placeholderForeground, #6e6e6e);
        }
        .strategy-section {
            margin: 20px 0;
        }
        .strategy-section > label {
            margin-bottom: 10px;
        }
        .radio-group {
            display: flex;
            gap: 16px;
            flex-wrap: wrap;
        }
        .radio-group label {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 10px 18px;
            background: var(--vscode-input-background, #252526);
            border: 1px solid var(--vscode-input-border, #3c3c3c);
            border-radius: 8px;
            cursor: pointer;
            font-weight: 400;
            transition: border-color 0.15s, background 0.15s;
        }
        .radio-group label:hover {
            border-color: var(--vscode-focusBorder, #007fd4);
        }
        .radio-group input[type="radio"]:checked + span {
            font-weight: 600;
        }
        .radio-group input[type="radio"]:checked ~ .hint {
            display: block;
        }
        .radio-group input[type="radio"] {
            accent-color: var(--vscode-focusBorder, #007fd4);
        }
        .hint {
            display: none;
            font-size: 12px;
            color: var(--vscode-descriptionForeground, #8a8a8a);
            margin-left: 4px;
        }
        .hint.visible {
            display: inline;
        }
        .button-row {
            display: flex;
            gap: 12px;
            margin-top: 24px;
        }
        button {
            padding: 10px 28px;
            border: none;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: opacity 0.15s;
        }
        button:active {
            opacity: 0.8;
        }
        .btn-primary {
            background: var(--vscode-button-background, #0078d4);
            color: var(--vscode-button-foreground, #ffffff);
        }
        .btn-primary:hover {
            background: var(--vscode-button-hoverBackground, #026ec1);
        }
        .btn-secondary {
            background: var(--vscode-button-secondaryBackground, #3a3d41);
            color: var(--vscode-button-secondaryForeground, #ffffff);
        }
        .btn-secondary:hover {
            background: var(--vscode-button-secondaryHoverBackground, #45494e);
        }
        .format-hint {
            margin-top: 12px;
            padding: 12px 16px;
            background: var(--vscode-textBlockQuote-background, #2d2d2d);
            border-left: 3px solid var(--vscode-textLink-foreground, #3794ff);
            border-radius: 4px;
            font-size: 13px;
            line-height: 1.6;
            color: var(--vscode-descriptionForeground, #8a8a8a);
        }
        .format-hint code {
            background: var(--vscode-textPreformat-background, #3c3c3c);
            padding: 1px 6px;
            border-radius: 3px;
            font-family: 'Consolas', monospace;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <h2>📁 Folder Structure Generator</h2>

    <label for="structureInput">Paste your folder structure:</label>
    <textarea id="structureInput" placeholder="my-project/
├── src/
│   ├── index.js
│   └── styles/
│       └── main.css
├── public/
│   └── index.html
└── package.json"></textarea>

    <div class="format-hint">
        💡 <strong>Supported formats:</strong><br>
        • <strong>With root</strong> — first line is the root folder, children use <code>├──</code> / <code>└──</code><br>
        • <strong>Flat</strong> — top-level items are bare, nested items use <code>├──</code> / <code>└──</code><br>
        Folders must end with <code>/</code>
    </div>

    <div class="strategy-section">
        <label>When a file already exists:</label>
        <div class="radio-group">
            <label>
                <input type="radio" name="strategy" value="Skip existing" checked>
                <span>⏭️ Skip</span>
                <span class="hint">— leave existing files untouched</span>
            </label>
            <label>
                <input type="radio" name="strategy" value="Merge files">
                <span>📎 Merge</span>
                <span class="hint">— append content to existing files</span>
            </label>
            <label>
                <input type="radio" name="strategy" value="Overwrite all">
                <span>📝 Overwrite</span>
                <span class="hint">— replace existing files completely</span>
            </label>
        </div>
    </div>

    <div class="button-row">
        <button class="btn-primary" id="btnOk">✅ Generate</button>
        <button class="btn-secondary" id="btnCancel">Cancel</button>
    </div>

    <script>
        (function () {
            const vscode = acquireVsCodeApi();

            document.getElementById('btnOk').addEventListener('click', () => {
                const text = document.getElementById('structureInput').value;
                const selected = document.querySelector('input[name="strategy"]:checked');
                vscode.postMessage({
                    command: 'generate',
                    text: text,
                    strategy: selected ? selected.value : 'Skip existing',
                });
            });

            document.getElementById('btnCancel').addEventListener('click', () => {
                vscode.postMessage({ command: 'cancel' });
            });

            // Allow Ctrl+Enter / Cmd+Enter to submit
            document.getElementById('structureInput').addEventListener('keydown', (e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                    document.getElementById('btnOk').click();
                }
            });

            // Show hints on selection
            document.querySelectorAll('input[name="strategy"]').forEach(radio => {
                radio.addEventListener('change', () => {
                    document.querySelectorAll('.hint').forEach(h => h.classList.remove('visible'));
                    if (radio.checked) {
                        const hint = radio.closest('label').querySelector('.hint');
                        if (hint) hint.classList.add('visible');
                    }
                });
            });
            // Show hint for default selection
            document.querySelector('input[name="strategy"]:checked').dispatchEvent(new Event('change'));
        })();
    </script>
</body>
</html>`;
}

module.exports = { getWebviewContent };
