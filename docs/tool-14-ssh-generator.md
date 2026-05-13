# SSH Key Generator

A secure, client-side utility for generating high-entropy SSH key pairs using the browser's native Web Crypto API.

## Features
- **Algorithm Support**: Choose between RSA and Ed25519 (modern, fast, and secure).
- **Customizable RSA Size**: Support for 2048, 3072, and 4096-bit keys.
- **Key Comments**: Add optional comments (e.g., `user@hostname`) to your public keys.
- **Privacy First**: No data is sent to any server. Key generation happens entirely in-memory within your browser.
- **PEM Format**: Generates keys in standard PKCS#8 (Private) and SPKI (Public) PEM formats.
- **One-Click Actions**: Easily copy or download private and public keys as files.

## Security Architecture
- **Web Crypto API**: Utilizes the standard `window.crypto.subtle` interface for cryptographically secure random number generation and key derivation.
- **Zero-Persistence**: Keys are not stored in local storage or cookies. Refreshing the page clears all generated sensitive data.

## Usage
1. Select your desired key type (Ed25519 is recommended for modern systems).
2. For RSA, select a bit length (4096 is recommended for high security).
3. (Optional) Enter a comment for the key.
4. Click **Generate New Key Pair**.
5. Save your private key securely and use the public key for authorized_keys or CI/CD secrets.
