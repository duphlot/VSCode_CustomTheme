# VSCode Custom Theme

A transparent, frosted-glass setup for Visual Studio Code.

The repository root holds the main theme environment. Three further projects live inside it, each in its own folder:

| Project | Path | What it is |
| --- | --- | --- |
| Theme and environment | `config/`, `install.sh` | Settings, stylesheet, keybindings, tasks and LeetCode C++ tooling, deployed with one command. |
| Transparent setup | `vscode-transparent-setup/` | A step-by-step guide to recreating the frosted-glass look by hand, with a standalone `settings.json` and preview images. |
| Background & Effects | `background-effects/` | A VS Code extension with a side bar panel for wallpaper opacity, overlay, blur, film grain, text shadow, image sizing and wallpaper areas. |
| WezTerm setup | `wezterm/`, `install-wezterm.sh` | A matching frosted-glass WezTerm configuration with an interactive `setting` command. |

## Contents

- [VSCode Custom Theme](#vscode-custom-theme)
  - [Contents](#contents)
  - [Repository layout](#repository-layout)
  - [Where files are installed](#where-files-are-installed)
  - [Installation](#installation)
  - [Features](#features)
  - [Updating after you edit the repository](#updating-after-you-edit-the-repository)
  - [Notes](#notes)
  - [License](#license)

## Repository layout

```
VSCode_CustomTheme/
  install.sh                    Installs the theme environment and the extensions in extensions.txt
  install-extension.sh          Installs the Background & Effects extension and its support files
  install-wezterm.sh            Installs the WezTerm configuration and the setting command
  extensions.txt                VS Code extensions required by install.sh
  config/
    settings.template.json      User settings, with {{HOME}} replaced at install time
    custom.css                  Frosted-glass stylesheet and wallpaper styles
    local.css                   Optional personal styles appended to custom.css (not tracked by git)
    bg_controller.js            Script injected into VS Code that applies the wallpaper effects
    webview.css                 Optional fix for the Claude Code chat background
    keybindings.json            Keyboard shortcuts
    tasks.json                  Global build tasks
    leetcode_env.h              C++ helpers and pretty printers for LeetCode
    leetcode_build.sh           Compiler script used by the debug setup
    leetcode.code-snippets      Code snippets for LeetCode C++
  background-effects/           Background & Effects extension (has its own README)
    package.json
    package.nls.json
    package.nls.vi.json
    extension.js
    media/
  vscode-transparent-setup/     Step-by-step transparent setup guide with a standalone settings.json and previews
  wezterm/                      WezTerm configuration and the setting command (has its own README)
  LICENSE
```

The extension is documented in detail in [background-effects/README.md](background-effects/README.md).
The manual setup is documented in [vscode-transparent-setup/README.md](vscode-transparent-setup/README.md).
The WezTerm setup is documented in [wezterm/README.md](wezterm/README.md).

## Where files are installed

| Installed file | Source in this repository | Purpose |
| --- | --- | --- |
| `~/Library/Application Support/Code/User/settings.json` (macOS) or `~/.config/Code/User/settings.json` (Linux) | `config/settings.template.json` | Global settings. |
| Same folder: `keybindings.json`, `tasks.json` | `config/keybindings.json`, `config/tasks.json` | Shortcuts and tasks. |
| Same folder: `snippets/leetcode.code-snippets` | `config/leetcode.code-snippets` | Snippets. |
| `~/.vscode/custom.css` | `config/custom.css`, plus `config/local.css` when present | Stylesheet loaded by Custom CSS and JS Loader. |
| `~/.vscode/bg_controller.js` | `config/bg_controller.js` | Script loaded by Custom CSS and JS Loader. |
| `~/.vscode/webview.css` | `config/webview.css` | Optional, used through `apc.iframe.style`. |
| `~/.vscode/leetcode_env.h`, `~/.vscode/leetcode_build.sh` | `config/` | LeetCode environment. |
| `~/.vscode/extensions/ptdung.bg-effects-0.1.0/` | `background-effects/` | The Background & Effects extension. |
| `~/.vscode/bg-effects/state.json` | created by the extension | Your wallpaper settings and chosen image. |
| `~/.wezterm.lua` | `wezterm/wezterm.lua` | WezTerm configuration. |
| `~/.local/bin/setting` | `wezterm/setting` | Symbolic link to the WezTerm setting command. |
| `~/.config/wezterm/` | created by `setting` | WezTerm state and the rendered wallpaper. |

## Installation

Clone the repository and run both installers from its root:

```bash
git clone https://github.com/duphlot/VSCode_CustomTheme.git
cd VSCode_CustomTheme
chmod +x install.sh install-extension.sh
./install.sh
./install-extension.sh
```

`install.sh`:

1. Backs up your current `settings.json`, `keybindings.json`, `tasks.json` and `custom.css` into a timestamped `backup_*` folder.
2. Installs every extension listed in `extensions.txt`.
3. Installs the JetBrains Mono font if it is missing (macOS, through Homebrew when available).
4. Writes `settings.json` from the template, replacing `{{HOME}}` with your home directory.
5. Copies keybindings, tasks, snippets, `custom.css` and the LeetCode files.

`install-extension.sh` copies `custom.css`, `bg_controller.js` and `webview.css` into `~/.vscode/` and installs the extension into `~/.vscode/extensions/`.

Then activate the styles:

1. Quit VS Code completely and open it again.
2. Open the Command Palette and run **Enable Custom CSS and JS**.
3. Reload the window when prompted.

VS Code may show a notice that the installation is corrupt. This is expected when custom CSS and JS are injected; choose Don't Show Again.

Two settings are used by the extension and are already present in `config/settings.template.json`:

- `vscode_custom_css.imports` lists `custom.css` and `bg_controller.js`.
- `apc.iframe.style` points to `webview.css`. It needs the APC extension (`drcika.apc-extension`), which is not in `extensions.txt`. Skip it if you do not use the Claude Code chat.

### WezTerm (optional)

```bash
./install-wezterm.sh
```

See [wezterm/README.md](wezterm/README.md) for the `setting` command and key bindings.

### Personal styles

Anything you put in `config/local.css` is appended to `custom.css` by the installers and is ignored by git. Use it for styles that should stay on your machine, for example a custom image for the empty editor area.

## Features

- A fully transparent workbench with frosted-glass blur, subtle borders, floating scrollbars and macOS traffic light alignment.
- JetBrains Mono typography with italic accents for keywords, parameters and classes.
- A wallpaper layer with a side bar panel to adjust opacity, dark overlay, blur, film grain and text shadow, choose your own image, scale it with the window or keep it fixed, and pick which areas of the window show it. The panel is available in English and Vietnamese.
- A matching WezTerm configuration with the same wallpaper and an interactive `setting` menu.
- One-key local debugging for LeetCode C++ with helpers for linked lists, trees, BSTs and grids, plus snippets such as `lcmain`, `lclist`, `lctree` and `lcgrid`.
- A reduced context menu and a single-stroke shortcut to reveal files in Finder.
- No secret keys or tokens in the repository, and no hardcoded home paths: paths are filled in from `$HOME` at install time.

## Updating after you edit the repository

After changing anything in `config/` or `background-effects/`, run:

```bash
./install-extension.sh
```

Then quit and reopen VS Code and run **Enable Custom CSS and JS** again. VS Code updates also remove the injected patch, so repeat that command after each update.

## Notes

- `install.sh` replaces your global `settings.json` with the template after backing it up. Check the backup folder if you want to bring back settings of your own.
- Developed and used on macOS. `install.sh` also supports Linux, but the extension has only been tried on macOS.

## License

Distributed under the [MIT License](LICENSE).
