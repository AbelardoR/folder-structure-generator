# 📁 Folder Structure Generator

A VS Code extension that generates complete folder and file structures from **tree-format text** — perfect for quickly scaffolding projects, creating standardized directory layouts, or setting up repetitive folder structures.

## Features

- ✏️ **Paste tree text** — describe your structure using `├──` and `└──` connectors
- 🖥️ **Interactive WebView panel** — a modern form UI to input your structure and choose options
- 📂 **Two input formats** — with or without a root folder wrapper
- ⚡ **Conflict resolution** — choose how to handle existing files (Skip / Merge / Overwrite)
- 🔄 **Progress reporting** — real-time notification while your structure is created
- ⌨️ **Keyboard shortcuts** — `Ctrl+Enter` / `Cmd+Enter` to generate instantly

## Installation

### Method 1: Install from VSIX

1. Build the extension package:
   ```bash
   npm install -g @vscode/vsce
   vsce package
   ```
   This will create a `.vsix` file in your directory.

2. In VS Code:
   - Open the Extensions view (`Ctrl+Shift+X`)
   - Click the **...** menu and select **Install from VSIX**
   - Choose the generated `.vsix` file

### Method 2: Run from Source

1. Clone the repository:
   ```bash
   git clone https://github.com/AbelardoR/folder-structure-generator.git
   cd folder-structure-generator
   ```

2. Install dependencies (if any):
   ```bash
   npm install
   ```

3. Open the project in VS Code:
   ```bash
   code .
   ```

4. Press `F5` to launch the Extension Development Host

## Usage

### Quick Start

1. Open the **Command Palette** (`Ctrl+Shift+P`)
2. Run **"Generate Folder/File Structure"**
3. A WebView panel opens — paste your tree-format structure into the text area
4. Select a **conflict resolution strategy**
5. Click **Generate** (or press `Ctrl+Enter` / `Cmd+Enter`)
6. Watch the progress notification — your structure is created instantly

### Tree Format Reference

The extension accepts two tree-text formats:

#### Format 1 — With root folder wrapper

The first line is the root folder name (must end with `/`). All children use `├──` / `└──` connectors.

```
my-project/
├── src/
│   ├── index.js
│   └── styles/
│       └── main.css
├── public/
│   └── index.html
└── package.json
```

#### Format 2 — Flat (no root wrapper)

Top-level items appear without connectors. Nested items under folders use `├──` / `└──`.

```
src/
├── index.js
└── styles/
    └── main.css
public/
└── index.html
package.json
```

> **Rules:**
> - Folders **must** end with a trailing `/`
> - Files have **no** trailing slash
> - Indentation uses 4 spaces per nesting level
> - Use `├──` for intermediate items, `└──` for the last item in a group

### Conflict Resolution Strategies

When a file already exists in the target location, choose:

| Strategy      | Behavior                                        |
|---------------|-------------------------------------------------|
| ⏭️ **Skip**   | Leave existing files untouched                  |
| 📎 **Merge**  | Append new content to the end of existing files |
| 📝 **Overwrite** | Replace existing files with the new content  |

### Inline Content

You can specify file content directly in the structure. Any file without content is created empty.

```
my-project/
├── index.html
└── src/
    ├── app.js
    ├── style.css
    └── README.md
```

All files are created as empty by default.

## Examples

### Web Application Scaffold

```
my-app/
├── src/
│   ├── components/
│   │   ├── Header.js
│   │   ├── Footer.js
│   │   └── Sidebar.js
│   ├── utils/
│   │   └── helpers.js
│   ├── styles/
│   │   └── main.css
│   └── index.js
├── public/
│   ├── index.html
│   └── favicon.ico
├── package.json
└── README.md
```

### Nested Folder Structure

```
docs/
├── getting-started/
│   ├── installation.md
│   └── configuration.md
├── api/
│   ├── endpoints.md
│   └── errors.md
└── README.md
```

## Troubleshooting

### Common Issues

| Issue                          | Solution                                                     |
|--------------------------------|--------------------------------------------------------------|
| **Command not found**          | Reload VS Code (`Ctrl+R`) and verify the extension is enabled |
| **No workspace folder open**   | Open a folder in VS Code before running the command          |
| **Structure not created**      | Check that folder names end with `/` and indentation is correct |
| **Unexpected nesting**         | Use 4 spaces per level and verify connector characters (`├──` / `└──`) |
| **Permission errors**          | Ensure VS Code has write permissions to the target directory |

## Technical Details

The extension works in three stages:

1. **Parse** — `parser.js` reads the tree text and converts it into a nested JavaScript object
2. **Count** — `creator.js` counts all items for progress reporting
3. **Build** — `creator.js` walks the object and creates every folder and file on disk

## Contributing

Contributions are welcome! Please open issues or pull requests for:

- Bug fixes
- New features
- Documentation improvements
- Additional input format support

## License

MIT License — See [LICENSE](LICENSE) for details