# VS Code Custom Theme & Environment Setup

[![Platform](https://img.shields.io/badge/Platform-macOS%20%7C%20Linux-black)](https://github.com/duphlot/VSCode_CustomTheme)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![VSCode](https://img.shields.io/badge/VS%20Code-v1.80%2B-007ACC)](https://code.visualstudio.com/)

A modern, glassmorphic, and distraction-free development environment for Visual Studio Code. Combines **ultra-smooth transparent vibrancy**, **refined typography**, **clean context menus**, **curated minimalist icons**, and a **turnkey local LeetCode C++ debugging setup**.

---

## Key Features

- **Transparent Vibrancy and Glassmorphism**: Complete transparency with customized backdrop blur, subtle borders, floating scrollbars, and macOS traffic lights alignment.
- **Refined Icon Aesthetics**: Clean, balanced visual hierarchy powered by Nomo Dark file icons and Adwaita product icons.
- **Beautiful Typography and Cursive Italics**: Optimized for **JetBrains Mono** with semantic token highlighting and italic accents for keywords, parameters, and classes.
- **Turnkey LeetCode C++ Debugging**:
  - Global **1-Click Local Debugging** (`CodeLLDB`) with `F5`.
  - Rich helpers for Singly and Doubly Linked Lists (`ListNode`, `DListNode`), Binary Trees with ASCII visualization (`TreeNode`), BST, and 2D Grids.
  - Over 25+ fast snippets (`lcmain`, `lclist`, `lcdlist`, `lctree`, `lcbst`, `lcgrid`, `lcgraph`, `lctime`).
- **Ultra-Clean Context Menus**: Over 20 redundant context menu items are hidden while preserving 100% of extension capabilities.
- **Streamlined Productivity**: Single-stroke native Finder reveal (`Option + Command + R`), seamless terminal bindings, and zero UI clutter.
- **Safe and Open-Source Friendly**: Contains **no secret keys, personal tokens, or hardcoded machine paths**. Fully parameterized with dynamic `$HOME` variables.

---

## 1-Command Automated Setup

When setting up on a new computer (macOS or Linux), clone the repository and run the installer:

```bash
git clone https://github.com/duphlot/VSCode_CustomTheme.git
cd VSCode_CustomTheme
chmod +x install.sh
./install.sh
```

### What `install.sh` does automatically:
1. **Creates a timestamped backup** of your existing VS Code configuration (`settings.json`, `keybindings.json`, `tasks.json`, `custom.css`) so nothing is lost.
2. **Installs all required extensions** automatically (`Transparent Color Theme`, `Custom CSS and JS`, `Nomo Dark Icons`, `Adwaita Icons`, `VSCode Animations`, `CodeLLDB`, etc.).
3. **Checks and installs** the JetBrains Mono font.
4. **Deploys sanitized settings, keybindings, and tasks** with your local `$HOME` directory dynamically substituted.
5. **Configures the LeetCode local debugging environment** into `~/.vscode/`.

---

## Final Step to Activate Vibrancy

Once the installer finishes:

1. Open **Visual Studio Code**.
2. Press **Command + Shift + P** (macOS) or **Ctrl + Shift + P** (Linux) to open the Command Palette.
3. Type and select:
   ```text
   Enable Custom CSS and JS
   ```
4. Restart VS Code when prompted by the notification in the bottom right corner.

> [!NOTE]
> If VS Code displays a notification saying *"Your Code installation is corrupt"*, click the gear icon on the notification and choose **"Don't Show Again"**. This is normal when injecting custom stylesheets into VS Code.

---

## Repository Structure

```text
VSCode_CustomTheme/
├── install.sh                     # 1-Click cross-machine installer
├── extensions.txt                 # Manifest of required VS Code extensions
├── config/
│   ├── settings.template.json     # Sanitized settings (zero secrets, uses {{HOME}})
│   ├── custom.css                 # Custom glassmorphic CSS stylesheet
│   ├── keybindings.json           # Streamlined shortcuts
│   ├── tasks.json                 # Global build tasks
│   ├── leetcode_env.h             # C++ LeetCode environment and pretty printing
│   ├── leetcode_build.sh          # Smart context-aware compiler script
│   └── leetcode.code-snippets     # 29+ fast code snippets
├── media/                         # Previews and screenshots
└── LICENSE                        # MIT License
```

---

## Privacy and Security Guarantee

This repository is **safe for public GitHub hosting**:
- **Zero API Keys and Tokens**: All sensitive fields (`chat.tools.terminal.autoApprove`, database socket credentials, personal auth tokens) have been completely removed.
- **Dynamic Pathing**: All paths use dynamic placeholders (`{{HOME}}`), automatically converted to your system's `$HOME` during installation.
- **Safe Backups**: The installer never overwrites without creating a safe rollback backup first.

---

## License

Distributed under the [MIT License](LICENSE).
