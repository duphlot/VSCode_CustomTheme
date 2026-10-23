# WezTerm setup

A frosted-glass WezTerm configuration that reuses the look of the VS Code setup in this repository, plus an interactive `setting` command to tune it.

## Installation

```bash
./install-wezterm.sh
```

The script copies `wezterm.lua` to `~/.wezterm.lua` (an existing different file is backed up first) and links the `setting` command into `~/.local/bin`. Make sure that folder is on your `PATH`. The `setting` command needs [Pillow](https://pypi.org/project/pillow/): `python3 -m pip install Pillow`.

## The `setting` command

Run `setting` in a terminal to open a menu. Use the up and down arrows to select, left and right to adjust, Enter to run an action and `q` to quit. Changes are written to `~/.config/wezterm/state.json` and WezTerm reloads on its own.

| Option | Effect |
| --- | --- |
| Base solidity | Opacity of the solid base color behind the wallpaper. Lower it to see through to the desktop. |
| Image opacity, brightness, dark overlay, white frost | Wallpaper layering, in the same order as the VS Code panel. |
| Image blur, film grain | Blur radius and grain strength baked into the wallpaper. |
| Window blur (macOS) | Blur of the desktop behind a see-through window. Only visible when Base solidity is below 100. |
| Font size, padding | Terminal text size and the space around it. The top padding leaves room for the window buttons. |
| Window width, height | Share of the screen. New windows open at this size and open windows resize when you change it. |
| Choose image | Use any image file as the wallpaper. |
| Import from VSCode | Copy the image, opacity, blur and grain from the Background & Effects extension. |

WezTerm cannot blur images or add grain itself, so `setting` renders the whole stack into `~/.config/wezterm/background_final.jpg`.

## Key bindings

| Keys | Action |
| --- | --- |
| Cmd+Right, Cmd+Down | Split the pane to the right or downwards |
| Opt+Shift+4 | Split the current pane into a 2x2 grid |
| Cmd+Shift+Arrows | Move between panes |
| Opt+W | Close the current pane |

## Optional state keys

`state.json` also accepts `default_cwd`, the directory new shells start in (default: your home directory).

## Troubleshooting

- WezTerm shows a configuration error: run `/Applications/WezTerm.app/Contents/MacOS/wezterm-gui` from another terminal to see the message.
- A duplicated prompt line after resizing the window comes from Powerlevel10k redrawing the prompt. Run `clear` to remove it.
