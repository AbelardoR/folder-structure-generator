# VS Code Folder Structure Generator Extension

## Overview

This extension allows you to generate complete folder and file structures from a JSON definition directly in your VS Code workspace. It's perfect for quickly scaffolding projects, creating standardized directory layouts, or setting up repetitive folder structures.

## Features

- Generate folders and files from JSON definitions
- Interactive JSON editor with syntax highlighting
- Conflict resolution options (Skip/Merge/Overwrite)
- Progress reporting during generation
- Workspace-integrated structure files

## Installation

### Method 1: Install from VSIX

1. Build the extension package:
   ```bash
   npm install -g vsce
   vsce package
   ```
   This will create a `.vsix` file in your directory.

2. In VS Code:
   - Open the Extensions view (`Ctrl+Shift+X`)
   - Click the "..." menu and select "Install from VSIX"
   - Choose the generated `.vsix` file

### Method 2: Install from Source

1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo/vscode-folder-structure-generator.git
   cd vscode-folder-structure-generator
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Open in VS Code:
   ```bash
   code .
   ```

4. Press `F5` to run the extension in debug mode

## Usage

### Basic Usage

1. Open the Command Palette (`Ctrl+Shift+P`)
2. Search for and run "Generate Folder Structure"
3. The extension will:
   - Look for existing `structure.json` files in your workspace
   - Create a new one if none exists
   - Open the JSON file for editing

4. Edit the JSON structure as needed. Example:
   ```json
   {
     "src": {
       "components": ["Button.js", "Header.js"],
       "utils": ["helpers.js"]
     },
     "public": ["index.html", "styles.css"],
     "README.md": "# Project Documentation"
   }
   ```

5. Click the "Generate Structure" button in the status bar (bottom-right)
6. Choose how to handle existing files:
   - **Skip existing**: Keep current files
   - **Merge files**: Combine content (for text files)
   - **Overwrite all**: Replace existing files

7. Watch the progress notification as your structure is generated

### JSON Structure Format

- **Folders**: Defined as objects `{"folder_name": {}}`
- **Files in folders**: Defined as arrays `{"folder": ["file1.txt", "file2.txt"]}`
- **Root files**: Defined as key-value pairs `{"filename.txt": "content"}`

Example:
```json
{
  "assets": {
    "css": ["styles.css", "print.css"],
    "js": ["main.js", "analytics.js"],
    "images": []
  },
  "config": ["settings.json"],
  "index.php": "<?php // Main entry point",
  "README.md": "# Project Documentation\n\nWelcome to my project!"
}
```

## Troubleshooting

### Common Issues

1. **Command not found**:
   - Reload VS Code (`Ctrl+R`)
   - Check the extension is properly installed

2. **JSON parsing errors**:
   - Validate your JSON structure
   - Remove any comments (// or /* */)

3. **Permission errors**:
   - Ensure VS Code has write permissions
   - Check your workspace folder permissions

## Contributing

Contributions are welcome! Please open issues or pull requests for:
- Bug fixes
- New features
- Documentation improvements

## License

MIT License - See [LICENSE](LICENSE) for details