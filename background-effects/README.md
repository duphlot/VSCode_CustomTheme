# Background & Effects

An extension for VS Code that controls a full-window wallpaper: opacity, dark overlay, blur, film grain, text shadow, image sizing, and which parts of the window show the wallpaper. Changes apply live while you drag a slider.

The interface is available in English and Vietnamese and can be switched from the panel itself.

![Wallpaper with the panel closed](media/images/1.png)

## Contents

- [Background \& Effects](#background--effects)
  - [Contents](#contents)
  - [How it works](#how-it-works)
  - [Requirements](#requirements)
  - [Installation](#installation)
    - [Optional: Claude Code chat fix](#optional-claude-code-chat-fix)
  - [Usage](#usage)
    - [Image display](#image-display)
    - [Wallpaper areas](#wallpaper-areas)
  - [Screenshots](#screenshots)
  - [Limitations](#limitations)
  - [Troubleshooting](#troubleshooting)
  - [Project layout](#project-layout)
  - [Uninstall](#uninstall)

## How it works

A VS Code extension cannot change the workbench itself, so the project has two parts that talk to each other:

1. **This extension** adds an Activity Bar icon and a webview panel with the controls. It stores your settings in `~/.vscode/bg-effects/state.json` and serves them on `http://127.0.0.1:38417`.
2. **A script injected into the workbench** (`config/bg_controller.js`, loaded by the Custom CSS and JS Loader extension) polls that address and writes the values into CSS variables. The stylesheet `config/custom.css` turns those variables into the wallpaper, overlay, blur, grain and text shadow.

Opening several VS Code windows is fine: they share the same state file, and whichever window started first serves it.

## Requirements

- Visual Studio Code 1.80 or newer. Developed and used on macOS with VS Code 1.141.
- The [Custom CSS and JS Loader](https://marketplace.visualstudio.com/items?itemName=be5invis.vscode-custom-css) extension (`be5invis.vscode-custom-css`). Without it the panel opens but the wallpaper is not drawn.
- Optional: the [APC](https://marketplace.visualstudio.com/items?itemName=drcika.apc-extension) extension (`drcika.apc-extension`), only needed for the Claude Code chat fix described below.

## Installation

From the repository root, run:

```bash
./install.sh
```

The script copies `custom.css`, `bg_controller.js` and `webview.css` into `~/.vscode/` and installs this extension into `~/.vscode/extensions/ptdung.bg-effects-0.1.0/`.

Then add the files to your VS Code user settings:

```json
{
  "vscode_custom_css.imports": [
    "file:///Users/<you>/.vscode/custom.css",
    "file:///Users/<you>/.vscode/bg_controller.js"
  ]
}
```

Finally:

1. Quit VS Code completely and open it again, so the extension is discovered.
2. Run **Enable Custom CSS and JS** from the Command Palette, then reload the window.

Re-run **Enable Custom CSS and JS** after every VS Code update, because updates overwrite the files the loader patches.

### Optional: Claude Code chat fix

If you use a transparent theme, the sticky header and message bubbles in the Claude Code chat can let text show through from behind. `config/webview.css` gives them a solid background. To use it, set this in your user settings (APC is required):

```json
{
  "apc.iframe.style": "/Users/<you>/.vscode/webview.css"
}
```

Close and reopen the Claude Code tab afterwards.

## Usage

Click the Background & Effects icon in the Activity Bar.

| Control | What it does |
| --- | --- |
| Background opacity | How visible the wallpaper is, from 10% to 100%. |
| Dark overlay | A dark layer over the wallpaper to improve text contrast, from 0% to 85%. |
| Blur | Gaussian blur of the wallpaper, from 0 to 30 px. |
| Film grain | Strength of the grain texture, from 0% to 100%. |
| Text shadow | Strength of the dark outline around text, from 0% to 100%. At 0% the outline is off. |
| Presets | Default, Bright, Film grain and Frosted glass set opacity, overlay, blur and grain together. |
| Wallpaper | Pick any image from your computer. Large images are downscaled to at most 3024 x 1964 before being stored. |
| Image display | See below. |
| Wallpaper areas | Choose which parts of the window show the wallpaper. |
| Language | Switch the panel between English and Vietnamese. |

The reset button in the panel title restores every value above, including image display and wallpaper areas, and goes back to the built-in image. It does not change the language.

### Image display

- **Fit window**: the image is scaled to cover the window and rescales as you resize it.
- **Fixed size**: the image is scaled once to cover your screen and then stays put on the screen. Resizing the window only crops it or reveals more of it, from any edge, and the picture does not slide.

### Wallpaper areas

The wallpaper is one layer behind the whole window. Each area you untick is painted with a solid dark color (`#0b1118`) so the wallpaper no longer shows through it. The areas are the sidebar with the icon bar, the editor, the bottom panel, the secondary side bar, and the title and status bars. Leave everything ticked for a full-window wallpaper, or untick all but the sidebar to confine it there.

![Editor area unticked so only the other areas show the wallpaper](media/images/features/1.png)

## Screenshots

The same panel with different wallpapers and settings.

![Painterly wallpaper](media/images/2.png)

![Photo wallpaper](media/images/3.png)

![Panel open over a warm wallpaper with grain](media/images/4.png)

![Panel open over a dim wallpaper](media/images/5.png)

![Panel open over a grayscale wallpaper](media/images/6.png)

## Limitations

- The wallpaper only appears after VS Code has finished loading, so it can show up a moment after the window opens.
- In Fixed size mode, moving the whole window to another position pans the wallpaper, as if the window were a frame over a fixed picture.
- Fixed size is calculated from the screen size when settings are applied. After moving the window to a screen of a different size, reload the window.
- The extension talks to the injected script over `127.0.0.1:38417`. If another program uses that port, or VS Code blocks the connection, the panel opens but the controls will not change the wallpaper. The port can be changed with the `BG_EFFECTS_PORT` environment variable for the extension host, but the script has the address built in.
- Text shadow does not affect webview content such as the Claude Code chat or Markdown preview.
- The view and command names follow the VS Code display language, while the panel contents follow the language you choose in the panel.

## Troubleshooting

**The icon does not appear in the Activity Bar.** Quit VS Code fully (not only Reload Window) and open it again. Check that `~/.vscode/extensions/ptdung.bg-effects-0.1.0/package.json` exists.

**The panel works but the wallpaper does not change.** Run **Enable Custom CSS and JS** and reload the window. Confirm that both `custom.css` and `bg_controller.js` are listed in `vscode_custom_css.imports`.

**Sliders do nothing after an update.** VS Code updates remove the patch. Run **Enable Custom CSS and JS** again.

**To inspect the script's values.** Open **Help > Toggle Developer Tools**, then in the Console run:

```js
getComputedStyle(document.documentElement).getPropertyValue('--bg-size')
```

## Project layout

```
extension/
  package.json           Extension manifest
  package.nls.json       English strings for the manifest
  package.nls.vi.json    Vietnamese strings for the manifest
  extension.js           Local server and message handling for the panel
  media/
    icon.svg             Activity Bar icon
    panel.js             Panel logic and the English and Vietnamese strings
    panel.css            Panel styles
    images/              Screenshots used by this README
```

The files outside this folder, in the repository root:

```
config/
  custom.css             Wallpaper, overlay, grain and text legibility styles
  bg_controller.js       Script injected into the workbench
  webview.css            Optional fix for the Claude Code chat
install.sh               Copies everything into ~/.vscode
```

## Uninstall

1. Remove the `custom.css` and `bg_controller.js` entries from `vscode_custom_css.imports`, then run **Disable Custom CSS and JS**.
2. Remove `apc.iframe.style` from your settings if you added it.
3. Delete `~/.vscode/extensions/ptdung.bg-effects-0.1.0/` and `~/.vscode/bg-effects/`.
4. Restart VS Code.
