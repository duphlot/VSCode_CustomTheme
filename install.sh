#!/bin/bash
set -e
HERE="$(cd "$(dirname "$0")" && pwd)"
EXT_DIR="$HOME/.vscode/extensions/ptdung.bg-effects-0.1.0"

cp "$HERE/config/custom.css" "$HERE/config/bg_controller.js" "$HERE/config/webview.css" "$HOME/.vscode/"
rm -rf "$EXT_DIR"
mkdir -p "$EXT_DIR"
rsync -a --exclude 'README.md' --exclude 'media/images' "$HERE/extension/" "$EXT_DIR/"
echo "Installed custom.css, bg_controller.js, webview.css and the bg-effects extension"
