# Regex Tester

A real-time regular expression testing and debugging tool tailored for DevOps tasks like log parsing, configuration validation, and script development.

## Features
- **Real-time Evaluation**: Matches update instantly as you type your pattern or test string.
- **Visual Highlighting**: Distinct colors for each match in the preview panel.
- **Capture Group Inspection**: Detailed breakdown of numbered capture groups for each match.
- **Standard Flags**: Support for Global (`g`), Case-insensitive (`i`), Multiline (`m`), and Dotall (`s`).
- **DevOps Presets**: One-click examples for common tasks:
  - Email addresses
  - IPv4 addresses
  - URLs
  - Docker tags
  - Kubernetes labels
  - Log levels (ERROR, WARN, etc.)
- **Quick Reference**: Integrated cheatsheet covering common regex syntax.

## Technical Details
- **Browser-Native**: Uses JavaScript's built-in `RegExp` engine.
- **Safety**: Robust error handling for malformed or incomplete regex patterns.
- **Privacy**: Processed entirely on the client side; your data stays in your browser.
